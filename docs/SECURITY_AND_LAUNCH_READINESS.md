# Milestone 13 security and launch readiness

This document records the security audit completed in Milestone 13, the controlled-launch runbook, and the operational evidence accumulated after launch. Passing CI remains a repository quality gate rather than proof of production health; production claims require deployment and post-deploy evidence. The current platform and milestone state is summarized in `PROJECT_STATUS.md`, while unresolved operational work is tracked primarily in #40.

## Current post-launch verification state

As of 2026-08-16, the controlled Milestone 13 launch is complete and the platform has continued through Milestone 16 without weakening the launch boundaries documented below.

Verified operational evidence includes:

- stable production aliases for the public website, learner portal, and administration application
- repeated green production health checks, including scheduled run #53 after the Milestone 16 database rollout
- a completed isolated Neon restore drill with read-only row-count, index, constraint, migration-history, relationship-integrity, administration-summary, and permission-resolution evidence
- guarded production database migrations with clean Prisma migration status; Milestone 16 migration run #3 also completed its bounded organization-link backfill and read-only integrity verifier successfully
- a restricted learner smoke account manually verified on learner dashboard, Billing, Notifications, and Account surfaces
- Clerk sign-in/sign-up entry points and Google OAuth handoff checked in a real browser without completing an unintended registration
- public homepage/About/Contact and representative discovery/security responses verified with the expected CSP, COOP, HSTS, `nosniff`, anti-framing, metadata, and privacy behavior
- post-Milestone 16 grouped runtime-error checks clear across web, portal, and administration; the previously observed administration `/finance` Prisma P2022 events are historical pre-migration evidence rather than an active incident
- repository ruleset `Protect main` active for the default branch, requiring pull requests and the GitHub Actions `quality` check, blocking force pushes/deletion, and requiring review-thread resolution without imposing an unavailable second reviewer
- primary operational ownership assigned for monitoring review, incident command, Vercel rollback, Neon recovery, Clerk/Sanity administration, dead-letter review, and payment reconciliation

Still intentionally incomplete:

