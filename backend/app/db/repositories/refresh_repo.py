# backend/app/db/repositories/refresh_repo.py
from sqlmodel import select, Session
from app.db.models.refresh_token import RefreshToken
from typing import Optional
from datetime import datetime

class RefreshTokenRepository:
    def __init__(self, session: Session):
        self.session = session

    def issue(self, refresh: RefreshToken) -> RefreshToken:
        self.session.add(refresh)
        self.session.commit()
        self.session.refresh(refresh)
        return refresh

    def is_valid(self, jti: str, user_id: UUID) -> bool:
        stmt = select(RefreshToken).where(
            RefreshToken.jti == jti,
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.utcnow()
        )
        return bool(self.session.exec(stmt).first())

    def revoke(self, jti: str) -> None:
        stmt = select(RefreshToken).where(RefreshToken.jti == jti)
        token = self.session.exec(stmt).first()
        if token:
            token.revoked_at = datetime.utcnow()
            self.session.commit()