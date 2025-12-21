import os
import sys
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite:///./test_admin.sqlite3"

sys.path.append(str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import get_app  # noqa: E402
from app.database import Base, engine  # noqa: E402

Base.metadata.create_all(bind=engine)

app = get_app()
client = TestClient(app)


def test_admin_bootstrap_and_kb_workflow():
    # bootstrap admin user
    resp = client.post(
        "/admin/api/auth/login",
        json={"email": "admin@example.com", "password": "secret"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    create = client.post(
        "/admin/api/kb",
        json={"title": "Test Doc", "content": "Content"},
        headers=headers,
    )
    assert create.status_code == 200
    doc_id = create.json()["id"]

    submit = client.post(f"/admin/api/kb/{doc_id}/submit", headers=headers)
    assert submit.status_code == 200
    assert submit.json()["status"] == "review"

    publish = client.post(f"/admin/api/kb/{doc_id}/publish", headers=headers)
    assert publish.status_code == 200
    assert publish.json()["status"] == "published"

    audit = client.get("/admin/api/audit", headers=headers)
    assert audit.status_code == 200
    assert len(audit.json()) >= 2
