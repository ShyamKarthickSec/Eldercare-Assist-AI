# backend/app/db/repositories/user_repo.py
from sqlmodel import select, Session
from app.db.models.user import User, Role
from typing import Optional

class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower())
        return self.session.exec(stmt).first()

    def create(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def set_email_verified(self, user: User) -> None:
        user.is_email_verified = True
        user.is_active = True
        user.updated_at = datetime.utcnow()
        self.session.commit()

    def update_password(self, user: User, new_hash: str) -> None:
        user.password_hash = new_hash
        user.updated_at = datetime.utcnow()
        self.session.commit()