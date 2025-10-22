from fastapi import FastAPI, Depends, Form
from app.services.auth_service import AuthService
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ElderCare Assist AI Auth MVP")

# CORS configuration (allow all origins for MVP)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register")
async def register(
    auth_service: AuthService = Depends(),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    """Register a new user"""
    return await auth_service.register(first_name, last_name, email, password)

@app.post("/api/auth/login")
async def login(
    auth_service: AuthService = Depends(),
    email: str = Form(...),
    password: str = Form(...)
):
    """Login user and return JWT token"""
    return await auth_service.login(email, password)

@app.get("/")
async def root():
    return {"message": "ElderCare Assist AI Auth MVP - Ready!"}

@app.get("/docs")
async def docs_redirect():
    return {"message": "Visit /docs for Swagger UI"}