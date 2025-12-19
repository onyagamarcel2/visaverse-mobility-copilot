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
        get_env("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    )
    PORT: int = int(get_env("PORT", "8000"))
    MAX_SNIPPETS: int = int(get_env("MAX_SNIPPETS", "5"))


settings = Settings()
