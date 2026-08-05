Validation checklist:

- Configuration syntax version is `2`.
- pnpm is configured through the `npm` ecosystem at the workspace root.
- GitHub Actions are configured through the `github-actions` ecosystem at `/`.
- Both schedules use explicit IANA timezone `Europe/Riga`.
- Minor and patch updates are grouped; major updates remain independent.
- Pull-request limits apply only to version updates; security updates remain outside those limits.
