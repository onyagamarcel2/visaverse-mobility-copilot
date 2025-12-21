from datetime import date, timedelta
import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.main import app

settings.MOCK_MODE = True
settings.OPENAI_API_KEY = None

client = TestClient(app)


def _sample_profile():
    today = date.today()
    return {
        "origin_country": "cm",
        "destination_country": "fr",
        "purpose": "STUDY",
        "planned_departure_date": today.isoformat(),
        "duration_months": 6,
        "passport_expiry_date": (today + timedelta(days=365)).isoformat(),
        "has_sponsor": True,
        "proof_of_funds_level": "HIGH",
        "language": "EN",
        "notes": "Automated smoke profile",
    }


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_plan_endpoint_returns_plan_out():
    payload = _sample_profile()
    response = client.post("/api/plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["confidence"] >= 0
    assert len(data["timeline"]) > 0
    assert len(data["documents"]) > 0


def test_chat_endpoint_returns_answer():
    payload = {"message": "How long does processing take?", "profile": _sample_profile()}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["answer"], str) and data["answer"].strip() != ""
    assert "suggested_questions" in data
