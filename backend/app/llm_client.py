import json
from datetime import datetime
from typing import List, Tuple

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
MOCK_SUMMARY_FR = {
    "title": "Plan de preparation visa",
    "key_advice": [
        "Reservez votre rendez-vous visa tot et alignez vos documents avec les exigences.",
        "Montrez une couverture financiere claire et l'intention de voyage avec des justificatifs.",
    ],
    "assumptions": [
        "Toutes les informations fournies sont exactes",
        "Le demandeur peut reunir les documents principaux en deux semaines",
    ],
    "confidence": 0.72,
}


def _mock_timeline(language: str) -> List[dict]:
    if language == "FR":
        return [
            {
                "when": "Semaine 1",
                "actions": [
                    "Rassembler passeport, photos et historique de voyage",
                    "Rediger une lettre expliquant l'itineraire et le motif",
                ],
                "priority": "HIGH",
            },
            {
                "when": "Semaine 2",
                "actions": [
                    "Prendre un rendez-vous et reunir relevés bancaires ou sponsor",
                    "Confirmer hebergement et reservations",
                ],
                "priority": "MEDIUM",
            },
            {
                "when": "Semaine 3",
                "actions": [
                    "Deposer la demande et suivre le statut",
                    "Se preparer a un entretien si necessaire",
                ],
                "priority": "MEDIUM",
            },
        ]
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


def _mock_checklist(language: str) -> List[dict]:
    if language == "FR":
        return [
            {
                "id": "cover_letter",
                "title": "Rediger une lettre de motivation",
                "steps": [
                    "Indiquer origine et destination avec dates",
                    "Expliquer le motif et les activites prevues",
                    "Lister le financement et l'hebergement",
                ],
                "priority": "MEDIUM",
                "estimated_time": "1 jour",
                "dependencies": [],
            },
            {
                "id": "book_appointment",
                "title": "Prendre un rendez-vous visa",
                "steps": [
                    "Creer un compte consulat",
                    "Choisir le premier slot disponible",
                    "Televerser les documents obligatoires",
                ],
                "priority": "HIGH",
                "estimated_time": "2 jours",
                "dependencies": ["cover_letter"],
            },
        ]
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


def _mock_documents(language: str) -> List[dict]:
    if language == "FR":
        return [
            {
                "category": "Identite",
                "items": [
                    {
                        "name": "Passeport",
                        "why": "Preuve d'identite et document de voyage",
                        "priority": "HIGH",
                        "common_mistakes": ["Pages expirees", "Signature manquante"],
                    },
                    {
                        "name": "Photos d'identite",
                        "why": "Requises pour la demande de visa",
                        "priority": "MEDIUM",
                        "common_mistakes": ["Fond incorrect", "Mauvaises dimensions"],
                    },
                ],
            },
            {
                "category": "Financier",
                "items": [
                    {
                        "name": "Releves bancaires ou lettre de sponsor",
                        "why": "Prouver des fonds suffisants",
                        "priority": "HIGH",
                        "common_mistakes": ["Releves non tamponnes", "Piece d'identite du sponsor manquante"],
                    }
                ],
            },
        ]
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


def _mock_risks(language: str) -> List[dict]:
    if language == "FR":
        return [
            {
                "id": "appointment_slots",
                "risk": "Les rendez-vous peuvent etre limites",
                "why_it_matters": "Les delais peuvent repousser les dates de voyage",
                "mitigation": ["Reserver immediatement", "Surveiller les annulations"],
                "severity": "MEDIUM",
            }
        ]
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
    language = profile.language.value if hasattr(profile.language, "value") else str(profile.language)
    base_sources = [
        SourceRef(title=s.get("title", ""), ref=s.get("ref", "")) for s in snippets
    ]
    if not base_sources:
        base_sources = [
            SourceRef(title="VisaVerse global guidance", ref="kb/global_documents.md")
        ]
    summary = MOCK_SUMMARY_FR if language == "FR" else MOCK_SUMMARY
    model = PlanOut(
        summary=summary,
        timeline=_mock_timeline(language),
        checklist=_mock_checklist(language),
        documents=_mock_documents(language),
        risks=_mock_risks(language),
        sources=base_sources,
        generated_at=datetime.utcnow().isoformat(),
    )
    return model


def _resolve_llm_transport() -> Tuple[str, dict, str]:
    if settings.OPENROUTER_API_KEY:
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }
        if settings.OPENROUTER_REFERRER:
            headers["HTTP-Referer"] = settings.OPENROUTER_REFERRER
        if settings.OPENROUTER_TITLE:
            headers["X-Title"] = settings.OPENROUTER_TITLE
        model = settings.OPENROUTER_MODEL or "openai/gpt-4o-mini"
        return settings.OPENROUTER_BASE_URL, headers, model
    if settings.OPENAI_API_KEY:
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        model = settings.LLM_PROVIDER or "gpt-4o-mini"
        return "https://api.openai.com/v1/chat/completions", headers, model
    raise RuntimeError("LLM credentials are not configured.")


def call_llm(
    prompt: str,
    *,
    system_prompt: str,
    temperature: float = 0.2,
    response_format: dict | None = None,
    timeout: float = 30.0,
) -> str:
    url, headers, model = _resolve_llm_transport()
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
    }
    if response_format:
        payload["response_format"] = response_format

    with httpx.Client(timeout=timeout) as client:
        response = client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        content = response.json()
        return content.get("choices", [{}])[0].get("message", {}).get("content", "")


def generate_plan(profile: ProfileIn, snippets: list[dict]) -> dict:
    if settings.MOCK_MODE or not settings.llm_api_key:
        return build_mock_plan(profile, snippets).model_dump()

    prompt = build_prompt(profile, snippets)
    try:
        raw_plan = call_llm(
            prompt,
            system_prompt="You are a structured visa planning assistant.",
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        ai_plan = json.loads(raw_plan or "{}")
        ai_plan.setdefault("generated_at", datetime.utcnow().isoformat())
        return ai_plan
    except Exception:
        return build_mock_plan(profile, snippets).model_dump()
