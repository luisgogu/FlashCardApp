import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import SessionLocal
from app import crud, models
from app.push_service import send_web_push
from app.email_service import send_email_notification
from app.gcs_sync import upload_db_to_gcs

scheduler = AsyncIOScheduler()
_dispatched_slots: set[tuple[int, str]] = set()
CATCHUP_WINDOW_SECONDS = 15 * 60  # 15-minute catch-up window for 5-min UptimeRobot pings on Cloud Run


def _get_user_local_now(tz_name: Optional[str]) -> datetime:
    """Returns current datetime in the user's configured timezone, falling back to server time."""
    if tz_name:
        if tz_name.upper() == "UTC":
            return datetime.now(timezone.utc)
        try:
            return datetime.now(ZoneInfo(tz_name))
        except Exception:
            pass
    return datetime.now()


def _match_due_slot(now_dt: datetime, target_hhmm: str) -> Optional[str]:
    """If target_hhmm (HH:MM) occurred within the last CATCHUP_WINDOW_SECONDS,
    returns the canonical slot key 'YYYY-MM-DD HH:MM' for that target occurrence."""
    try:
        parts = target_hhmm.strip().split(":")
        th, tm = int(parts[0]), int(parts[1])
    except Exception:
        return None

    target_today = now_dt.replace(hour=th, minute=tm, second=0, microsecond=0)
    target_yesterday = target_today - timedelta(days=1)

    for candidate in (target_today, target_yesterday):
        elapsed = (now_dt - candidate).total_seconds()
        if 0 <= elapsed <= CATCHUP_WINDOW_SECONDS:
            return candidate.strftime("%Y-%m-%d %H:%M")
    return None


def _send_push_to_user_devices(db, user_id: int, payload: dict):
    subscriptions = db.query(models.PushSubscription).filter(
        models.PushSubscription.user_id == user_id,
        models.PushSubscription.is_active == True
    ).all()

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


def check_and_send_scheduled_push_reminders():
    """
    Periodic cron job executed every minute.
    Checks users with active notifications matching their configured reminder_time (HH:MM).
    Handles two independent notification toggles sharing the same hour:
      1. reminder_enabled: Daily SRS flashcard game reminder (Push / Mail / Push & Mail)
      2. word_notification_enabled: Lock-screen Spanish word push notification with deep-link auto-flip
    """
    db = SessionLocal()
    try:
        candidate_users = db.query(models.User).filter(
            (models.User.reminder_enabled == True) | (models.User.word_notification_enabled == True)
        ).all()

        if not candidate_users:
            return

        if len(_dispatched_slots) > 1000:
            _dispatched_slots.clear()

        any_dispatched = False

        for user in candidate_users:
            target_time = (user.reminder_time or "20:00").strip()
            now_dt = _get_user_local_now(user.timezone)
            slot_key = _match_due_slot(now_dt, target_time)

            if not slot_key:
                continue

            if user.last_notified_slot == slot_key or (user.id, slot_key) in _dispatched_slots:
                continue

            user.last_notified_slot = slot_key
            db.commit()
            _dispatched_slots.add((user.id, slot_key))
            any_dispatched = True

            print(f"[SCHEDULER] Triggering scheduled notifications for slot '{slot_key}' ({user.email})...")

            # BUTTON 1 (INDEPENDENT): Daily SRS Review Game Notification
            if user.reminder_enabled and user.notification_channel != 'off':
                due_cards = crud.get_due_cards(db, user_id=user.id)
                count_due = len(due_cards)

                if count_due == 0:
                    print(f"[SCHEDULER] User {user.email} has 0 cards due for slot '{slot_key}'. Skipping SRS reminder.")
                else:
                    title = "FlashCardApp - Repaso Pendiente"
                    body = f"¡Tienes {count_due} tarjeta(s) pendiente(s) de repasar hoy!"

                    if user.notification_channel in ['mail', 'push_mail']:
                        send_email_notification(
                            to_email=user.email,
                            user_name=user.name,
                            due_count=count_due
                        )

                    if user.notification_channel in ['push', 'push_mail']:
                        srs_payload = {
                            "title": title,
                            "body": body,
                            "icon": "/icon-192x192.png",
                            "badge": "/favicon.svg",
                            "tag": "flashcard-srs-reminder",
                            "url": "/?tab=review"
                        }
                        _send_push_to_user_devices(db, user.id, srs_payload)

            # BUTTON 2 (INDEPENDENT): Lock-Screen Spanish Word Notification (Always Web Push)
            if user.word_notification_enabled:
                card = crud.pick_word_notification_card(db, user_id=user.id)
                if not card:
                    print(f"[SCHEDULER] User {user.email} has 0 total cards. Skipping word notification.")
                else:
                    word_payload = {
                        "title": "🇪🇸 FlashCard del día",
                        "body": f'"{card.text_es}" — Toca para girar y ver su traducción',
                        "icon": "/icon-192x192.png",
                        "badge": "/favicon.svg",
                        "tag": f"flashcard-word-{card.id}",
                        "url": f"/?flashcard_id={card.id}&autoflip=1",
                        "card_id": card.id
                    }
                    _send_push_to_user_devices(db, user.id, word_payload)

        if any_dispatched:
            upload_db_to_gcs()

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
