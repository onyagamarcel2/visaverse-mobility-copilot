import hashlib
from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import AuditEvent, KbDocument, KbVersion, Role, User, UserRole
from .schemas import KbDocumentOut, KbVersionOut, TokenResponse, UserCreate, UserOut
from .security import create_access_token, get_password_hash, verify_password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/api/auth/login")
router = APIRouter(prefix="/admin/api", tags=["admin"])

# ensure tables exist for dev/demo
Base.metadata.create_all(bind=engine)


class LoginRequest(BaseModel):
    email: str
    password: str


def ensure_roles(session: Session) -> None:
    canonical_roles = [
        "admin",
        "editor",
        "reviewer",
        "support",
        "analyst",
    ]
    existing = {r.name for r in session.query(Role).all()}
    for role in canonical_roles:
        if role not in existing:
            session.add(Role(name=role, description=f"{role.title()} role"))
    session.commit()


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
    required_roles: Optional[list[str]] = None,
) -> User:
    from .security import decode_token

    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if required_roles:
        names = [ur.role.name for ur in user.roles]
        if not any(role in names for role in required_roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
    return user


def require_roles(roles: list[str]):
    def wrapper(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]):
        return get_current_user(token, db, roles)

    return wrapper


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    ensure_roles(db)
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Allow the first login attempt to bootstrap an admin account for demos
        existing_users = db.query(User).count()
        if existing_users == 0:
            admin_role = db.query(Role).filter(Role.name == "admin").first()
            user = User(email=payload.email, hashed_password=get_password_hash(payload.password))
            db.add(user)
            if admin_role:
                db.add(UserRole(user=user, role=admin_role))
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    role_names = [ur.role.name for ur in user.roles]
    token = create_access_token({"sub": user.email, "roles": role_names})
    return TokenResponse(access_token=token, role=role_names[0] if role_names else None)


@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(["admin"]))):
    ensure_roles(db)
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = get_password_hash(payload.password)
    user = User(email=payload.email, hashed_password=hashed, organization_id=payload.organization_id)
    db.add(user)
    admin_role = db.query(Role).filter(Role.name == "editor").first()
    if admin_role:
        db.add(UserRole(user=user, role=admin_role))
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, email=user.email, organization_id=user.organization_id, roles=[ur.role.name for ur in user.roles])


class KbPayload(BaseModel):
    title: str
    content: str
    origin_country: Optional[str] = None
    destination_country: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[str] = None


@router.post("/kb", response_model=KbDocumentOut)
def create_kb_doc(
    payload: KbPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "editor"])),
):
    doc = KbDocument(
        title=payload.title,
        status="draft",
        origin_country=payload.origin_country,
        destination_country=payload.destination_country,
        language=payload.language,
        tags=payload.tags,
    )
    version = KbVersion(content=payload.content, status="draft", version=1, document=doc)
    db.add_all([doc, version])
    db.commit()
    db.refresh(doc)
    _record_audit(db, current_user, "kb_document", str(doc.id), None, payload.content)
    return _serialize_doc(doc)


@router.post("/kb/{doc_id}/submit", response_model=KbDocumentOut)
def submit_for_review(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["editor", "admin"])),
):
    doc = db.get(KbDocument, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    doc.status = "review"
    for version in doc.versions:
        version.status = "review"
    db.commit()
    _record_audit(db, current_user, "kb_document", str(doc.id), "draft", "review")
    return _serialize_doc(doc)


@router.post("/kb/{doc_id}/publish", response_model=KbDocumentOut)
def publish_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["reviewer", "admin"])),
):
    doc = db.get(KbDocument, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    latest_version = db.query(KbVersion).filter(KbVersion.document_id == doc.id).order_by(KbVersion.version.desc()).first()
    if latest_version:
        latest_version.status = "published"
        doc.current_version_id = latest_version.id
    doc.status = "published"
    db.commit()
    _record_audit(db, current_user, "kb_document", str(doc.id), "review", "published")
    return _serialize_doc(doc)


@router.get("/kb", response_model=list[KbDocumentOut])
def list_docs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "editor", "reviewer", "analyst", "support"])),
):
    docs = db.query(KbDocument).all()
    return [_serialize_doc(doc) for doc in docs]


@router.get("/audit", response_model=list[dict])
def list_audit(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "analyst"])),
):
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(200).all()
    return [
        {
            "id": e.id,
            "action": e.action,
            "resource_type": e.resource_type,
            "resource_id": e.resource_id,
            "timestamp": e.created_at,
            "actor_id": e.actor_id,
        }
        for e in events
    ]


@router.get("/metrics")
def metrics(db: Session = Depends(get_db)):
    total_docs = db.query(func.count(KbDocument.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    return {"documents": total_docs, "users": total_users, "timestamp": datetime.utcnow().isoformat()}


def _record_audit(db: Session, actor: Optional[User], resource_type: str, resource_id: str, before: Optional[str], after: Optional[str]) -> None:
    before_hash = hashlib.sha256(before.encode()).hexdigest() if before else None
    after_hash = hashlib.sha256(after.encode()).hexdigest() if after else None
    event = AuditEvent(
        actor_id=actor.id if actor else None,
        action="update",
        resource_type=resource_type,
        resource_id=resource_id,
        before_hash=before_hash,
        after_hash=after_hash,
        ip_address=None,
    )
    db.add(event)
    db.commit()


def _serialize_doc(doc: KbDocument) -> KbDocumentOut:
    versions = [
        KbVersionOut(
            id=v.id,
            version=v.version,
            status=v.status,
            content=v.content,
        )
        for v in doc.versions
    ]
    return KbDocumentOut(id=doc.id, title=doc.title, status=doc.status, versions=versions)
