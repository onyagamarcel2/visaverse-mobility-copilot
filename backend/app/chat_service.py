from __future__ import annotations

from typing import List

from .config import settings
from .kb import retrieve_snippets
from .llm_client import call_llm
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
    language = (
        chat_in.profile.language.value
        if chat_in.profile and hasattr(chat_in.profile.language, "value")
        else "EN"
    )
    message = chat_in.message.lower()
    if language == "FR":
        if "passport" in message or "passeport" in message:
            answer = (
                "Assurez-vous que votre passeport soit valide au moins six mois apres votre retour et comporte deux pages libres."
                " S'il expire bientot, prevoyez de le renouveler avant de reserver un rendez-vous."
            )
        elif "fund" in message or "money" in message or "fonds" in message:
            answer = (
                "Les consulats attendent souvent 3 a 6 mois de releves bancaires montrant des soldes stables."
                " Si un sponsor vous aide, ajoutez sa piece d'identite et la preuve du lien."
            )
        elif "timeline" in message or "how long" in message or "delai" in message:
            answer = (
                "La plupart des demandes prennent 6 a 8 semaines, en tenant compte des biometries et de la decision."
                " Deposez tot pour eviter les retards."
            )
        else:
            answer = (
                "Commencez par les documents obligatoires, puis reservez un rendez-vous des qu'un slot est disponible."
                " Apportez les originaux et des photocopies pour eviter un report."
            )
    else:
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
    language_text = (
        f"Language: {chat_in.profile.language}" if chat_in.profile else "Language: EN"
    )
    return (
        "You are VisaVerse, a precise visa planning assistant."
        " Answer with concise, actionable guidance grounded in the snippets below."
        " Respond in the language specified by the profile (FR = French, EN = English)."
        "\nSnippets:\n"
        f"{snippet_text or 'None provided.'}"
        "\nConversation history:\n"
        f"{history_text or 'No history.'}"
        "\nProfile:\n"
        f"{profile_text or 'Unknown profile'}"
        "\n"
        f"{language_text}"
        "\nUser question:\n"
        f"{chat_in.message}\n"
        "Respond with plain text advice."
    )


def generate_chat_response(chat_in: ChatIn) -> ChatOut:
    snippets: List[dict] = []
    if chat_in.profile:
        snippets = retrieve_snippets(chat_in.profile, k=settings.MAX_SNIPPETS)

    if settings.MOCK_MODE or not settings.llm_api_key:
        return _mock_chat_answer(chat_in, snippets)

    try:
        prompt = _build_prompt(chat_in, snippets)
        answer = call_llm(
            prompt,
            system_prompt="You are VisaVerse, a precise visa planning assistant.",
            temperature=0.4,
        )
        sources = _snippet_sources(snippets)
        return ChatOut(answer=answer, sources=sources, suggested_questions=SUGGESTED_PROMPTS[:3])
    except Exception:
        return _mock_chat_answer(chat_in, snippets)
