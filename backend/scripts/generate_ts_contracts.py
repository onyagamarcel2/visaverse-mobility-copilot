#!/usr/bin/env python3
"""
Generate TypeScript contract definitions from Pydantic schemas.

Usage:
    python backend/scripts/generate_ts_contracts.py      # writes/overwrites TS file
    python backend/scripts/generate_ts_contracts.py --check  # exits non-zero if file is stale
"""

from __future__ import annotations

import argparse
import inspect
from enum import Enum
from pathlib import Path
from typing import Annotated, Any, Dict, List, Literal, Set, Tuple, Union, get_args, get_origin

from pydantic import BaseModel
from pydantic.fields import FieldInfo
from pydantic_core import PydanticUndefined

import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.schemas import ChatIn, ChatOut, ErrorEnvelope, PlanOut, ProfileIn  # noqa: E402


TARGET_MODELS: Tuple[type[BaseModel], ...] = (ProfileIn, PlanOut, ChatIn, ChatOut, ErrorEnvelope)
OUTPUT_PATH = REPO_ROOT / "frontend" / "generated" / "backend-contracts.ts"

PRIMITIVE_MAP = {
    str: "string",
    int: "number",
    float: "number",
    bool: "boolean",
}


class TypeRegistry:
    def __init__(self) -> None:
        self.models: Dict[str, type[BaseModel]] = {}
        self.enums: Dict[str, type[Enum]] = {}
        self.model_dependencies: Dict[str, Set[str]] = {}

    def register_model(self, model: type[BaseModel]) -> None:
        name = model.__name__
        if name in self.models:
            return
        self.models[name] = model
        deps: Set[str] = set()
        for field in model.model_fields.values():
            self._collect(field.annotation, deps)
        self.model_dependencies[name] = deps

    def _collect(self, annotation: Any, deps: Set[str]) -> None:
        origin = get_origin(annotation)
        if origin is None:
            self._handle_single(annotation, deps)
            return
        if origin is list or origin is List:
            inner = get_args(annotation)[0]
            self._collect(inner, deps)
            return
        if origin is tuple:
            for arg in get_args(annotation):
                self._collect(arg, deps)
            return
        if origin in (list, List, set, Set):
            inner = get_args(annotation)[0]
            self._collect(inner, deps)
            return
        if origin in (tuple, Tuple):
            for arg in get_args(annotation):
                self._collect(arg, deps)
            return
        if origin in (dict, Dict):
            value = get_args(annotation)[1]
            self._collect(value, deps)
            return
        if origin is Annotated:
            inner = get_args(annotation)[0]
            self._collect(inner, deps)
            return
        if origin is Literal or origin is type(None):
            return
        if origin is Union:
            for arg in get_args(annotation):
                self._collect(arg, deps)
            return

    def _handle_single(self, annotation: Any, deps: Set[str]) -> None:
        if annotation is None or annotation is type(None):
            return
        if inspect.isclass(annotation):
            if issubclass(annotation, BaseModel):
                deps.add(annotation.__name__)
                self.register_model(annotation)
            elif issubclass(annotation, Enum):
                self.enums[annotation.__name__] = annotation


