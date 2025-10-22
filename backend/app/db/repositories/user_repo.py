from sqlmodel import Session, select
from app.models.user import User
from app.core.config import settings
from uuid import UUID
from sqlalchemy import create_engine
from fastapi import Depends

engine = create_engine(settings.DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

class UserRepository:
    def __init__(self, session: Session = Depends(get_session)):
        self.session = session

    def get_by_email(self, email: str) -> User | None:
        return self.session.exec(select(User).where(User.email == email)).first()

    def get_by_id(self, user_id: UUID) -> User | None:
        return self.session.get(User, user_id)

    def create(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user