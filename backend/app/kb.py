from pathlib import Path
from typing import Dict, List, Tuple

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


def parse_metadata(content: str) -> Tuple[Dict[str, str], str]:
    if not content.startswith("---"):
        return {}, content
    try:
        _, meta_block, body = content.split("---", 2)
    except ValueError:
        return {}, content
    metadata: Dict[str, str] = {}
    for line in meta_block.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip().strip(" \"")
    return metadata, body.strip()


def score_content(content: str, profile: ProfileIn) -> int:
    keywords = [
        profile.origin_country.lower(),
        profile.destination_country.lower(),
        profile.purpose.value.lower(),
    ]
    return sum(content.lower().count(keyword) for keyword in keywords)


def _metadata_matches(metadata: Dict[str, str], profile: ProfileIn) -> bool:
    if not metadata:
        return True
    origin = metadata.get("origin_country")
    destination = metadata.get("destination_country")
    purpose = metadata.get("purpose")
    language = metadata.get("language")

    if origin and origin.lower() != profile.origin_country.lower():
        return False
    if destination and destination.lower() != profile.destination_country.lower():
        return False
    if purpose and purpose.lower() != profile.purpose.value.lower():
        return False
    if language and language.lower() != profile.language.value.lower():
        return False
    return True


def retrieve_snippets(profile: ProfileIn, k: int = 5) -> List[Snippet]:
    files = load_markdown_files()
    scored = []
    for path in files:
        raw_content = read_file(path)
        metadata, content = parse_metadata(raw_content)
        if not _metadata_matches(metadata, profile):
            continue
        score = score_content(content, profile)
        scored.append((score, path, content, metadata))
    scored.sort(key=lambda item: item[0], reverse=True)
    top = [item for item in scored if item[0] > 0][:k]

    snippets: List[Snippet] = []
    for score, path, content, metadata in top:
        snippets.append(
            Snippet(
                {
                    "title": path.stem.replace("_", " ").title(),
                    "ref": str(path.relative_to(KB_ROOT)),
                    "content": content,
                    "metadata": metadata,
                    "score": score,
                }
            )
        )
    return snippets
