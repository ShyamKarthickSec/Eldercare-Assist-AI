# backend/tests/test_auth_register.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_success():
    response = client.post("/api/auth/register", json={
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password": "StrongPass1!",
        "role": "PATIENT"
    })
    assert response.status_code == 201
    assert response.json()["message"] == "verification_sent"

# More tests as per spec