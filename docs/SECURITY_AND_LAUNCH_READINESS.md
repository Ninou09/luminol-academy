# Milestone 13 security and launch readiness

This document records the code audit completed in Milestone 13 and the operational work that must still be verified. Passing CI means **code-complete**, not production-ready.

## Surface and authorization inventory

| Surface                                                                   | Exposure                 | Server-side control                                                                                                                                                |
| ------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `web` pages, robots, sitemap                                              | Public                   | Only deliberately public content is selected. Certificate records require a valid opaque identifier and opt-in visibility.                                         |
| `POST /api/enquiries`                                                     | Public mutation          | Zod validation, bounded body, privacy-uniform errors, Vercel-bound client address rate limit.                                                                      |
| Clerk webhook routes                                                      | Public callback          | Svix signature validation before synchronization.                                                                                                                  |
| Admin pages                                                               | Protected                | Clerk middleware plus `requirePermission` in every page/action; database mutations re-check identifiers and state.                                                 |
| Certificate admin actions                                                 | Protected mutation       | Permission check and Zod allow-list. Issuance treats hidden user/course IDs as untrusted and verifies the completed enrollment tuple transactionally.              |
| Portal dashboard, courses, finance, language, notifications, certificates | Learner protected        | `requireUser`; reads and writes include the authenticated user ID. Learner certificate publishing uses `updateMany` with the owner ID and refuses revoked records. |
| Notification delivery worker                                              | Scheduled high-risk job  | Workflow has read-only repository permission, bounded batches and database leases. It exits successfully before checkout when provider configuration is absent.    |
| Studio                                                                    | Operator-only deployment | Sanity authentication and project authorization; no import from another app.                                                                                       |

Organization-bearing finance and notification queries were reviewed for scoped service inputs. Psychology content currently has no therapy-note or clinical-record persistence surface in this repository; adding one requires a separate threat model and explicit organization/clinician authorization. Certificates are learner/course records and do not currently carry an organization foreign key. A future organization certificate registry must add that key and a migration rather than infer tenancy from submitted form values.

## Findings fixed

- Added CSP, anti-framing, MIME-sniffing, referrer, permissions and cross-origin protections to all Next.js applications. Admin and portal responses are private/no-store, and browser production source maps remain disabled.
- Limited forwarded-client-header trust to the documented Vercel edge boundary. Added bounded cleanup for in-memory enquiry buckets and expired persistent certificate buckets.
- Added reusable recursive logging redaction and same-origin redirect validation with negative tests.
- Added public launch smoke coverage for security headers, robots, sitemap, 404 behavior and privacy-uniform unknown certificate behavior.
- Changed CI to frozen-lockfile installs, minimum read-only GitHub token permissions, tracked-file secret scanning, and a high-severity production dependency audit.

## Data privacy and logging rule

Never log request headers, cookies, authorization values, provider payloads, notification/email bodies, therapy or assessment content, finance credentials, or raw exceptions from external providers. Log an event code, correlation ID, sanitized resource type, outcome, and a stable non-personal error code. Use `redactSensitive` before structured metadata crosses a logging boundary. Delivery attempts retain only provider reference/error codes; provider failures exposed to users remain generic.

## PostgreSQL migration and Neon recovery runbook

### Clean verification

1. Start an isolated PostgreSQL 16 database; never point this procedure at production.
2. Set `DATABASE_URL` for only that shell.
3. Run `pnpm --filter @luminol/database exec prisma format --check`, `pnpm db:generate`, `pnpm --filter @luminol/database exec prisma validate`, and `pnpm --filter @luminol/database migrate:deploy`.
4. Run `pnpm --filter @luminol/database exec prisma migrate status` and the test suite with `TEST_DATABASE_URL` set to the isolated database.

### Production migration failure

1. Stop the rollout; do not retry mutations blindly and do not edit an applied migration.
2. Capture migration name, timestamps and sanitized Prisma output. Check Neon branch/compute health and application error rate.
3. If no destructive statement ran, correct the forward migration in a new migration and test from both a clean database and a production-like snapshot.
4. If data changed, preserve evidence and create a Neon restore branch from the point-in-time recovery window. Validate row counts, constraints and critical journeys there.
5. Use `prisma migrate resolve` only after a database operator has reconciled actual SQL state with migration history. Record the decision.
6. Prefer a forward fix. Restore/cut over only when the incident lead accepts the recovery-point data loss and downtime. A destructive down migration is not an automatic or generally safe rollback.

## Incident and rollback runbook

1. Declare severity, incident lead and timestamp; freeze releases and rotate any suspected credential in its provider.
2. Preserve privacy-safe logs and audit events. Do not paste customer records or secrets into chat/tickets.
3. Contain with feature/config disablement, traffic rollback to the last known-good immutable deployment, or database access restriction. Do not roll application code behind an incompatible schema.
4. Verify `/`, `/robots.txt`, `/sitemap.xml`, a nonexistent certificate ID, sign-in, admin authorization, learner-owned notification/certificate access, and worker skip/delivery behavior.
5. Monitor authentication failures, 4xx/5xx rates, latency, database saturation, rate-limit volume, notification dead letters, payment reconciliation discrepancies and certificate state transitions.
6. Document timeline, affected tenant/data classes, notifications required, recovery evidence and follow-up owners.

## Controlled launch checklist

- [ ] CI is green; independent security review and Vercel preview are complete.
- [ ] Production environment variables are validated by name/presence without printing values; Clerk and Sanity production origins are allowed by CSP.
- [ ] Neon backup/PITR retention and a restore drill have been verified by an operator.
- [ ] Pending migrations were reviewed and applied manually with `pnpm --filter @luminol/database migrate:deploy`; migration status is clean.
- [ ] Admin and learner smoke credentials exist in a restricted CI environment; authenticated Playwright journeys pass. They must skip when secrets are absent.
- [ ] Accessibility keyboard/focus, Arabic RTL, reduced motion, mobile widths, metadata, canonical URLs and broken internal links are manually checked on the preview.
- [ ] Monitoring dashboards and paging owners are active; rollback target and incident commander are named.
- [ ] A controlled deployment is followed by the public/private verification points in the incident runbook.

## Remaining blockers and deferred work

- Operational Neon restore, production migration, Vercel preview, production environment/CSP, monitoring and authenticated journey checks cannot be proven from local CI and block a production-ready declaration until operators record evidence.
- Outbound email activation is deferred and is not a Milestone 13 blocker. The scheduled worker remains skip-safe when `DATABASE_URL`, `RESEND_API_KEY`, or `NOTIFICATION_FROM_EMAIL` is absent; in-app notifications remain active. Activation requires provider approval, corrected adapter idempotency review, green CI, controlled secrets, and a monitored test delivery. PR #36 is not a dependency.
- No destructive testing is authorized against production. Any critical/high finding discovered during independent review blocks launch until fixed or explicitly risk-accepted by the accountable owner.
