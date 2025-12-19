from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .plan_service import build_plan
from .schemas import PlanOut, ProfileIn

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


def get_app():
    return app
