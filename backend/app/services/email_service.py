# backend/app/services/email_service.py
from abc import ABC, abstractmethod
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from resend import Resend
from app.core.config import settings
from jinja2 import Template
from pathlib import Path
from typing import Dict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class EmailService(ABC):
    @abstractmethod
    async def send_email(self, to: str, subject: str, html: str):
        pass

class SMTPEmailService(EmailService):
    async def send_email(self, to: str, subject: str, html: str):
        conf = ConnectionConfig(
            MAIL_USERNAME=settings.SMTP_USER,
            MAIL_PASSWORD=settings.SMTP_PASSWORD,
            MAIL_FROM=settings.EMAIL_SENDER,
            MAIL_PORT=settings.SMTP_PORT,
            MAIL_SERVER=settings.SMTP_HOST,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
        )
        fm = FastMail(conf)
        message = MessageSchema(
            subject=subject,
            recipients=[to],
            body=html,
            subtype="html"
        )
        await fm.send_message(message)

class ResendEmailService(EmailService):
    def __init__(self):
        self.client = Resend(api_key=settings.RESEND_API_KEY)

    async def send_email(self, to: str, subject: str, html: str):
        self.client.emails.send({
            "from": settings.EMAIL_SENDER,
            "to": to,
            "subject": subject,
            "html": html,
        })

def get_email_service() -> EmailService:
    if settings.EMAIL_PROVIDER == "resend":
        return ResendEmailService()
    return SMTPEmailService()

def render_template(template_name: str, context: Dict) -> str:
    template_path = BASE_DIR / "app" / "utils" / "emails" / "templates" / template_name
    with open(template_path, "r") as f:
        template = Template(f.read())
    return template.render(context)