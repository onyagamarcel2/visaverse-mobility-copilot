# Design System Notes

Both the end-user and admin frontends share the same visual language. Tokens live in CSS custom properties defined in
`frontend/app/globals.css` (copied into `admin-frontend/app/globals.css`). Components are shadcn/ui primitives located under
`components/ui` in each app, copied from the user app to guarantee parity.

## Tokens
- Colors: `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--muted`, `--border`, `--ring`, plus sidebar and chart tokens.
- Radius: `--radius`, consumed by shadcn/ui cards, buttons, and inputs.
- Typography: Inter variable font with matching weights; Apple-minimal layout spacing.

## Usage
- Tailwind 4 inline theming binds CSS variables to Tailwind color tokens.
- Admin shell uses the same button variants (primary/secondary/ghost) and card density as the user navbar + dashboard.
- When adding new components, prefer reusing utilities from `@/lib/utils` (`cn`) and the toast primitives from `components/ui/toaster`.

## Keeping parity
- If tokens change in the user app, mirror the update in `admin-frontend/app/globals.css` and `components/ui/*`.
- Avoid introducing divergent palettes or radii; the admin shell intentionally mirrors the user app sidebar spacing.
