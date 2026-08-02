# Milestone 13 — Security Audit and Production Launch

## Objective

Complete a production-grade security and launch-readiness audit across the Luminol Academy monorepo, fix verified findings, document remaining operational risks, and prepare a controlled launch without making outbound email delivery a blocker.

## Required workstreams

### 1. Authorization and organization isolation

- Inventory every protected page, route handler, server action, API endpoint, background job, and public endpoint.
- Verify authentication and permission checks execute server-side.
- Verify organization-scoped records cannot be read or mutated across tenants.
- Add negative tests for insecure direct object reference, hidden-form tampering, mass assignment, and unauthorized state transitions.
- Pay special attention to psychology, finance, notifications, certificate administration, enrollment, and learner-owned resources.

### 2. Application security

- Review CSRF exposure, open redirects, SSRF, injection, unsafe deserialization, path traversal, file handling, and sensitive data exposure.
- Add production security headers and a Content Security Policy compatible with Clerk, Sanity, Vercel, and required application assets.
- Review cookies, caching, redirects, error pages, and production source-map behavior.
- Ensure public and high-risk endpoints have appropriate rate limits and privacy-safe error responses.

### 3. Privacy, logging, and auditability

- Ensure logs and errors do not expose secrets, therapy data, financial details, email bodies, provider payloads, or personal identifiers unnecessarily.
- Review audit-event coverage for security-sensitive administration and state changes.
- Add redaction helpers and tests where needed.

### 4. Supply chain and CI security

- Review dependencies, lockfile integrity, GitHub Actions permissions, action pinning strategy, secret usage, pull-request trust boundaries, and artifact handling.
- Add secret scanning and dependency/security checks that are stable and actionable.
- Do not expose secret values in logs or workflow output.

### 5. Database and operations

- Verify Prisma schema and all migrations against PostgreSQL.
- Confirm production migration status remains explicit and separate from application builds.
- Document Neon backup/restore, migration rollback decision-making, and incident recovery.
- Add safe operational checks without destructive production tests.

### 6. Launch verification

- Add unauthenticated production smoke tests for public pages, health behavior, robots, sitemap, error handling, and certificate verification.
- Add authenticated Playwright smoke coverage for critical admin and learner journeys only where credentials can be safely supplied through CI secrets.
- Verify accessibility, mobile behavior, SEO metadata, and broken links.
- Prepare monitoring, rollback, incident response, and a step-by-step launch checklist.

## Deferred email delivery

Outbound email-provider activation is deferred. This milestone must verify that:

- in-app notifications continue to work;
- the scheduled email worker skips safely when provider secrets are absent;
- no email-provider adapter is merged with unresolved review findings;
- the launch checklist marks external email delivery as a deferred operational item.

## Quality gates

Before this milestone can be marked ready:

- Prisma generate and validate pass;
- migrations deploy cleanly to ephemeral PostgreSQL;
- lint and typecheck pass;
- all unit and integration tests pass;
- production builds pass;
- security checks are green or documented with justified exceptions;
- Vercel preview is Ready;
- the final diff receives independent review;
- production rollout and post-deployment verification steps are documented.

Do not merge or mark ready merely because CI is green. Critical and high-severity findings must be fixed or explicitly block launch.
