# Public website deployment

This application maps to the `luminol-academy-web` Vercel project
(`prj_HtkY27LjPLMO0uRoMcZHFDF0h36J`).

Changes in this directory must build the public website preview. They must not
rebuild the learner portal or administration application unless the same Git
comparison also changes one of their shared dependencies.

Repository installs are pinned to pnpm `10.34.5`, require pnpm
`>=10.34.5 <11`, and must continue to use `pnpm install --frozen-lockfile`.
Do not bypass lockfile integrity failures by refreshing checksums during a
normal preview or production deployment.

If Vercel rejects a preview because the Hobby team has reached its build-rate
limit, let accepted builds finish before retrying. The rate-limit gate can run
before the repository's ignored-build command, so unrelated projects may show
a rate-limit failure instead of a normal skipped status even though their code
is unchanged. Do not treat that response as an ignored-build classifier bug.

A public-web-only retry must remain scoped to `apps/web/`; it must not modify
shared or root deployment configuration solely to consume another build slot.

See `../../docs/deployments.md` for the complete dependency matrix, ignored
build rules and rollback procedure.
