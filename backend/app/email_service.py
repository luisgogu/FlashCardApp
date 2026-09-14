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
        "host": os.getenv("SMTP_HOST", "smtp.gmail.com").strip(),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", "luisgogu2001@gmail.com").strip(),
        "password": os.getenv("SMTP_PASSWORD", "nfvv qnzj eded swxa").strip(),
        "from_email": os.getenv("SMTP_FROM_EMAIL", "FlashCardApp <luisgogu2001@gmail.com>").strip()
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
                FlashCardApp &bull; Desarrollada por Luis González
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


def build_password_reset_email_template(user_name: str, reset_link: str, lang: str = "es") -> tuple[str, str]:
    """
    Renders subject and HTML email template in Sand/Linen aesthetic for password recovery.
    Supports 'es' (Spanish) and 'en' (English).
    Returns tuple: (subject: str, html_body: str).
    """
    is_en = (lang or "es").strip().lower().startswith("en")

    if is_en:
        subject = "[FlashCardApp] Reset your account password"
        title = "Password Recovery 🔑"
        greeting = f"Hello <strong>{user_name}</strong>! We received a request to reset your FlashCardApp password."
        subtext = "Click the button below to choose a new password and regain access to your account without losing your cards:"
        btn_text = "Reset my password"
        security_title = "Security:"
        security_text = "This link is personal and will expire in <strong>30 minutes</strong>.<br><br>If you did not request this change, you can safely ignore this email. Your current password will remain secure."
        fallback_text = "If the button does not work, copy and paste this link into your browser:"
        footer_text = "FlashCardApp &bull; Made by Luis González"
    else:
        subject = "[FlashCardApp] Restablece tu contraseña de acceso"
        title = "Recuperación de Contraseña 🔑"
        greeting = f"¡Hola <strong>{user_name}</strong>! Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en FlashCardApp."
        subtext = "Haz clic en el siguiente botón para elegir una nueva contraseña y recuperar tu acceso de inmediato sin perder tus tarjetas:"
        btn_text = "Restablecer mi contraseña"
        security_title = "Seguridad:"
        security_text = "Este enlace es personal y caducará en <strong>30 minutos</strong>.<br><br>Si no has solicitado este cambio, ignora este mensaje. Tu contraseña actual seguirá siendo válida y segura."
        fallback_text = "Si el botón no funciona, copia y pega este enlace en tu navegador:"
        footer_text = "FlashCardApp &bull; Desarrollada por Luis González"


    html_body = f"""
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
                margin-bottom: 12px;
            }}
            .btn-reset {{
                display: inline-block;
                background-color: #C86D51;
                color: #ffffff !important;
                font-weight: bold;
                font-size: 14px;
                padding: 12px 24px;
                border-radius: 12px;
                text-decoration: none;
                margin: 20px 0;
                box-shadow: 0 2px 6px rgba(200, 109, 81, 0.3);
            }}
            .note-box {{
                background-color: #FAF8F5;
                border: 1px solid #E6E0D4;
                border-radius: 12px;
                padding: 12px 16px;
                font-size: 12px;
                color: #7C746A;
                margin-top: 15px;
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
            <div class="title">{title}</div>
            <p style="color: #2C2621; font-size: 14px; line-height: 1.5;">
                {greeting}
            </p>
            <p style="color: #7C746A; font-size: 13px; line-height: 1.5;">
                {subtext}
            </p>
            <div style="text-align: center;">
                <a href="{reset_link}" class="btn-reset" target="_blank">{btn_text}</a>
            </div>
            <div class="note-box">
                ⏱️ <strong>{security_title}</strong> {security_text}
            </div>
            <p style="color: #A0988E; font-size: 11px; margin-top: 15px; word-break: break-all;">
                {fallback_text}<br>
                <a href="{reset_link}" style="color: #C86D51;">{reset_link}</a>
            </p>
            <div class="footer">
                {footer_text}
            </div>
        </div>
    </body>
    </html>
    """
    return subject, html_body


def send_password_reset_email(to_email: str, user_name: str, reset_link: str, lang: str = "es") -> tuple[bool, bool]:
    """
    Sends a password reset email via SMTP in user's preferred language ('es' | 'en').
    Returns tuple: (success: bool, is_mock: bool)
    """
    config = get_smtp_config()
    subject, html_body = build_password_reset_email_template(user_name=user_name, reset_link=reset_link, lang=lang)

    if not config["host"] or not config["user"]:
        logger.info(
            f"[PASSWORD RESET MOCK DELIVERED] To: {to_email} | Subject: {subject} | Reset Link: {reset_link} | Lang: {lang}"
        )
        print(f"📧 [PASSWORD RESET MOCK TO {to_email} ({lang})] Reset Link: {reset_link}")
        return True, True

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

        logger.info(f"Password reset email ({lang}) sent successfully via SMTP to {to_email}")
        print(f"[REAL SMTP RESET EMAIL DELIVERED TO {to_email} ({lang})]")
        return True, False
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")
        print(f"[ERROR] Error enviando email de recuperación a {to_email}: {e}")
        return False, False


