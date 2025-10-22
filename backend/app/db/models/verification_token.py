# backend/app/db/models/verification_token.py
from sqlmodel import SQLModel, Field, Enum as SQLEnum
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

class TokenPurpose(PyEnum):
    VERIFY_EMAIL = "VERIFY_EMAIL"
    RESET_PASSWORD = "RESET_PASSWORD"

class VerificationToken(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    token_hash: str
    purpose: TokenPurpose = Field(sa_type=SQLEnum(TokenPurpose))
    expires_at: datetime
    used_at: Optional[datetime] = Field(default=None)