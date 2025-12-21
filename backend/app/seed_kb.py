"""Import markdown files from kb/ into the database for backward compatibility."""

from pathlib import Path

from .database import Base, engine, session_scope
from .models import KbDocument, KbVersion


def seed_from_markdown(kb_dir: str = "../kb"):
    Base.metadata.create_all(bind=engine)
    directory = Path(kb_dir)
    if not directory.exists():
        return
    with session_scope() as session:
        for path in directory.glob("*.md"):
            title = path.stem.replace("_", " ").title()
            content = path.read_text()
            existing = session.query(KbDocument).filter(KbDocument.title == title).first()
            if existing:
                continue
            doc = KbDocument(title=title, status="published")
            version = KbVersion(document=doc, content=content, status="published", version=1)
            session.add_all([doc, version])


if __name__ == "__main__":
    seed_from_markdown()
