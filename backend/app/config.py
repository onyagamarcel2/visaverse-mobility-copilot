import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
load_dotenv()  # fallback to current working dir for overrides


def get_env(name: str, default: str | None = None) -> str | None:
    return os.getenv(name, default)


class Settings:
    LLM_PROVIDER: str | None = get_env("LLM_PROVIDER")
    OPENAI_API_KEY: str | None = get_env("OPENAI_API_KEY")
    OPENROUTER_API_KEY: str | None = get_env("OPENROUTER_API_KEY")
    OPENROUTER_MODEL: str | None = get_env(
        "OPENROUTER_MODEL", "openai/gpt-4o-mini"
    )
    OPENROUTER_BASE_URL: str = get_env(
        "OPENROUTER_BASE_URL",
        "https://openrouter.ai/api/v1/chat/completions",
    )
    OPENROUTER_REFERRER: str | None = get_env("OPENROUTER_REFERRER")
    OPENROUTER_TITLE: str | None = get_env("OPENROUTER_TITLE")
    MOCK_MODE: bool = get_env("MOCK_MODE", "false").lower() == "true"
    ALLOWED_ORIGINS: list[str] = (
        get_env(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:3001",
        ).split(",")
    )
    PORT: int = int(get_env("PORT", "8000"))
    MAX_SNIPPETS: int = int(get_env("MAX_SNIPPETS", "5"))
    DATABASE_URL: str = get_env(
        "DATABASE_URL", "sqlite:///./data.sqlite3"
    )
    JWT_SECRET_KEY: str = get_env("JWT_SECRET_KEY", "change-me")
    JWT_ALGORITHM: str = get_env("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        get_env("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    @property
    def llm_api_key(self) -> str | None:
        return self.OPENROUTER_API_KEY or self.OPENAI_API_KEY

    @property
    def llm_mode(self) -> str:
        if self.OPENROUTER_API_KEY:
            return "openrouter"
        if self.OPENAI_API_KEY:
            return "openai"
        return "mock"


settings = Settings()
