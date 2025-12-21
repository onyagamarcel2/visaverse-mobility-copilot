import os
from dotenv import load_dotenv

load_dotenv()


def get_env(name: str, default: str | None = None) -> str | None:
    return os.getenv(name, default)


class Settings:
    LLM_PROVIDER: str | None = get_env("LLM_PROVIDER")
    OPENAI_API_KEY: str | None = get_env("OPENAI_API_KEY")
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


settings = Settings()
