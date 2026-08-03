# Luminol Academy Project Status

_Last updated: 2026-08-03_

## Current state

Luminol Academy is deployed as a production-oriented platform with a public website, learner portal, administration application, Sanity Studio, PostgreSQL persistence, Clerk authentication, database-backed RBAC, language learning, professional development, finance foundations, notifications, and certificate verification.

The canonical branch is:

`main`

Stable production applications:

- Public website: `https://luminol-academy-web.vercel.app`
- Learner portal: `https://luminol-academy-portal.vercel.app`
- Administration: `https://luminol-academy-admin.vercel.app`

Milestones 1 through 13 are complete. Production migrations are applied and the three stable application aliases were manually verified on 2026-08-03.

## Delivered milestones

### Milestone 1 — Production monorepo foundation

- pnpm workspace and Turborepo
- Next.js applications for web, admin, portal, and studio
- shared packages, Prisma, PostgreSQL, Docker, CI, linting, type checking, and tests

### Milestone 2 — Database, authentication, and authorization

- Clerk synchronization
- database-backed roles and permissions
- protected routes and signed webhook handling

### Milestone 3 — Design system

- typed design tokens
- shared accessible UI primitives
- RTL-safe and reduced-motion foundations

### Milestone 4 — Public website and CMS

- institutional website and school pages
- About and contact enquiry flows
- governed Sanity CMS integration

### Milestone 5 — Learner platform foundations

- learner dashboard
- enrolment-protected course workspace
- public privacy-controlled certificate verification

### Milestone 6 — Administration operations

- operations dashboard
- enquiry and enrolment workflows
- deployment and production build corrections

### Milestone 7 — Learner account

- protected account overview
- synchronized identity and role visibility

### Milestone 8 — Guided learning experience

- lesson viewer and resume learning
- module navigation and secure resources
- server-validated completion flow

### Milestone 9 — Language Platform

- CEFR language domain
- placement assessments
- learner language dashboard
- vocabulary and practice tools
- instructor and administration workflows

### Milestone 10 — Professional Development Platform

- competency programmes, cohorts, workshops, assignments, review, and analytics

### Milestone 11 — Finance and Payments

- products and prices
- checkout and payment lifecycle foundations
- invoices, refunds, reconciliation, and finance administration

### Milestone 12 — Notifications and Certificates

- in-app notification delivery
- durable notification worker with leases, retry, and dead-letter handling
- certificate issuance, replacement, revocation, and public verification
- transactional email adapter retained in deferred, skip-safe mode

### Milestone 13 — Production Hardening and Launch

- application and dependency security review
- hardened response headers and privacy-safe logging controls
- migration and recovery runbooks
- public launch smoke tests
- controlled production deployment
- malformed certificate identifiers corrected to return a privacy-preserving 404

## Current operational phase

The platform is now in post-launch stabilization. Current work is intentionally operational rather than a new feature milestone:

1. Run scheduled synthetic checks against the three production applications.
2. Complete authenticated admin and learner browser smoke tests with restricted test accounts.
3. Perform and document a Neon restore drill without touching production data.
4. Verify Clerk, Sanity, and OAuth browser flows and CSP behavior.
5. Activate outbound email only after a sender domain is verified and a monitored test delivery succeeds.
6. Assign monitoring, incident, and rollback ownership before wider public promotion.

## Quality gates

Every production change must preserve the architecture and pass:

- frozen dependency installation
- secret and dependency security checks
- Prisma generation and migration validation
- linting and strict type checking
- unit and integration tests
- production builds
- public launch smoke tests
- Vercel preview verification
- independent diff review before merge

## Known deferred work

- Authenticated Playwright checks remain skipped until restricted storage-state secrets and preview URLs are configured.
- Neon point-in-time recovery capability exists, but an operator restore drill still needs recorded evidence.
- Resend email delivery is not active for real learners until Luminol verifies a sender domain.
- GitHub scheduled workflows run approximately and are not a substitute for a dedicated paging service.
