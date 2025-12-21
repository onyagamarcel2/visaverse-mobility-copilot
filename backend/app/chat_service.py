from __future__ import annotations

import json
from typing import List

import httpx

from .config import settings
from .kb import retrieve_snippets
from .schemas import ChatIn, ChatOut, SourceRef


SUGGESTED_PROMPTS = [
    "What documents should I prioritize next?",
    "How long does the interview take?",
    "What happens if my proof of funds is low?",
    "Can I travel while my visa is processing?",
]


def _snippet_sources(snippets: List[dict]) -> List[SourceRef]:
    return [SourceRef(title=s.get("title", "Knowledge Base"), ref=s.get("ref", "kb")) for s in snippets]


def _mock_chat_answer(chat_in: ChatIn, snippets: List[dict]) -> ChatOut:
    message = chat_in.message.lower()
    if "passport" in message:
        answer = (
            "Make sure your passport has at least six months of validity beyond your return date and at least two blank pages."
            " If it expires sooner, plan to renew before booking appointments."
        )
    elif "fund" in message or "money" in message:
        answer = (
            "Visa officers typically expect 3-6 months of bank statements showing stable balances."
            " If you rely on a sponsor, attach their ID and proof of relationship."
        )
    elif "timeline" in message or "how long" in message:
        answer = (
            "Most applications take 6-8 weeks end-to-end, factoring in biometrics and decision time."
            " Apply as early as appointment slots allow to avoid delays."
        )
    else:
        answer = (
            "Focus on gathering mandatory documents first, then schedule your appointment as soon as slots open."
            " Bring originals plus photocopies to avoid rescheduling."
        )

    sources = _snippet_sources(snippets)
    if not sources:
        sources = [SourceRef(title="VisaVerse global guidance", ref="kb/global_documents.md")]

    return ChatOut(answer=answer, sources=sources, suggested_questions=SUGGESTED_PROMPTS[:3])


def _build_prompt(chat_in: ChatIn, snippets: List[dict]) -> str:
    snippet_text = "\n".join(
        f"- {snippet.get('title')}: {snippet.get('content', '')[:400]}" for snippet in snippets
    )
    history_text = "\n".join(f"{msg.role}: {msg.content}" for msg in chat_in.history)
    profile_text = (
        f"Origin: {chat_in.profile.origin_country}, Destination: {chat_in.profile.destination_country}, Purpose: {chat_in.profile.purpose}"
        if chat_in.profile
        else ""
    )
    return (
        "You are VisaVerse, a precise visa planning assistant."
        " Answer with concise, actionable guidance grounded in the snippets below."
        "\nSnippets:\n"
        f"{snippet_text or 'None provided.'}"
        "\nConversation history:\n"
        f"{history_text or 'No history.'}"
        "\nProfile:\n"
        f"{profile_text or 'Unknown profile'}"
        "\nUser question:\n"
        f"{chat_in.message}\n"
        "Respond with plain text advice."
    )


def _call_chat_llm(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.LLM_PROVIDER or "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a structured visa mobility assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
    }
    with httpx.Client(timeout=20) as client:
        response = client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        message = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return message


def generate_chat_response(chat_in: ChatIn) -> ChatOut:
    snippets: List[dict] = []
    if chat_in.profile:
        snippets = retrieve_snippets(chat_in.profile, k=settings.MAX_SNIPPETS)

    if settings.MOCK_MODE or not settings.OPENAI_API_KEY:
        return _mock_chat_answer(chat_in, snippets)

    try:
        prompt = _build_prompt(chat_in, snippets)
        answer = _call_chat_llm(prompt)
        sources = _snippet_sources(snippets)
        return ChatOut(answer=answer, sources=sources, suggested_questions=SUGGESTED_PROMPTS[:3])
    except Exception:
        return _mock_chat_answer(chat_in, snippets)