def annotation_to_ts(
    annotation: Any,
    registry: TypeRegistry,
) -> Tuple[str, bool]:
    origin = get_origin(annotation)
    if origin is Annotated:
        base = get_args(annotation)[0]
        return annotation_to_ts(base, registry)
    if origin is list or origin is List:
        inner = get_args(annotation)[0]
        inner_ts, inner_null = annotation_to_ts(inner, registry)
        suffix = " | null" if inner_null else ""
        return f"{inner_ts}[]{suffix}", False
    if origin is set or origin is Set:
        inner = get_args(annotation)[0]
        inner_ts, inner_null = annotation_to_ts(inner, registry)
        suffix = " | null" if inner_null else ""
        return f"{inner_ts}[]{suffix}", False
    if origin is dict or origin is Dict:
        key_ts, _ = annotation_to_ts(str, registry)
        value_ts, value_null = annotation_to_ts(get_args(annotation)[1], registry)
        suffix = " | null" if value_null else ""
        return f"Record<{key_ts}, {value_ts}{suffix}>", False
    if origin is Literal:
        values = []
        for val in get_args(annotation):
            if isinstance(val, str):
                values.append(f'"{val}"')
            else:
                values.append(str(val))
        return " | ".join(values), False
    if origin in (tuple, Tuple):
        parts = []
        allows_null = False
        for arg in get_args(annotation):
            ts, nullable = annotation_to_ts(arg, registry)
            allows_null = allows_null or nullable
            parts.append(ts)
        return f"[{', '.join(parts)}]", allows_null
    if origin is Union:
        parts: List[str] = []
        allows_null = False
        for arg in get_args(annotation):
            if arg is type(None):
                allows_null = True
                continue
            ts, nullable = annotation_to_ts(arg, registry)
            allows_null = allows_null or nullable
            parts.append(ts)
        if not parts:
            return "unknown", allows_null
        return " | ".join(sorted(set(parts))), allows_null
    if inspect.isclass(annotation):
        if issubclass(annotation, BaseModel):
            registry.register_model(annotation)
            return annotation.__name__, False
        if issubclass(annotation, Enum):
            registry.enums[annotation.__name__] = annotation
            return annotation.__name__, False
        if annotation in PRIMITIVE_MAP:
            return PRIMITIVE_MAP[annotation], False
        if annotation.__module__ == "datetime":
            return "string", False
    return "unknown", False


def field_optional(field: FieldInfo) -> bool:
    if hasattr(field, "is_required"):
        return not field.is_required()
    return field.default is not PydanticUndefined or field.default_factory is not None


def generate_ts() -> str:
    registry = TypeRegistry()
    for model in TARGET_MODELS:
        registry.register_model(model)

    emitted: Set[str] = set()
    lines: List[str] = [
        "// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.",
        "// Run `python backend/scripts/generate_ts_contracts.py` to regenerate.",
        "",
    ]

    def emit_model(name: str) -> None:
        if name in emitted:
            return
        for dep in sorted(registry.model_dependencies.get(name, set())):
            if dep == name:
                continue
            if dep in registry.models:
                emit_model(dep)
        model = registry.models[name]
        lines.append(f"export interface {name} {{")
        for field_name, field in model.model_fields.items():
            ts_type, allows_null = annotation_to_ts(field.annotation, registry)
            optional = field_optional(field)
            type_repr = f"{ts_type} | null" if allows_null else ts_type
            optional_token = "?" if optional else ""
            lines.append(f"  {field_name}{optional_token}: {type_repr};")
        lines.append("}")
        lines.append("")
        emitted.add(name)

    # Emit enums first to ensure availability
    for enum_name, enum_cls in sorted(registry.enums.items()):
        members = " | ".join(f'"{member.value}"' for member in enum_cls)
        lines.append(f"export type {enum_name} = {members};")
    if registry.enums:
        lines.append("")

    for model in TARGET_MODELS:
        emit_model(model.__name__)

    return "\n".join(lines).strip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate TypeScript contracts.")
    parser.add_argument("--check", action="store_true", help="Fail if generated output differs from disk.")
    args = parser.parse_args()

    content = generate_ts()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    if args.check:
        if not OUTPUT_PATH.exists():
            raise SystemExit(
                f"{OUTPUT_PATH} does not exist. Run script without --check to create it."
            )
        existing = OUTPUT_PATH.read_text(encoding="utf-8")
        if existing != content:
            raise SystemExit(
                f"{OUTPUT_PATH} is out of date. Run `python backend/scripts/generate_ts_contracts.py`."
            )
        print("Contracts are up to date.")
        return

    OUTPUT_PATH.write_text(content, encoding="utf-8")
    print(f"Wrote contracts to {OUTPUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
