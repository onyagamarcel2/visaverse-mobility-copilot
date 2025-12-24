import logging
import time
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .chat_service import generate_chat_response
from .plan_service import build_plan
from .admin_api import router as admin_router
from .middleware import RequestContextMiddleware
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
app.add_middleware(RequestContextMiddleware)

logger = logging.getLogger("visaverse")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/plan", response_model=PlanOut)
def create_plan(profile: ProfileIn, request: Request) -> PlanOut:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    start = time.perf_counter()
    try:
        plan = build_plan(profile)
    except Exception as exc:
        logger.exception(
            "plan_generation_failed",
            extra={"request_id": request_id, "endpoint": "/api/plan"},
        )
        envelope = ErrorEnvelope(
            error=ErrorDetail(code="PLAN_ERROR", message="Failed to generate plan", details=str(exc))
        )
        raise HTTPException(status_code=500, detail=envelope.model_dump())
    latency_ms = int((time.perf_counter() - start) * 1000)
    mode = (
        "mock"
        if settings.MOCK_MODE or not settings.llm_api_key
        else settings.llm_mode
    )
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
def chat(payload: ChatIn, request: Request) -> ChatOut:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    start = time.perf_counter()
    mode = (
        "mock"
        if settings.MOCK_MODE or not settings.llm_api_key
        else settings.llm_mode
    )
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
        logger.exception(
            "chat_failed",
            extra={"request_id": request_id, "endpoint": "/api/chat"},
        )
        envelope = ErrorEnvelope(
            error=ErrorDetail(code="CHAT_ERROR", message="Failed to process chat message", details=str(exc))
        )
        raise HTTPException(status_code=500, detail=envelope.model_dump())


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception(
        "unhandled_exception",
        extra={"request_id": request_id, "path": request.url.path},
    )
    envelope = ErrorEnvelope(
        error=ErrorDetail(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred. Please contact support with the request id.",
            details=str(exc),
        )
    )
    return JSONResponse(
        status_code=500,
        content=envelope.model_dump(),
        headers={"x-request-id": request_id},
    )


def get_app():
    return app
