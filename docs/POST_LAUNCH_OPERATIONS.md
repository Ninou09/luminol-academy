# Luminol Academy Post-launch Operations

This runbook begins after the controlled production launch. It records stable application addresses, automated checks, manual verification points, completed operational evidence, and the remaining external gates. `PROJECT_STATUS.md` remains the canonical current-state summary; issue #40 tracks unresolved post-launch operations.

## Stable production applications

- Public website: `https://luminol-academy-web.vercel.app`
- Learner portal: `https://luminol-academy-portal.vercel.app`
- Administration: `https://luminol-academy-admin.vercel.app`

The three addresses were manually confirmed reachable after Milestone 13 and have continued to be exercised by production monitoring and later rollout checks.

## Scheduled health check

Workflow: `.github/workflows/production-health-check.yml`

The workflow runs approximately every six hours and can also be started manually from GitHub Actions. It verifies:

- the public homepage returns its expected launch heading
- `robots.txt` is reachable and references a sitemap
- `sitemap.xml` is reachable and contains a URL set
- a malformed certificate identifier returns the privacy-preserving 404 response
- the learner sign-in entry point is reachable with the expected private/security behavior
- the administration sign-in entry point is reachable with the expected private/security behavior

A failed workflow is evidence that an operator must investigate. Do not retry repeatedly before checking Vercel deployment state, runtime errors, provider status, and recent repository changes.

GitHub scheduled workflows are approximate and may be delayed. This workflow is a low-cost synthetic check, not a guaranteed paging service.

Current evidence: scheduled Production health check #53, attempt 2, completed successfully on 2026-08-15 after the Milestone 16 production database rollout. Continue scheduled monitoring; do not treat one green run as a substitute for incident response when runtime evidence changes.

## Milestone 16 production database rollout

Workflow: `.github/workflows/production-migrations.yml`

The rollout workflow is intentionally manual. It rejects dispatches from any ref other than `refs/heads/main`, requires the exact `APPLY` confirmation, and requires the production `DATABASE_URL` secret. Its execution order is:

1. deploy pending Prisma migrations
2. run the dependency-ordered Milestone 16 organization-link backfill in bounded batches
3. run the read-only Milestone 16 organization-link integrity verifier
4. verify Prisma migration status

The backfill preserves deliberately opaque legacy organization identifiers and only establishes first-class links where the required organization, parent, membership, and recipient relationships can be proven. The verifier runs in a repeatable-read, read-only transaction with a bounded statement timeout. It outputs aggregate counts only and must not print organization identifiers, user identifiers, notification content, finance details, or other personal data.

The verifier fails the workflow if any relationship that is currently eligible for verification remains unverified, or if an already verified record has a structural organization, parent, or recipient mismatch. It also reports aggregate counts of first-class rows that remain deliberately unverified; those informational counts are not automatically failures because historical rows may intentionally remain unverified when their relationship cannot be proven safely.

### Completed production evidence

Milestone 16 production rollout completed successfully on 2026-08-15 through `Production database migrations` run #3 (`31888530778`) from canonical `main` at `add12f9e0a2fb251fd9459f54cbf2c120345a1c8`.

- all pending Prisma migrations applied successfully
- the bounded organization-link backfill completed without rows requiring reconciliation in the four integration tables
- the read-only verifier reported zero eligible-unverified rows and zero structural/parent/recipient mismatches
- Prisma reported the production schema up to date
- the earlier administration `/finance` Prisma P2022 errors caused by missing Milestone 16 columns disappeared from the post-migration runtime-error window
- signed-out `/finance`, administration `/organizations`, and learner `/organization` checks continued to fail closed as designed
- grouped post-migration runtime errors were clear for web, portal, and administration in the checked window
- Production health check #53 attempt 2 passed afterward

Issue #214 is closed as completed. Restricted authenticated administration and organization-manager browser smoke remains an independent operational dependency under #40; do not weaken authorization or create privileged shortcuts to manufacture that evidence.

For any future production migration, preserve the same guarded procedure: record workflow run ID, UTC completion time, deployed `main` SHA, migration status, and aggregate verifier outcome without exposing credentials or record data, then perform the applicable post-deploy checks.

