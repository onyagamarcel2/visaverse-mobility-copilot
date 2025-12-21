import logging
import time
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .chat_service import generate_chat_response
from .plan_service import build_plan
from .admin_api import router as admin_router
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

app.include_router(admin_router)

logger = logging.getLogger("visaverse")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/plan", response_model=PlanOut)
def create_plan(profile: ProfileIn) -> PlanOut:
    request_id = str(uuid.uuid4())
    start = time.perf_counter()
    plan = build_plan(profile)
    latency_ms = int((time.perf_counter() - start) * 1000)
    mode = "mock" if settings.MOCK_MODE or not settings.OPENAI_API_KEY else "llm"
    logger.info(
        "plan_generated",
        extra={
          "request_id": request_id,
          "mode": mode,
          "latency_ms": latency_ms,
          "sources_count": len(plan.sources),
          "endpoint": "/api/plan",
        },
    )
    return plan


@app.post(
    "/api/chat",
    response_model=ChatOut,
    responses={400: {"model": ErrorEnvelope}, 500: {"model": ErrorEnvelope}},
)
def chat(payload: ChatIn) -> ChatOut:
    request_id = str(uuid.uuid4())
    start = time.perf_counter()
    mode = "mock" if settings.MOCK_MODE or not settings.OPENAI_API_KEY else "llm"
    try:
        response = generate_chat_response(payload)
        latency_ms = int((time.perf_counter() - start) * 1000)
        logger.info(
            "chat_completed",
            extra={
              "request_id": request_id,
              "mode": mode,
              "latency_ms": latency_ms,
              "sources_count": len(response.sources),
              "endpoint": "/api/chat",
            },
        )
        return response
    except Exception as exc:
        envelope = ErrorEnvelope(
            error=ErrorDetail(code="CHAT_ERROR", message="Failed to process chat message", details=str(exc))
        )
        raise HTTPException(status_code=500, detail=envelope.model_dump())


def get_app():
    return app
