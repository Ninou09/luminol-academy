# Authenticated browser smoke-test setup

This procedure creates restricted Playwright browser-state files for the production administration and learner applications. The files contain active authentication material and must never be committed, attached to an issue, pasted into chat, or shared with another person.

## Prerequisites

- A local checkout of this repository
- Node.js 20 or newer
- pnpm 10
- Chromium installed for Playwright
- One restricted learner smoke account
- One restricted administration smoke account with only the permissions needed by the existing smoke journey

Install dependencies and the browser once:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

The helper accepts only the two hard-coded stable production origins. It does not accept a custom URL, so credentials cannot be entered into an arbitrary host through this command.

## Capture the learner state

Run:

```bash
pnpm auth:capture portal
```

A Chromium window opens on the stable production learner sign-in page. Sign in manually with the restricted learner smoke account. After the learner dashboard is fully visible, return to the terminal and press Enter.

The helper saves:

```text
.auth/portal-state.json
```

## Capture the administration state

Run:

```bash
pnpm auth:capture admin
```

A Chromium window opens on the stable production administration sign-in page. Sign in manually with the restricted administration smoke account. After the administration overview is fully visible, return to the terminal and press Enter.

The helper saves:

```text
.auth/admin-state.json
```

The `.auth` directory is ignored by Git. On Unix systems, the helper enforces owner-only permissions on the directory and files. Confirm both state files remain untracked before continuing:

```bash
git status --short
```

The command must not list either state file.

## Configure GitHub Actions

Use stable production URLs for the operational smoke test:

```text
PLAYWRIGHT_ADMIN_BASE_URL=https://luminol-academy-admin.vercel.app
PLAYWRIGHT_PORTAL_BASE_URL=https://luminol-academy-portal.vercel.app
```

Create these repository secrets:

```text
PLAYWRIGHT_ADMIN_STORAGE_STATE
PLAYWRIGHT_PORTAL_STORAGE_STATE
```

Each secret value is the complete contents of its matching JSON file. Paste those contents only into the GitHub repository secret field.

With GitHub CLI, PowerShell can upload the values without displaying them:

```powershell
Get-Content -Raw .auth/admin-state.json | gh secret set PLAYWRIGHT_ADMIN_STORAGE_STATE
Get-Content -Raw .auth/portal-state.json | gh secret set PLAYWRIGHT_PORTAL_STORAGE_STATE
gh variable set PLAYWRIGHT_ADMIN_BASE_URL --body "https://luminol-academy-admin.vercel.app"
gh variable set PLAYWRIGHT_PORTAL_BASE_URL --body "https://luminol-academy-portal.vercel.app"
```

The authenticated smoke-test steps run only after code reaches `main`. They are skipped for every `pull_request` workflow, so production browser sessions are not injected into code proposed by a pull request.

## Rotation and cleanup

- Delete the local state files after GitHub secrets are configured.
- Revoke or rotate the smoke-account sessions after a suspected leak.
- Re-capture both state files when Clerk invalidates the sessions.
- Never use a personal owner account for recurring automated smoke tests.
