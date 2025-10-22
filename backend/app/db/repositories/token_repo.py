# backend/app/db/repositories/token_repo.py
from sqlmodel import select, Session
from app.db.models.verification_token import VerificationToken, TokenPurpose
from typing import Optional
from datetime import datetime

class VerificationTokenRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, token: VerificationToken) -> VerificationToken:
        self.session.add(token)
        self.session.commit()
        self.session.refresh(token)
        return token

    def get_by_hash_and_purpose(self, token_hash: str, purpose: TokenPurpose) -> Optional[VerificationToken]:
        stmt = select(VerificationToken).where(
            VerificationToken.token_hash == token_hash,
            VerificationToken.purpose == purpose,
            VerificationToken.used_at.is_(None),
            VerificationToken.expires_at > datetime.utcnow()
        )
        return self.session.exec(stmt).first()

    def consume(self, token: VerificationToken) -> None:
        token.used_at = datetime.utcnow()
        self.session.commit()