- restricted administration smoke access and explicit learner-to-administration denial verification
- authenticated Playwright storage-state secrets and protected administration/learner CI journeys
- actual observation of Sanity Studio v6 against the intended project/dataset (#85)
- publication and production verification of one approved active Sanity programme image (#45)
- verified sender-domain setup plus one monitored outbound email delivery and retry/dead-letter check
- designation of a backup operator before broader promotion or planned primary-operator absence
- reviewed public privacy, terms, and cookie notices once approved legal copy exists (#150)

## Surface and authorization inventory

| Surface                                                                   | Exposure                 | Server-side control                                                                                                                                                |
| ------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `web` pages, robots, sitemap                                              | Public                   | Only deliberately public content is selected. Certificate records require a valid opaque identifier and opt-in visibility.                                         |
| `POST /api/enquiries`                                                     | Public mutation          | Zod validation, bounded body, privacy-uniform errors, Vercel-bound client address rate limit.                                                                      |
| Clerk webhook routes                                                      | Public callback          | Svix signature validation before synchronization.                                                                                                                  |
| Admin pages                                                               | Protected                | Clerk middleware plus server authorization in every page/action; platform-global consoles additionally require the trusted `admin` role.                           |
| Certificate admin actions                                                 | Protected mutation       | Platform permission and Zod allow-list. Issuance derives learner/course identity from the completed enrollment instead of trusting hidden form fields.             |
| Portal dashboard, courses, finance, language, notifications, certificates | Learner protected        | `requireUser`; reads and writes include the authenticated user ID. Learner certificate publishing uses `updateMany` with the owner ID and refuses revoked records. |
| Notification delivery worker                                              | Scheduled high-risk job  | Workflow has read-only repository permission, bounded batches and database leases. It exits successfully before checkout when provider configuration is absent.    |
| Studio                                                                    | Operator-only deployment | Sanity authentication and project authorization; no import from another app.                                                                                       |

Organization-bearing finance and notification queries are scoped through verified service inputs. Psychology content currently has no therapy-note or clinical-record persistence surface in this repository; adding one requires a separate threat model and explicit organization/clinician authorization.

The certificate registry and notification-failure console are intentionally
platform-global operational surfaces. They require both the trusted
server-side `admin` role and their specific permission through
`requirePlatformPermission`. Organization roles cannot gain cross-tenant
visibility merely by receiving a similarly named permission. Submitted
organization, learner, and course identifiers are never authority: certificate
issuance accepts only a completion ID and derives the learner and course from
the verified database record. Negative tests cover missing-role and
missing-permission access. This is a platform-operator model, not organization
delegation.

## Findings fixed

- Added CSP, anti-framing, MIME-sniffing, referrer, permissions and cross-origin protections to all Next.js applications. Admin and portal responses are private/no-store, and browser production source maps remain disabled.
- Limited forwarded-client-header trust to the documented Vercel edge boundary. Added bounded cleanup for in-memory enquiry buckets and expired persistent certificate buckets.
- Added reusable recursive logging redaction and same-origin redirect validation with negative tests.
- Added public launch smoke coverage for security headers, robots, sitemap, 404 behavior and privacy-uniform unknown certificate behavior.
- Changed CI to frozen-lockfile installs, minimum read-only GitHub token permissions, tracked-file secret scanning, and a high-severity production dependency audit.
- Added technical `main` ruleset enforcement so pull requests and the existing `quality` gate are required before merge while force pushes and branch deletion are blocked.
- Bounded outbound Resend provider requests with a validated application-level timeout while preserving idempotency and the existing retry/dead-letter flow.

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

## Current operational checklist

- [x] Exact-head CI, security checks, production builds, and public browser smoke tests are established as the repository merge gate.
- [x] Stable public, learner, and administration production aliases have been deployed and repeatedly verified.
- [x] Clerk sign-in/sign-up entry points and Google OAuth handoff have been checked without weakening CSP/COOP boundaries.
- [x] Neon restore-drill evidence has been completed on an isolated restore branch without production mutation.
- [x] Production migration status is clean; guarded Milestone 16 migration/backfill/integrity verification completed successfully.
- [x] Scheduled production health monitoring is active and has produced repeated green runs after the relevant fixes and database rollout.
- [x] A restricted learner smoke account has been manually verified on learner-owned production surfaces.
- [x] Configure `main` ruleset protection so pull requests and the existing `quality` gate are technically enforced without deadlocking the single-operator workflow (#186).
- [ ] Create/configure a restricted administration smoke account when production Clerk access permits it.
- [ ] Confirm the restricted learner smoke account is denied administration access.
- [ ] Configure restricted authenticated Playwright storage states and run protected administration/learner journeys in CI.
- [ ] Observe the migrated Sanity Studio v6 against the intended project/dataset without changing production content (#85).
- [ ] Publish and verify one approved active Sanity programme image with meaningful alt text, crop, hotspot, and explicit publication approval (#45).
- [ ] Verify a Luminol sender domain, complete one monitored outbound email delivery, and verify retry/dead-letter behavior.
- [ ] Designate a backup operator before broader promotion or planned primary-operator absence.
- [ ] Publish reviewed privacy, terms, and cookie notices only after approved legal copy/operator details exist (#150).

## Remaining blockers and deferred work

- Restricted authenticated production smoke coverage remains blocked on appropriate administration test access. Do not create privileged shortcuts or weaken authorization to close the gap.
- Sanity Studio environment verification (#85) requires actual access to or observation of the intended Sanity environment. The code migration/build is already complete.
- Governed Sanity programme-image verification (#45) requires an approved active image-bearing programme; synthetic or unapproved media must not be substituted.
- Outbound learner email remains intentionally disabled until a sender domain/provider path is verified and one controlled delivery plus retry/dead-letter behavior is observed. In-app notifications remain available and the worker stays skip-safe when required provider configuration is absent.
- Backup-operator coverage remains required before broader promotion or a planned primary-operator absence.
- Public legal notices remain blocked on reviewed approved copy under #150. Legal entity facts, lawful bases, retention periods, transfer claims, cookie categories, or contractual rights must not be invented.
- No destructive testing is authorized against production. Any critical/high finding discovered during independent review blocks the affected release until fixed or explicitly risk-accepted by the accountable owner.

## Repository governance baseline

Repository ruleset `Protect main` was verified active on 2026-08-16 for the default branch. It requires pull requests and the GitHub Actions `quality` check before merge, blocks force pushes and deletion, and requires review-thread resolution. Required approving reviews are intentionally zero while only one operator is available, and no bypass actor was configured at verification time. Issue #186 is completed.

Reverify this baseline after any repository-administration change. Do not weaken the `quality` check or add broad bypass permissions to work around a failing build.
