# backend/app/routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
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
from app.services.auth_service import AuthService
from app.core.rate_limit import limiter
from app.core.security import decode_jwt
from typing import Annotated
from uuid import UUID
from jose import JWTError
from fastapi.security import OAuth2PasswordBearer

# OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=MessageResponse, status_code=201)
async def register(data: RegisterRequest, service: Annotated[AuthService, Depends()], request: Request):
    """Register a new user and send verification email."""
    return await service.register(data, request.client.host, request.headers.get("user-agent"))

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(data: TokenRequest, service: Annotated[AuthService, Depends()]):
    """Verify user email with a token from the verification link."""
    return await service.verify_email(data)

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/15minute")  # Rate limit: 5 attempts per 15 minutes per IP+email
async def login(data: LoginRequest, service: Annotated[AuthService, Depends()], request: Request):
    """Authenticate user and issue access/refresh tokens."""
    return await service.login(data, request.client.host, request.headers.get("user-agent"))

@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, service: Annotated[AuthService, Depends()]):
    """Refresh access token and rotate refresh token."""
    return await service.refresh(data)

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: ForgotPasswordRequest, service: Annotated[AuthService, Depends()], request: Request):
    """Send password reset link (always returns 200)."""
    return await service.forgot_password(data, request.client.host, request.headers.get("user-agent"))

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(data: ResetPasswordRequest, service: Annotated[AuthService, Depends()]):
    """Reset user password with a valid reset token."""
    return await service.reset_password(data)

@router.get("/me", response_model=UserResponse)
async def get_me(
    service: Annotated[AuthService, Depends()],
    token: Annotated[str, Depends(oauth2_scheme)],
    user_id: UUID = Depends(lambda x: UUID(decode_jwt(token)["sub"]) if decode_jwt(token).get("sub") else None),
):
    """Retrieve the current user's profile information."""
    try:
        payload = decode_jwt(token)
        user_id = UUID(payload["sub"])
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=401,
            detail=ErrorResponse(error={"code": "INVALID_TOKEN", "message": "Invalid authentication token"}).model_dump(),
        )
    return await service.get_me(user_id)

@router.post("/logout", response_model=MessageResponse)
async def logout(
    refresh_token: str,
    service: Annotated[AuthService, Depends()],
    token: Annotated[str, Depends(oauth2_scheme)],
    user_id: UUID = Depends(lambda x: UUID(decode_jwt(token)["sub"]) if decode_jwt(token).get("sub") else None),
):
    """Invalidate the refresh token to log out the user."""
    try:
        payload = decode_jwt(token)
        user_id = UUID(payload["sub"])
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=401,
            detail=ErrorResponse(error={"code": "INVALID_TOKEN", "message": "Invalid authentication token"}).model_dump(),
        )
    return await service.logout(refresh_token, user_id)