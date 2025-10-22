# backend/app/db/repositories/audit_repo.py
from sqlmodel import Session
from app.db.models.audit import AuditTrail

class AuditRepository:
    def __init__(self, session: Session):
        self.session = session

    def log(self, audit: AuditTrail) -> None:
        self.session.add(audit)
        self.session.commit()