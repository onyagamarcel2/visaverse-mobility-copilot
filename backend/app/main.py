from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .chat_service import generate_chat_response
from .plan_service import build_plan
from .schemas import (
    ChatIn,
    ChatOut,
    ErrorDetail,
    ErrorEnvelope,
    PlanOut,
    ProfileIn,
)

app = FastAPI(title="VisaVerse Mobility Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/plan", response_model=PlanOut)
def create_plan(profile: ProfileIn) -> PlanOut:
    return build_plan(profile)


@app.post(
    "/api/chat",
    response_model=ChatOut,
    responses={400: {"model": ErrorEnvelope}, 500: {"model": ErrorEnvelope}},
)
def chat(payload: ChatIn) -> ChatOut:
    try:
        return generate_chat_response(payload)
    except Exception as exc:
        envelope = ErrorEnvelope(
            error=ErrorDetail(code="CHAT_ERROR", message="Failed to process chat message", details=str(exc))
        )
        raise HTTPException(status_code=500, detail=envelope.model_dump())


def get_app():
    return app