## Manual verification after a deployment

1. Confirm the exact Git commit deployed to all affected Vercel projects.
2. Open the public homepage and verify the hero, navigation, school links, About page, and contact page.
3. Confirm `robots.txt`, `sitemap.xml`, and a nonexistent route behave correctly.
4. Confirm a malformed/short certificate identifier returns the privacy-preserving 404 rather than 500.
5. Sign in with a restricted learner smoke account and open the dashboard, finance, notifications, and certificate areas when credentials are available.
6. Sign in with a restricted administration smoke account and open the overview, finance, notifications, certificate registry, and organization surfaces when appropriate restricted credentials are available.
7. Inspect grouped Vercel runtime errors for the public web, learner portal, and administration projects.
8. Record deployment IDs, UTC time, browser, and result without copying tokens, cookies, personal records, or secrets.

When authenticated test access is unavailable, record that check as blocked. Do not weaken Clerk, RBAC, organization-membership, or tenant-scope boundaries to make a smoke test pass.

## Incident first response

When a health check fails:

1. Freeze new releases until the failure is understood.
2. Identify the affected application and the last known-good Vercel deployment.
3. Review deployment build logs and grouped runtime errors.
4. Check Clerk, Neon, Sanity, and Vercel service health where relevant.
5. Avoid database mutations and repeated worker runs until the failure mode is known.
6. Roll back application traffic only when the previous deployment is compatible with the current database schema.
7. Preserve sanitized timestamps, deployment IDs, route names, and stable error codes.

Never paste secrets, cookies, authorization headers, notification bodies, finance credentials, assessment content, or personal records into an issue or chat.

## Operational evidence and remaining gates

### Authenticated smoke automation

A restricted learner smoke account has been manually verified on production learner-owned surfaces. The restricted administration smoke account, learner-to-administration denial verification, authenticated Playwright storage-state secrets, and protected CI journeys remain blocked until appropriate production test access is available. Authenticated tests must remain skip-safe when secrets are absent.

### Neon restore drill

Completed. An isolated temporary restore branch was verified with read-only checks covering migration history, representative aggregate row counts, indexes, constraints, relationship integrity, an administration-summary journey, and permission resolution. Production was not mutated or replaced. Future restore drills should preserve the same isolated, read-only verification discipline.

### Clerk, Sanity, and OAuth browser verification

Clerk sign-in/sign-up entry points and Google OAuth handoff have been exercised in a real browser without completing an unintended registration, and representative public/authentication responses retained the expected CSP/COOP/security behavior.

Sanity Studio v6 environment verification remains separate under #85 because the connected environment does not expose the intended Studio project/dataset. Approved Sanity programme-image publication and production verification remains under #45. Do not publish or alter production content solely to close either issue.

### Outbound email

External learner email remains deferred. Real learner delivery requires:

- a verified Luminol sender domain
- controlled provider credentials in the applicable deployment environment
- a From address under the verified domain
- one monitored delivery to an approved test recipient
- confirmation that retry and dead-letter behavior remain bounded

Using a provider onboarding/test sender is suitable only for restricted provider testing and not for general learner delivery.

### Repository governance

`main` is still reported by GitHub as unprotected. Issue #186 tracks configuring branch protection or an equivalent ruleset requiring the existing `quality` gate while preserving the current single-operator workflow. Until GitHub settings enforce it, continue the procedural PR + exact-head CI discipline and do not simulate protection through application code.

### Public legal notices

Privacy, terms, and cookie notices remain blocked on reviewed approved copy and verified operator details under #150. Do not invent legal-entity facts, lawful bases, retention periods, transfer claims, cookie categories, or contractual rights.

## Operational ownership

Primary operational ownership is currently assigned to `Ninou09` for:

- monitoring review
- incident command
- Vercel rollback
- Neon recovery
- Clerk and Sanity administration
- notification dead-letter review
- payment reconciliation

A backup operator must still be designated before broader promotion or any planned primary-operator absence. Until that backup coverage and the remaining external gates are complete, continued operation should remain controlled and evidence-based.
