# backend/app/main.py
from fastapi import FastAPI
from app.routers import auth_router
from app.db.base import engine, SQLModel
from app.core.config import settings

app = FastAPI(title="ElderCare Assist AI Auth Service")

SQLModel.metadata.create_all(engine)

app.include_router(auth_router.router)

@app.get("/")
def root():
    return {"message": "Welcome to ElderCare Assist AI Auth Service"}