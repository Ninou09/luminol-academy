# Dependabot maintenance policy

Dependabot checks the pnpm workspace and GitHub Actions every Monday in the `Europe/Riga` timezone.

- Minor and patch updates are grouped by ecosystem to reduce pull-request noise.
- Major updates remain separate so framework, authentication, CMS, database, and build-tool migrations receive focused review.
- GitHub Action references remain pinned to full commit SHAs. Dependabot updates the SHA and the same-line release comment together.
- Dependabot pull requests must pass the same security, migration, lint, typecheck, test, build, and browser-smoke checks as other changes.
- No dependency update is automatically merged.
