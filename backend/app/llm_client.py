import json
from datetime import datetime
from typing import List

import httpx

from .config import settings
from .prompts import build_prompt
from .schemas import PlanOut, ProfileIn, RiskItem, SourceRef


MOCK_SUMMARY = {
    "title": "Visa preparation plan",
    "key_advice": [
        "Book visa appointment early and align documents with destination requirements.",
        "Show clear financial coverage and travel intent with supporting evidence.",
    ],
    "assumptions": [
        "All data provided is accurate",
        "Applicant can gather core documents within two weeks",
    ],
    "confidence": 0.72,
}


def _mock_timeline() -> List[dict]:
    return [
        {
            "when": "Week 1",
            "actions": [
                "Collect passport, photos, and travel history",
                "Draft cover letter outlining itinerary and purpose",
            ],
            "priority": "HIGH",
        },
        {
            "when": "Week 2",
            "actions": [
                "Book visa appointment and gather bank/sponsor statements",
                "Confirm accommodation and travel reservations",
            ],
            "priority": "MEDIUM",
        },
        {
            "when": "Week 3",
            "actions": [
                "Submit application and track status",
                "Prepare for interview if required",
            ],
            "priority": "MEDIUM",
        },
    ]


def _mock_checklist() -> List[dict]:
    return [
        {
            "id": "cover_letter",
            "title": "Draft purpose cover letter",
            "steps": [
                "State origin and destination with dates",
                "Explain purpose and planned activities",
                "List financial support and accommodation",
            ],
            "priority": "MEDIUM",
            "estimated_time": "1 day",
            "dependencies": [],
        },
        {
            "id": "book_appointment",
            "title": "Book visa appointment",
            "steps": [
                "Create consulate account",
                "Select earliest available slot",
                "Upload mandatory documents",
            ],
            "priority": "HIGH",
            "estimated_time": "2 days",
            "dependencies": ["cover_letter"],
        },
    ]


def _mock_documents() -> List[dict]:
    return [
        {
            "category": "Identity",
            "items": [
                {
                    "name": "Passport",
                    "why": "Proof of identity and travel document",
                    "priority": "HIGH",
                    "common_mistakes": ["Expired pages", "Missing signatures"],
                },
                {
                    "name": "Passport photos",
                    "why": "Required for visa application",
                    "priority": "MEDIUM",
                    "common_mistakes": ["Incorrect background", "Wrong dimensions"],
                },
            ],
        },
        {
            "category": "Financial",
            "items": [
                {
                    "name": "Bank statements or sponsor letter",
                    "why": "Demonstrate sufficient funds",
                    "priority": "HIGH",
                    "common_mistakes": ["Unstamped statements", "Missing sponsor ID"],
                }
            ],
        },
    ]


def _mock_risks() -> List[dict]:
    return [
        {
            "id": "appointment_slots",
            "risk": "Appointment slots may be limited",
            "why_it_matters": "Delays can push travel dates",
            "mitigation": ["Book immediately", "Monitor cancellations"],
            "severity": "MEDIUM",
        }
    ]


def build_mock_plan(profile: ProfileIn, snippets: list[dict]) -> PlanOut:
    base_sources = [
        SourceRef(title=s.get("title", ""), ref=s.get("ref", "")) for s in snippets
    ]
    if not base_sources:
        base_sources = [
            SourceRef(title="VisaVerse global guidance", ref="kb/global_documents.md")
        ]
    model = PlanOut(
        summary=MOCK_SUMMARY,
        timeline=_mock_timeline(),
        checklist=_mock_checklist(),
        documents=_mock_documents(),
        risks=_mock_risks(),
        sources=base_sources,
        generated_at=datetime.utcnow().isoformat(),
    )
    return model


def _call_openai(prompt: str) -> dict:
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.LLM_PROVIDER or "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a structured visa planning assistant."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
    }
    with httpx.Client(timeout=30) as client:
        response = client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        content = response.json()
        message = content.get("choices", [{}])[0].get("message", {}).get("content", "{}")
        return json.loads(message)


def generate_plan(profile: ProfileIn, snippets: list[dict]) -> dict:
    if settings.MOCK_MODE or not settings.OPENAI_API_KEY:
        return build_mock_plan(profile, snippets).model_dump()

    prompt = build_prompt(profile, snippets)
    try:
        ai_plan = _call_openai(prompt)
        ai_plan.setdefault("generated_at", datetime.utcnow().isoformat())
        return ai_plan
    except Exception:
        return build_mock_plan(profile, snippets).model_dump()
