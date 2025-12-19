# Bilan d'implémentation VisaVerse Mobility Copilot

## Ce qui est en place
- Monorepo avec backend FastAPI et frontend Next.js, chacun documenté (README, env examples) et interconnectés via CORS et contrat JSON partagé pour le plan de mobilité.
- Backend : modèles Pydantic (profil, plan complet), endpoint `/api/plan` validé, mode mock déterministe sans clé LLM, règles de risques et récupération de snippets Markdown depuis le dossier `kb/`.
- Frontend : parcours onboarding -> stockage local du profil -> appel API -> rendu structuré (résumé, timeline, checklist, documents, risques, sources) avec Tailwind et types alignés sur le backend.
- Ressources d'amorçage : base de connaissances Markdown minimale, profils d'exemple, Docker Compose et instructions de lancement local.

## Ce qu'il reste à prioriser
- Tests automatisés (backend FastAPI + validation Pydantic, frontend composants et appels API) et linting pour sécuriser les régressions.
- Gestion d'erreurs plus robuste côté frontend (états de retry, messages contextualisés) et validations supplémentaires côté formulaire.
- Intégration LLM réelle (OPENAI_API_KEY) avec journalisation et contrôles de temps de réponse, ou remplacement par client RAG futur en conservant l'interface `generate_plan`/`retrieve_snippets`.
- Enrichissement du knowledge base (plus de paires de pays, sources officielles) et amélioration de la pondération de la recherche (au-delà du comptage de mots-clés).
- Automatisation devops : scripts de vérification (fmt, type-check), éventuellement CI basique et instructions de build Docker plus détaillées.
