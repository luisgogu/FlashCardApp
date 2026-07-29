import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import SessionLocal
from app import crud, models
from app.push_service import send_web_push
from app.email_service import send_email_notification

scheduler = AsyncIOScheduler()

def check_and_send_scheduled_push_reminders():
    """
    Periodic cron job executed every minute.
    Checks users with active notifications matching the current time (HH:MM).
    Dispatches Web Push and/or Email based on user's notification_channel selection.
    """
    now_str = datetime.now().strftime("%H:%M")
    db = SessionLocal()
    try:
        # Find users with reminders enabled for this minute and channel != 'off'
        users_due = db.query(models.User).filter(
            models.User.reminder_enabled == True,
            models.User.reminder_time == now_str,
            models.User.notification_channel != 'off'
        ).all()

        if not users_due:
            return

        print(f"[SCHEDULER] Processing daily reminders at {now_str} for {len(users_due)} user(s)...")

        for user in users_due:
            due_cards = crud.get_due_cards(db, user_id=user.id)
            count_due = len(due_cards)

            title = "FlashCardApp - Repaso Pendiente" if count_due > 0 else "FlashCardApp"
            body = f"¡Tienes {count_due} tarjetas pendientes de repasar hoy!" if count_due > 0 else "¡Felicidades! Estás al día con tus repasos."

            # 1. SEND EMAIL NOTIFICATION IF CHANNEL IS 'mail' OR 'push_mail'
            if user.notification_channel in ['mail', 'push_mail']:
                send_email_notification(
                    to_email=user.email,
                    user_name=user.name,
                    due_count=count_due
                )

            # 2. SEND WEB PUSH NOTIFICATION IF CHANNEL IS 'push' OR 'push_mail'
            if user.notification_channel in ['push', 'push_mail']:
                subscriptions = db.query(models.PushSubscription).filter(
                    models.PushSubscription.user_id == user.id,
                    models.PushSubscription.is_active == True
                ).all()

                payload = {
                    "title": title,
                    "body": body,
                    "icon": "/icon-192x192.png",
                    "badge": "/favicon.svg",
                    "url": "/"
                }

                for sub in subscriptions:
                    sub_info = {
                        "endpoint": sub.endpoint,
                        "keys": {
                            "p256dh": sub.p256dh,
                            "auth": sub.auth
                        }
                    }
                    success = send_web_push(sub_info, payload)
                    if not success:
                        sub.is_active = False
                        db.commit()

    except Exception as e:
        print(f"[SCHEDULER] Error in check_and_send_scheduled_push_reminders: {e}")
    finally:
        db.close()

def start_scheduler():
    """Starts the APScheduler cron job."""
    if not scheduler.running:
        scheduler.add_job(
            check_and_send_scheduled_push_reminders,
            'cron',
            minute='*', # Check every minute
            id='push_daily_reminder_job',
            replace_existing=True
        )
        scheduler.start()
        print("[SCHEDULER] APScheduler started successfully.")

def stop_scheduler():
    """Stops APScheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("[SCHEDULER] APScheduler stopped.")
