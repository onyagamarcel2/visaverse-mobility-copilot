# Bilan d'implémentation VisaVerse Mobility Copilot

## Ce qui est en place
- Monorepo avec backend FastAPI, frontend Next.js (BFF dans les routes API), et admin Next.js, chacun documenté (README, env examples) avec ports dédiés (`3000`/`3001`/`8000`).
- Backend : modèles Pydantic complets, endpoints `/api/plan` et `/api/chat` en mode mock ou LLM, récupération de snippets Markdown (avec métadonnées quand disponibles) et fusion avec règles de risques.
- Frontend : parcours onboarding → stockage local du profil → appel BFF `/api/plan`/`/api/chat`, rendu structuré (résumé, timeline, checklist, documents, risques, sources) avec shadcn et dictionnaires i18n EN/FR pour les pages clés.
- Données : base de connaissances Markdown élargie (paires de pays avec métadonnées), exemples de profils (`cases/`) et scripts de smoke/test documentés.

## Ce qu'il reste à prioriser
- Tests automatisés plus larges (frontend composants, intégration BFF) et CI pour exécuter `pytest`, `pnpm lint/build`, scripts de smoke.
- UX : lier tous les widgets plan aux données réelles, affiner les états d'erreur et d'accessibilité, ajouter des captures ou tests visuels.
- Observabilité : consolider la journalisation structurée (request_id, latence) et ajouter métriques/alertes; durcir la validation des entrées côté formulaire.
- Knowledge base : continuer à enrichir les paires de pays, valider les tags/linguistique et préparer un backend vectoriel pour la recherche.
- Automatisation devops : formatter/type-checker systématiques, pipelines Docker/CI détaillés, distribution des gabarits d'env alignés entre apps.
