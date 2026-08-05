# Public website deployment

This application maps to the `luminol-academy-web` Vercel project.

Changes in this directory must build the public website preview. They must not
rebuild the learner portal or administration application unless the same Git
comparison also changes one of their shared dependencies.

Repository installs are pinned to pnpm `10.34.5`, require pnpm
`>=10.34.5 <11`, and must continue to use `pnpm install --frozen-lockfile`.
Do not bypass lockfile integrity failures by refreshing checksums during a
normal preview or production deployment.

If Vercel rejects a preview because the Hobby team has reached its build-rate
limit, let accepted builds finish before retrying. A public-web-only retry must
remain scoped to `apps/web/`; it must not modify shared or root deployment
configuration solely to consume another build slot.

See `../../docs/deployments.md` for the complete dependency matrix, ignored
build rules and rollback procedure.
