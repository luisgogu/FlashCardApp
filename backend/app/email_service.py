import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from dotenv import load_dotenv

# Load environment variables from .env file in backend directory
load_dotenv()

logger = logging.getLogger(__name__)

def get_smtp_config():
    return {
        "host": os.getenv("SMTP_HOST", "").strip(),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", "").strip(),
        "password": os.getenv("SMTP_PASSWORD", "").strip(),
        "from_email": os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USER", "no-reply@flashcardapp.com")).strip()
    }


def build_email_template(user_name: str, due_count: int) -> str:
    """Renders a beautiful HTML email template in Sand/Linen aesthetic."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #FAF8F5;
                color: #2C2621;
                margin: 0;
                padding: 20px;
            }}
            .card {{
                max-width: 480px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #E6E0D4;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }}
            .logo {{
                display: inline-block;
                background-color: #2C2621;
                color: #FAF8F5;
                font-weight: bold;
                padding: 8px 16px;
                border-radius: 12px;
                margin-bottom: 20px;
                font-size: 14px;
            }}
            .title {{
                font-size: 20px;
                font-weight: bold;
                color: #2C2621;
                margin-bottom: 10px;
            }}
            .badge {{
                display: inline-block;
                background-color: #C86D51;
                color: #ffffff;
                font-weight: bold;
                font-size: 13px;
                padding: 4px 12px;
                border-radius: 99px;
                margin: 15px 0;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #F0EBE1;
                font-size: 11px;
                color: #7C746A;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">FlashCardApp</div>
            <div class="title">¡Hola {user_name}! / Hello {user_name}!</div>
            <p style="color: #7C746A; font-size: 14px; line-height: 1.5;">
                Tienes tarjetas listas para tu repaso diario en FlashCardApp.<br>
                <em>You have cards ready for your daily review on FlashCardApp.</em>
            </p>
            <div>
                <span class="badge">{due_count} tarjetas pendientes / due cards</span>
            </div>
            <p style="color: #7C746A; font-size: 13px;">
                Dedica 2 minutos hoy para mantener tu vocabulario fresco en la memoria a largo plazo.
            </p>
            <div class="footer">
                Desarrollado con cariño por Luis González 👨‍💻❤️ &bull; FlashCardApp PWA
            </div>
        </div>
    </body>
    </html>
    """


def send_email_notification(to_email: str, user_name: str, due_count: int, is_test: bool = False) -> tuple[bool, bool]:
    """
    Sends an email notification via SMTP.
    Returns tuple: (success: bool, is_mock: bool)
    """
    config = get_smtp_config()
    subject = f"[FlashCardApp] ¡Tienes {due_count} tarjetas para repasar hoy!" if not is_test else "[FlashCardApp] Notificación de prueba por correo"
    html_body = build_email_template(user_name=user_name, due_count=due_count)

    # Logging fallback if SMTP is not configured
    if not config["host"] or not config["user"]:
        logger.info(
            f"[EMAIL MOCK DELIVERED] To: {to_email} | Subject: {subject} | Due Cards: {due_count}"
        )
        print(f"📧 [EMAIL MOCK SIMULATION DISPATCHED TO {to_email}] Subject: {subject}")
        return True, True  # success=True, is_mock=True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = config["from_email"]
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        if config["port"] == 465:
            with smtplib.SMTP_SSL(config["host"], config["port"], timeout=10) as server:
                server.login(config["user"], config["password"])
                server.sendmail(config["from_email"], to_email, msg.as_string())
        else:
            with smtplib.SMTP(config["host"], config["port"], timeout=10) as server:
                server.starttls()
                server.login(config["user"], config["password"])
                server.sendmail(config["from_email"], to_email, msg.as_string())

        logger.info(f"Email sent successfully via REAL SMTP to {to_email}")
        print(f"[REAL SMTP EMAIL DELIVERED TO {to_email}] Subject: {subject}")
        return True, False  # success=True, is_mock=False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        print(f"[ERROR] Error enviando email a {to_email}: {e}")
        return False, False
