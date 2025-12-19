from pathlib import Path
from typing import List

from .schemas import ProfileIn


KB_ROOT = Path(__file__).resolve().parents[2] / "kb"


class Snippet(dict):
    """Dictionary-based snippet for easy JSON serialization."""


def load_markdown_files() -> List[Path]:
    return list(KB_ROOT.rglob("*.md"))


def read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def score_content(content: str, profile: ProfileIn) -> int:
    keywords = [
        profile.origin_country.lower(),
        profile.destination_country.lower(),
        profile.purpose.value.lower(),
    ]
    return sum(content.lower().count(keyword) for keyword in keywords)


def retrieve_snippets(profile: ProfileIn, k: int = 5) -> List[Snippet]:
    files = load_markdown_files()
    scored = []
    for path in files:
        content = read_file(path)
        score = score_content(content, profile)
        scored.append((score, path, content))
    scored.sort(key=lambda item: item[0], reverse=True)
    top = [item for item in scored if item[0] > 0][:k]

    snippets: List[Snippet] = []
    for score, path, content in top:
        snippets.append(
            Snippet(
                {
                    "title": path.stem.replace("_", " ").title(),
                    "ref": str(path.relative_to(KB_ROOT)),
                    "content": content,
                    "score": score,
                }
            )
        )
    return snippets
