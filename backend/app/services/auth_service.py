# app/services/auth_service.py
from app.db.repositories.user_repo import UserRepository
from app.models.user import User, Role
from app.core.config import settings
from app.core.security import verify_password, get_password_hash
from fastapi import Depends, HTTPException, status, Form
import jwt  # Changed from 'from jose import jwt'
from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional

class AuthService:
    def __init__(self, user_repo: UserRepository = Depends(UserRepository)):
        self.user_repo = user_repo

    async def register(self, first_name: str, last_name: str, email: str, password: str):
        if self.user_repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        password_hash = get_password_hash(password)
        user = User(first_name=first_name, last_name=last_name, email=email, password_hash=password_hash)
        self.user_repo.create(user)
        return {"message": "User registered successfully"}

    async def login(self, email: str, password: str):
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        access_token = self._create_access_token(user.id)
        return {
            "access_token": access_token["token"],
            "token_type": "bearer"
        }

    def _create_access_token(self, user_id: UUID) -> dict:
        expire = datetime.utcnow() + timedelta(minutes=30)  # 30-minute expiry for MVP
        payload = {
            "sub": str(user_id),
            "exp": expire,
            "type": "access"
        }
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        return {"token": token, "expires_at": expire}