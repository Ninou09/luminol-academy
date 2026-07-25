# Luminol Academy repository rules

- Use pnpm only; run workspace commands from the repository root.
- Keep TypeScript strict and avoid `any`. Validate all external input with Zod.
- Put reusable UI, domain types, validation, and infrastructure in the matching shared package.
- Keep apps independently deployable. Never import one app from another.
- Preserve Arabic RTL behavior and accessible semantic HTML in every user-facing change.
- Use design tokens instead of hard-coded brand colors. Never commit secrets or generated build output.
- Before committing, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Milestone work must remain scoped; do not add unfinished routes or placeholder integrations.
