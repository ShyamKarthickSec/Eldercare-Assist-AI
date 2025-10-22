# backend/app/services/auth_service.py
from datetime import timedelta, datetime
from uuid import uuid4
from fastapi import Depends, HTTPException, status
from app.db.base import get_session
from sqlmodel import Session
from app.db.repositories.user_repo import UserRepository
from app.db.repositories.token_repo import VerificationTokenRepository
from app.db.repositories.refresh_repo import RefreshTokenRepository
from app.db.repositories.audit_repo import AuditRepository
from app.db.models.verification_token import TokenPurpose, VerificationToken
from app.db.models.audit import AuditAction, AuditTrail
from app.schemas.auth import (
    RegisterRequest,
    TokenRequest,
    LoginRequest,
    RefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserResponse,
    TokenResponse,
    MessageResponse,
    ErrorResponse,
)
from app.core.security import hash_password, verify_password, create_jwt, decode_jwt
from app.core.config import settings
from app.services.email_service import get_email_service, render_template
import secrets
from typing import Any, Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from jose import JWTError

# Initialize rate limiter (shared instance)
limiter = Limiter(key_func=get_remote_address)

class AuthService:
    """Handles authentication-related business logic for the ElderCare Assist AI system."""

    def __init__(self, session: Session = Depends(get_session)):
        self.user_repo = UserRepository(session)
        self.token_repo = VerificationTokenRepository(session)
        self.refresh_repo = RefreshTokenRepository(session)
        self.audit_repo = AuditRepository(session)
        self.email_service = get_email_service()

    async def register(self, data: RegisterRequest, ip: str, user_agent: str) -> MessageResponse:
        """Register a new user and send email verification."""
        if self.user_repo.get_by_email(data.email):
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(error={"code": "EMAIL_ALREADY_USED", "message": "Email already used"}).model_dump(),
            )

        hashed = hash_password(data.password)
        user = User(
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email.lower(),
            password_hash=hashed,
            role=data.role,
        )
        created_user = self.user_repo.create(user)

        token = secrets.token_urlsafe(32)
        token_hash = hash_password(token)
        expires = datetime.utcnow() + timedelta(hours=24)
        verify_token = VerificationToken(
            user_id=created_user.id,
            token_hash=token_hash,
            purpose=TokenPurpose.VERIFY_EMAIL,
            expires_at=expires,
        )
        self.token_repo.create(verify_token)

        link = f"{settings.FRONTEND_ORIGIN}/verify?token={token}"
        html = render_template("verify_email.html", {"link": link, "name": data.first_name})
        await self.email_service.send_email(data.email, "Verify your ElderCare Assist account", html)

        self.audit_repo.log(AuditTrail(user_id=created_user.id, action=AuditAction.REGISTER, ip=ip, user_agent=user_agent))

        return MessageResponse(message="verification_sent")

    async def verify_email(self, data: TokenRequest) -> MessageResponse:
        """Verify a user's email using a token from the verification link."""
        token_hash = hash_password(data.token)
        token = self.token_repo.get_by_hash_and_purpose(token_hash, TokenPurpose.VERIFY_EMAIL)
        if not token:
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(error={"code": "TOKEN_INVALID", "message": "Invalid token"}).model_dump(),
            )

        user = self.user_repo.get_by_id(token.user_id)  # Assuming UserRepository has get_by_id
        if not user:
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(error={"code": "TOKEN_INVALID", "message": "Invalid token"}).model_dump(),
            )

        self.token_repo.consume(token)
        self.user_repo.set_email_verified(user)

        self.audit_repo.log(AuditTrail(user_id=user.id, action=AuditAction.VERIFY_EMAIL))

        return MessageResponse(message="email_verified")

    @limiter.limit("5/15minute")  # Rate limit: 5 attempts per 15 minutes per IP+email
    async def login(self, data: LoginRequest, ip: str, user_agent: str) -> TokenResponse:
        """Authenticate user and issue access/refresh tokens."""
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            self.audit_repo.log(AuditTrail(user_id=user.id if user else None, action=AuditAction.LOGIN_FAIL, ip=ip, user_agent=user_agent))
            raise HTTPException(
                status_code=401,
                detail=ErrorResponse(error={"code": "INVALID_CREDENTIALS", "message": "Invalid credentials"}).model_dump(),
            )

        if not user.is_active or not user.is_email_verified:
            raise HTTPException(
                status_code=403,
                detail=ErrorResponse(error={"code": "FORBIDDEN", "message": "Account not activated or verified"}).model_dump(),
            )

        access_token = create_jwt(str(user.id), user.role.value, timedelta(minutes=settings.ACCESS_EXPIRES_MIN))
        refresh_token = secrets.token_urlsafe(32)
        refresh_jti = str(uuid4())
        expires = datetime.utcnow() + timedelta(days=settings.REFRESH_EXPIRES_DAYS)
        self.refresh_repo.issue(RefreshToken(user_id=user.id, jti=refresh_jti, expires_at=expires))

        self.audit_repo.log(AuditTrail(user_id=user.id, action=AuditAction.LOGIN_SUCCESS, ip=ip, user_agent=user_agent))

        return TokenResponse(access_token=access_token, refresh_token=refresh_token, token_type="bearer")

    async def refresh(self, data: RefreshRequest) -> TokenResponse:
        """Refresh access and rotate refresh tokens."""
        try:
            payload = decode_jwt(data.refresh_token)
            user_id = payload.get("sub")
            if not user_id:
                raise JWTError("Invalid token payload")
        except JWTError:
            raise HTTPException(
                status_code=401,
                detail=ErrorResponse(error={"code": "TOKEN_INVALID", "message": "Invalid refresh token"}).model_dump(),
            )

        user = self.user_repo.get_by_id(UUID(user_id))
        if not user or not self.refresh_repo.is_valid(data.refresh_token, user.id):
            raise HTTPException(
                status_code=401,
                detail=ErrorResponse(error={"code": "TOKEN_INVALID", "message": "Invalid or revoked refresh token"}).model_dump(),
            )

        self.refresh_repo.revoke(data.refresh_token)
        access_token = create_jwt(str(user.id), user.role.value, timedelta(minutes=settings.ACCESS_EXPIRES_MIN))
        new_refresh_token = secrets.token_urlsafe(32)
        new_jti = str(uuid4())
        expires = datetime.utcnow() + timedelta(days=settings.REFRESH_EXPIRES_DAYS)
        self.refresh_repo.issue(RefreshToken(user_id=user.id, jti=new_jti, expires_at=expires))

        return TokenResponse(access_token=access_token, refresh_token=new_refresh_token, token_type="bearer")

    async def forgot_password(self, data: ForgotPasswordRequest, ip: str, user_agent: str) -> MessageResponse:
        """Initiate password reset by sending a reset link (always returns 200)."""
        user = self.user_repo.get_by_email(data.email)
        if user:
            token = secrets.token_urlsafe(32)
            token_hash = hash_password(token)
            expires = datetime.utcnow() + timedelta(minutes=30)
            reset_token = VerificationToken(
                user_id=user.id,
                token_hash=token_hash,
                purpose=TokenPurpose.RESET_PASSWORD,
                expires_at=expires,
            )
            self.token_repo.create(reset_token)

            link = f"{settings.FRONTEND_ORIGIN}/reset?token={token}"
            html = render_template("reset_password.html", {"link": link})
            await self.email_service.send_email(user.email, "Reset your ElderCare Assist password", html)

            self.audit_repo.log(AuditTrail(user_id=user.id, action=AuditAction.FORGOT_PW, ip=ip, user_agent=user_agent))

        return MessageResponse(message="reset_link_sent_if_email_exists")

    async def reset_password(self, data: ResetPasswordRequest) -> MessageResponse:
        """Reset user password using a valid reset token."""
        token_hash = hash_password(data.token)
        token = self.token_repo.get_by_hash_and_purpose(token_hash, TokenPurpose.RESET_PASSWORD)
        if not token:
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(error={"code": "TOKEN_INVALID", "message": "Invalid token"}).model_dump(),
            )

        user = self.user_repo.get_by_id(token.user_id)
        if not user:
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(error={"code": "TOKEN_INVALID", "message": "Invalid token"}).model_dump(),
            )

        self.token_repo.consume(token)
        new_hash = hash_password(data.new_password)
        self.user_repo.update_password(user, new_hash)

        self.audit_repo.log(AuditTrail(user_id=user.id, action=AuditAction.RESET_PW))

        return MessageResponse(message="password_reset_success")

    async def get_me(self, user_id: UUID) -> UserResponse:
        """Retrieve the current user's profile information."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=401,
                detail=ErrorResponse(error={"code": "UNAUTHORIZED", "message": "Invalid user"}).model_dump(),
            )

        return UserResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=user.role,
            is_email_verified=user.is_email_verified,
            created_at=user.created_at,
        )

    async def logout(self, refresh_token: str, user_id: UUID) -> MessageResponse:
        """Invalidate the refresh token to log out the user."""
        if not self.refresh_repo.is_valid(refresh_token, user_id):
            raise HTTPException(
                status_code=401,
                detail=ErrorResponse(error={"code": "TOKEN_INVALID", "message": "Invalid refresh token"}).model_dump(),
            )

        self.refresh_repo.revoke(refresh_token)

        return MessageResponse(message="logout_success")