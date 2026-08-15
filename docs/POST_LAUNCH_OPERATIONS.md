# Luminol Academy Post-launch Operations

This runbook begins after the controlled production launch. It records the stable application addresses, automated checks, manual verification points, and deferred operational work.

## Stable production applications

- Public website: `https://luminol-academy-web.vercel.app`
- Learner portal: `https://luminol-academy-portal.vercel.app`
- Administration: `https://luminol-academy-admin.vercel.app`

The three addresses were manually confirmed reachable on 2026-08-03 after Milestone 13 and the certificate-verification hotfix.

## Scheduled health check

Workflow: `.github/workflows/production-health-check.yml`

The workflow runs approximately every six hours and can also be started manually from GitHub Actions. It verifies:

- the public homepage returns its expected launch heading
- `robots.txt` is reachable and references a sitemap
- `sitemap.xml` is reachable and contains a URL set
- a malformed certificate identifier returns the privacy-preserving 404 response
- the learner portal is reachable
- the administration application is reachable

A failed workflow is evidence that an operator must investigate. Do not retry repeatedly before checking Vercel deployment state, runtime errors, provider status, and recent repository changes.

GitHub scheduled workflows are approximate and may be delayed. This workflow is a low-cost synthetic check, not a guaranteed paging service.

## Milestone 16 production database rollout

Workflow: `.github/workflows/production-migrations.yml`

Run this workflow only from the intended `main` revision after the repository quality gate is green and the operator has confirmed that the deployed application revision is compatible with the pending database expansion. The workflow is deliberately manual: it requires the exact `APPLY` confirmation and the production `DATABASE_URL` repository secret.

The workflow performs the database work in this order:

1. deploy pending Prisma migrations
2. run the dependency-ordered Milestone 16 organization-link backfill in bounded batches
3. run the read-only Milestone 16 organization-link integrity verifier
4. verify Prisma migration status

The backfill preserves deliberately opaque legacy organization identifiers and only establishes first-class links where the required organization, parent, membership, and recipient relationships can be proven. The verifier runs in a repeatable-read, read-only transaction with a bounded statement timeout. It outputs aggregate counts only and must not print organization identifiers, user identifiers, notification content, finance details, or other personal data.

The verifier fails the workflow if any relationship that is currently eligible for verification remains unverified, or if an already verified record has a structural organization, parent, or recipient mismatch. It also reports aggregate counts of first-class rows that remain deliberately unverified; those informational counts are not automatically failures because historical rows may intentionally remain unverified when their relationship cannot be proven safely.

After a successful production migration workflow:

1. Record the workflow run ID, UTC completion time, deployed `main` SHA, and aggregate verifier outcome without copying database credentials or record data.
2. Confirm the administration organization workspace at `/organizations` loads for an authorized restricted administration account when that test access is available.
3. Confirm the learner organization-manager workspace at `/organization` loads only for an eligible organization manager test account when that test access is available.
4. Verify representative organization finance and notification behavior only with approved test records; never copy production finance, notification, assessment, psychology, or identity data into an issue or chat.
5. Confirm the normal public/portal/admin production health checks remain green and inspect grouped Vercel runtime errors for the affected applications.
6. If restricted authenticated test access is unavailable, record that verification item as operationally blocked rather than weakening authorization or creating a privileged shortcut.

Milestone 16 should not be described as production-live until the production migration workflow and the applicable post-deploy organization checks are complete.

## Manual verification after a deployment

1. Confirm the exact Git commit deployed to all affected Vercel projects.
2. Open the public homepage and verify the hero, navigation, school links, About page, and contact page.
3. Confirm `robots.txt`, `sitemap.xml`, and a nonexistent route behave correctly.
4. Confirm `/certificates/short` returns 404 rather than 500.
5. Sign in with a restricted learner smoke account and open the dashboard, finance, notifications, and certificate areas.
6. Sign in with a restricted administration smoke account and open the overview, finance, notifications, and certificate registry.
7. Inspect Vercel runtime errors for the public web, learner portal, and administration projects.
8. Record the deployment IDs, UTC time, browser, and result without copying tokens, cookies, personal records, or secrets.

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

## Remaining operational evidence

### Authenticated smoke automation

Authenticated Playwright checks remain skip-safe until restricted administration and learner storage-state secrets and preview URLs are configured. These credentials must be dedicated test accounts with minimum permissions.

### Neon restore drill

A database operator must create a restore branch from an approved recovery point and verify migration history, representative row counts, constraints, and critical application journeys. The drill must never overwrite production.

### Clerk, Sanity, and OAuth browser verification

Production sign-in, sign-up, OAuth popup, and Sanity asset flows require a real browser check for CSP, COOP, origin, and redirect behavior. Do not broaden security headers without evidence from the browser console and network log.

### Outbound email

External email remains deferred. Real learner delivery requires:

- a verified Luminol sender domain
- a controlled Resend key
- a From address under the verified domain
- a monitored test delivery
- confirmation that retry and dead-letter behavior remain bounded

Using `onboarding@resend.dev` is suitable only for restricted provider testing and not for general learner delivery.

## Ownership required before wider promotion

Record named owners for:

- monitoring review
- incident command
- Vercel rollback
- Neon recovery
- Clerk and Sanity administration
- notification dead-letter review
- payment reconciliation

Until those owners and the remaining evidence are recorded, the code is launched and usable but the operation should remain controlled rather than broadly promoted.
