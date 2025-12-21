import datetime as dt
import datetime as dt
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class TimestampMixin:
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), default=dt.datetime.utcnow
    )
    updated_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow
    )


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    retention_days: Mapped[int] = mapped_column(Integer, default=365)

    users: Mapped[list["User"]] = relationship("User", back_populates="organization")


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"))

    organization: Mapped[Optional[Organization]] = relationship("Organization", back_populates="users")
    roles: Mapped[list["UserRole"]] = relationship("UserRole", back_populates="user")


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255))

    assignments: Mapped[list["UserRole"]] = relationship("UserRole", back_populates="role")


class UserRole(Base):
    __tablename__ = "user_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"))

    user: Mapped[User] = relationship("User", back_populates="roles")
    role: Mapped[Role] = relationship("Role", back_populates="assignments")


class KbDocument(Base, TimestampMixin):
    __tablename__ = "kb_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    current_version_id: Mapped[int | None] = mapped_column(ForeignKey("kb_versions.id"), nullable=True)
    origin_country: Mapped[Optional[str]] = mapped_column(String(64))
    destination_country: Mapped[Optional[str]] = mapped_column(String(64))
    purpose: Mapped[Optional[str]] = mapped_column(String(128))
    language: Mapped[Optional[str]] = mapped_column(String(32))
    tags: Mapped[Optional[str]] = mapped_column(String(255))

    versions: Mapped[list["KbVersion"]] = relationship(
        "KbVersion", back_populates="document", foreign_keys="KbVersion.document_id"
    )
    current_version: Mapped[Optional["KbVersion"]] = relationship(
        "KbVersion", foreign_keys=[current_version_id], uselist=False, post_update=True
    )


class KbVersion(Base, TimestampMixin):
    __tablename__ = "kb_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("kb_documents.id"))
    content: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    version: Mapped[int] = mapped_column(Integer, default=1)
    notes: Mapped[Optional[str]] = mapped_column(String(255))

    document: Mapped[KbDocument] = relationship(
        "KbDocument", back_populates="versions", foreign_keys=[document_id]
    )


class Rule(Base, TimestampMixin):
    __tablename__ = "rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    active_version_id: Mapped[int | None] = mapped_column(ForeignKey("rule_versions.id"))

    versions: Mapped[list["RuleVersion"]] = relationship(
        "RuleVersion", back_populates="rule", foreign_keys="RuleVersion.rule_id"
    )
    active_version: Mapped[Optional["RuleVersion"]] = relationship(
        "RuleVersion", foreign_keys=[active_version_id], uselist=False, post_update=True
    )


class RuleVersion(Base, TimestampMixin):
    __tablename__ = "rule_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int] = mapped_column(ForeignKey("rules.id"))
    definition: Mapped[str] = mapped_column(Text)
    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(50), default="draft")

    rule: Mapped[Rule] = relationship(
        "Rule", back_populates="versions", foreign_keys=[rule_id]
    )


class PromptTemplate(Base, TimestampMixin):
    __tablename__ = "prompt_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    kind: Mapped[str] = mapped_column(String(50), default="chat")

    versions: Mapped[list["PromptVersion"]] = relationship("PromptVersion", back_populates="template")


class PromptVersion(Base, TimestampMixin):
    __tablename__ = "prompt_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    template_id: Mapped[int] = mapped_column(ForeignKey("prompt_templates.id"))
    content: Mapped[str] = mapped_column(Text)
    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(50), default="draft")

    template: Mapped[PromptTemplate] = relationship("PromptTemplate", back_populates="versions")


class ModelConfig(Base, TimestampMixin):
    __tablename__ = "model_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    feature: Mapped[str] = mapped_column(String(50))
    provider: Mapped[str] = mapped_column(String(50))
    model: Mapped[str] = mapped_column(String(100))
    parameters: Mapped[Optional[str]] = mapped_column(Text)
    rollout: Mapped[str] = mapped_column(String(50), default="stable")


class PlanRun(Base, TimestampMixin):
    __tablename__ = "plan_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mode: Mapped[str] = mapped_column(String(50), default="mock")
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    tokens: Mapped[int | None] = mapped_column(Integer)
    sources: Mapped[Optional[str]] = mapped_column(Text)
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"))


class Feedback(Base, TimestampMixin):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    run_id: Mapped[int | None] = mapped_column(ForeignKey("plan_runs.id"))
    message: Mapped[str] = mapped_column(Text)
    sentiment: Mapped[str] = mapped_column(String(50), default="neutral")


class AuditEvent(Base, TimestampMixin):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(100))
    resource_type: Mapped[str] = mapped_column(String(100))
    resource_id: Mapped[str | None] = mapped_column(String(64))
    before_hash: Mapped[Optional[str]] = mapped_column(String(255))
    after_hash: Mapped[Optional[str]] = mapped_column(String(255))
    ip_address: Mapped[Optional[str]] = mapped_column(String(64))
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id"))

