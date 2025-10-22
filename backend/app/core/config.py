# backend/app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import EmailStr, field_validator
import secrets

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///database.db"  # Default to SQLite for dev
    JWT_SECRET: str = secrets.token_hex(32)
    ACCESS_EXPIRES_MIN: int = 15
    REFRESH_EXPIRES_DAYS: int = 7
    EMAIL_SENDER: EmailStr = "shyamksec@gmail.com"
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    RESEND_API_KEY: str | None = None
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    EMAIL_PROVIDER: str = "smtp"  # or "resend"

    @field_validator("EMAIL_PROVIDER")
    @classmethod
    def validate_email_provider(cls, v: str) -> str:
        if v not in ["smtp", "resend"]:
            raise ValueError("EMAIL_PROVIDER must be 'smtp' or 'resend'")
        return v

settings = Settings()