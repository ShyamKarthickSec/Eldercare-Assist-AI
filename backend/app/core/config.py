from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    JWT_SECRET: str = "your-secret-key-for-mvp"  # Replace with a secure key in production
    JWT_ALGORITHM: str = "HS256"
    DATABASE_URL: str = "sqlite:///database.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()