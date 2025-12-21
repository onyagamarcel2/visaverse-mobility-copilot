# Frontend state storage map

This project keeps a few lightweight keys in the browser to make the onboarding → plan → chat journey resilient to refreshes and navigation.

## Key/value map
- `visaverse_profile` – persisted profile from the onboarding wizard. Shape matches the BFF payload (`originCountry`, `destinationCountry`, `purpose`, dates, sponsor/funds, language, notes). Used by `/plan` to render tabs and by `/chat` to add context.
- `visaverse_draft` – short-lived draft copy (sessionStorage) written during onboarding so users can recover partially completed forms.
- `visaverse_chat_history` – array of `{ role, content, timestamp }` messages shown in `/chat`. Cleared via “Clear Chat”.
- `visaverse_locale` – current language preference (`en` or `fr`) used by the i18n dictionary.

## Flow
1. **Onboarding** – form writes to `visaverse_profile` (and `visaverse_draft` during the session). Validation runs before persisting.
2. **Plan** – page loads `visaverse_profile`; if absent it redirects to `/onboarding`. Tabs render from the stored profile while awaiting API data.
3. **Chat** – requires `visaverse_profile`; otherwise shows an accessible empty state pointing back to onboarding. History stays in `visaverse_chat_history` so page reloads preserve context.

## Tips
- When troubleshooting data binding, open DevTools → Application → Local Storage and inspect these keys.
- If you change contract shapes, update both the onboarding serializer and BFF mappers so stored data matches the backend schema.
