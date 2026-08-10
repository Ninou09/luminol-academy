# Luminol Academy Master Roadmap

This document is the canonical delivery sequence for Luminol Academy. `PROJECT_STATUS.md` records the live state; this file defines the intended product path.

## Product principles

- One connected academy with Psychology, Languages, and Professional Development schools.
- Authentication, authorization, validation, privacy, and auditability are required platform behavior.
- Shared capabilities must be implemented once and reused across schools.
- Sensitive psychology information must never be exposed through general learning or administration views.
- Every milestone includes tests, documentation, accessibility, and production build validation.
- Dynamic, personal, sensitive, or governed content must not be automatically translated or publicly published without its applicable approval boundary.

## Delivered platform

### Milestone 1 — Production monorepo foundation

Status: Complete

### Milestone 2 — Database, authentication, and RBAC

Status: Complete

### Milestone 3 — Design system and UI foundation

Status: Complete

### Milestone 4 — Public website and CMS

Status: Complete

### Milestone 5 — Learner portal and course workspace

Status: Complete

### Milestone 6 — Administration operations

Status: Complete

### Milestone 7 — Learner account experience

Status: Complete

### Milestone 8 — Guided learning experience

Status: Complete

### Milestone 9 — Language Platform

Status: Complete

Delivered capabilities include the CEFR language domain, placement assessments, learner progress, vocabulary practice, instructor review, administration tools, tests, and production validation.

### Milestone 10 — Professional Development Platform

Status: Complete

Delivered capabilities include competency-based programmes, workshops and cohorts, practical assignments, instructor review, and professional-development analytics.

### Milestone 11 — Finance and Payments

Status: Complete

Delivered capabilities include products and prices, checkout and payment lifecycle foundations, invoices and receipts, refund and reconciliation support, and finance administration.

### Milestone 12 — Notifications and Certificates

Status: Complete

Delivered capabilities include in-app notifications, durable worker claims and leases, retry and dead-letter handling, certificate issuance and lifecycle controls, and privacy-controlled public verification. External email activation remains operationally deferred until a sender domain is verified.

### Milestone 13 — Production Hardening and Launch

Status: Complete

Delivered capabilities include the security and privacy audit, response hardening, dependency checks, migration and recovery runbooks, public smoke tests, controlled production deployment, and production verification.

### Milestone 14 — Search and Discovery

Status: Complete

Delivered capabilities include privacy-safe learner search scoped to eligible enrolled and published learning content, governed public programme discovery, protected administration search, literal wildcard-safe PostgreSQL matching, indexed operational contains searches, and privacy-safe aggregate search outcome telemetry. The milestone does not store raw search queries, user identities, sessions, or IP addresses in search telemetry.

AI/vector search and external paid search providers remain explicitly out of scope until the deterministic search layer is proven in broader use.

### Milestone 15 — Arabic, French, and English Localization

Status: Complete

Delivered capabilities include the shared typed `ar`/`fr`/`en` locale contract, locale-aware routing and persistence, localized public/learner/administration interfaces, Arabic RTL behavior, mixed-script bidi safeguards, localized canonical/`hreflang`/metadata behavior, and preservation of protected search and authorization boundaries across locales.

Dynamic learner records, enquiry messages, assessments, finance data, certificate data, psychology content, personal identity data, and governed CMS source content remain source data rather than receiving guessed automatic translations.

## Post-milestone public experience hardening

Status: Implemented in the repository; final production freshness and governed real-media verification remain operationally pending.

The premium public redesign was intentionally delivered outside a new numbered product milestone so it could preserve the platform contracts completed in Milestones 1–15. The current repository includes:

- immersive localized homepage storytelling and a reusable reduced-motion-aware motion controller
- premium sticky public navigation and footer treatment
- premium school, About, and Contact experiences using token-governed RTL-safe responsive layouts
- governed editorial media fallbacks that do not require unapproved photography
- an explicit Sanity programme-image publication approval field whose safe default is `false`
- public projection rules that omit unapproved or malformed programme imagery
- a localized premium 404 recovery experience
- localized keyboard skip-to-content navigation and stable main-content targets
- additional structured-data, metadata, sitemap/robots, responsive, accessibility, and browser-regression hardening
- Vercel affected-package checks and opt-in non-production preview deployment policy to reduce monorepo deployment pressure

The later real-photography phase is not complete until approved governed assets exist and are verified in production. No synthetic testimonial, private record, or unapproved portrait should be introduced merely to complete that visual phase.

## Active operational phase — Post-launch stabilization

No new numbered product milestone is currently active. Operational stabilization and governance take priority over new feature breadth while the remaining external dependencies are resolved.

### Production freshness and availability

- recover Vercel deployment capacity and deploy current `main` to the stable production aliases (#128)
- verify robots/sitemap, structured data, security headers, canonical metadata, and representative public routes after the fresh deployment
- continue scheduled synthetic checks for the public website, learner portal, and administration application
- investigate grouped runtime errors before treating individual log lines as production incidents

### Authenticated production verification

- obtain a restricted administration smoke account when production Clerk access permits it
- verify the restricted learner smoke account remains denied administration access
- configure authenticated Playwright storage-state secrets and stable protected test targets
- run protected administration and learner browser journeys in CI
- preserve Clerk, OAuth, CSP, and server-side authorization boundaries

### Governed media verification

- publish only approved active Sanity programme media
- verify meaningful alternative text, crop, hotspot, CDN source, and explicit publication approval
- keep unapproved or malformed media fail-closed and text-only
- complete the remaining production checks tracked in #45 and the real-media phase tracked in #93

### Data recovery and operations

- maintain the completed Neon restore-drill evidence and recovery runbooks
- retain production migration evidence without exposing secrets
- keep monitoring, incident command, Vercel rollback, and Neon recovery ownership explicit
- designate a backup operator before broader promotion or planned primary-operator absence

### Outbound email activation

- verify a Luminol sender domain
- configure the controlled email provider credentials only in the applicable deployment environment
- complete a monitored delivery to an approved test recipient
- verify retry and dead-letter behavior before enabling real learner delivery

## Planned maintenance work

These are coordinated maintenance initiatives, not active product milestones, and should remain isolated from unrelated feature work:

- TypeScript 7 toolchain migration — #115
- Sanity Studio v6 migration — #85

Major compiler/CMS upgrades must preserve strict type checking, schema governance, production builds, and the complete CI/browser gate. They should not be merged as isolated dependency-major bumps merely because Dependabot opened an update.

## Future platform opportunities

These are not committed milestones and must not displace operational stabilization:

- richer background-job processing and dedicated queue infrastructure when scale justifies it
- approved AI-assisted learning tools with explicit privacy and human-review boundaries
- corporate accounts and team learning
- native mobile applications
- dedicated external uptime and paging service
- deeper analytics only where data minimization and consent requirements are satisfied
