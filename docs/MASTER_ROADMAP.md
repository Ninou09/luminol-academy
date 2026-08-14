# Luminol Academy Master Roadmap

This document is the canonical delivery sequence for Luminol Academy. `PROJECT_STATUS.md` records the live repository and operational state; this file defines the intended product path.

## Product principles

- One connected academy with Psychology, Languages, and Professional Development schools.
- Authentication, authorization, validation, privacy, and auditability are required platform behavior.
- Shared capabilities must be implemented once and reused across schools.
- Sensitive psychology information must never be exposed through general learning or administration views.
- Every milestone includes tests, documentation, accessibility, and production build validation.
- Dynamic, personal, sensitive, or governed content must not be automatically translated or publicly published without its applicable approval boundary.
- Repository completion and production-live verification are separate evidence gates; deployment quota pressure must not be mistaken for product completion or used to stop safe repository work.

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

## Active product milestone

### Milestone 16 — Organizations and Team Learning

Status: Active

Issue #214 is the governing milestone issue. The milestone adds a first-class organization and team-learning layer by reusing the platform's existing enrolment, professional-development, finance, notification, certificate, search, localization, and authorization foundations rather than creating a parallel learner system.

The delivery boundary is intentionally staged:

1. **Organization and team domain foundation** — define organization lifecycle states, organization membership roles, teams, seat-allocation scope, fail-closed manager access, and privacy-safe aggregate learning visibility with unit coverage.
2. **Persistence and migration** — add first-class organization, membership, team, team-membership, organization-course, and sponsored-enrolment persistence with tenant-safe constraints and a production-safe backfill strategy before any finance foreign key is introduced.
3. **Administration operations** — add protected organization/team administration under the existing `academy:manage` boundary, with audited mutations and server-side organization scope checks.
4. **Organization manager experience** — provide a restricted organization-manager surface for the manager's own roster, seat utilization, assigned learning, and approved aggregate progress. Organization membership does not grant academy-wide administration rights.
5. **Finance, notifications, and localization integration** — connect verified organization records to corporate billing, existing notifications and certificates, and the governed Arabic/French/English localization layer.

Milestone 16 security and privacy invariants are non-negotiable:

- every organization-scoped read and write is authorized server-side
- organization membership and global academy RBAC remain separate concepts
- URL/form organization identifiers are untrusted input and must be verified against the signed-in user's membership
- managers receive only explicitly approved aggregate learning and seat information
- assessment answers, psychology content, enquiry messages, personal finance records, private certificate metadata, and unrelated learner data are not exposed to organization managers
- cross-organization roster, search, learning, finance, and mutation access fails closed
- there is no public organization directory and no guessed translation of identity or sensitive learner data

Explicitly excluded from Milestone 16 are SSO/SAML/SCIM, HRIS integrations, AI-generated manager insights, public organization profiles, and replacement of the existing enrolment, RBAC, finance, certificate, or notification systems.

Repository completion and production-live verification remain separate. Milestone 16 must pass the normal exact-head quality and review gates, and no slice is described as production-live until its deployment and applicable post-deploy verification exist.

## Post-milestone public experience hardening

Status: Repository implementation active and strongly validated; production freshness is evidence-based per change, and governed real-media verification remains operationally incomplete.

The premium public redesign was intentionally delivered outside a new numbered product milestone so it could preserve the platform contracts completed in Milestones 1–15. The repository includes:

- immersive localized homepage storytelling and a reusable reduced-motion-aware motion controller
- premium sticky public navigation and footer treatment
- premium school, About, and Contact experiences using token-governed RTL-safe responsive layouts
- governed editorial media fallbacks that do not require unapproved photography
- an explicit Sanity programme-image publication approval field whose safe default is `false`
- public projection rules that omit unapproved or malformed programme imagery
- a localized premium 404 recovery experience
- localized keyboard skip-to-content navigation and stable main-content targets
- mobile primary navigation that stays available on narrow screens
- reduced-motion-safe scrolling, sticky-header anchor offsets, and explicit public-shell keyboard focus rings
- structured-data, metadata, sitemap/robots, responsive, accessibility, and browser-regression hardening
- Vercel affected-package checks and opt-in non-production preview deployment policy to reduce monorepo deployment pressure
- repaired production dependency auditing and continued exact-head security checks
- explicit learner-portal indexing exclusion
- accessible enquiry submission-state announcements
- bounded shared caching for generated social previews
- protection-aware synthetic sign-in monitoring
- hardened public-enquiry transport boundaries
- approved founder media on About and the Psychology school hero with localized accessible naming and explicit governance metadata

The later real-photography phase is not complete until additional approved governed assets exist and are verified through the applicable publication path. No synthetic testimonial, private record, unapproved portrait, or undocumented real-person photograph should be introduced merely to complete that visual phase.

Vercel Free-plan quota or build-rate pressure may temporarily leave stable production aliases behind the repository head. Safe repository development continues behind the exact-head GitHub CI gate, while production-live claims remain blocked until the corresponding deployment and post-deploy checks exist.

## Parallel operational phase — Post-launch stabilization

Milestone 16 repository development is active while operational stabilization and governance continue in parallel. New organization work must not weaken or bypass the remaining production, media, repository-governance, legal, authentication, or recovery gates.

### Production availability and monitoring

- keep normal `main` deployments and post-deploy verification healthy when deployment capacity is available
- continue scheduled synthetic checks for the public website, learner portal, and administration application
- close #192 only after a fully green post-fix scheduled or manual production-health run
- verify robots/sitemap, structured data, security headers, canonical metadata, and representative public routes after relevant production changes
- investigate grouped runtime errors before treating individual log lines as production incidents
- distinguish quota-blocked deployment freshness from application runtime failures

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
- reuse the already approved founder portrait only within its documented governance boundary; require explicit approval for additional real-person assets

### Sanity Studio operational verification

- the coordinated Studio v3 → v6 code migration is complete through PR #112
- launch the migrated Studio against the intended Sanity project/dataset without modifying production content solely for verification
- confirm the governed schema and expected desks/document types load successfully
- retain sanitized verification evidence under #85

### Repository governance

- configure `main` branch/ruleset protection under #186
- require the existing quality gate before merge without deadlocking the current single-operator workflow
- block force pushes and branch deletion
- preserve the existing PR-based operating discipline until GitHub settings enforce it technically

### Public legal notices

- add privacy, terms, and cookie notices only from reviewed approved copy under #150
- do not infer legal entity facts, controller details, retention periods, lawful bases, transfer claims, cookie categories, or contractual rights
- keep current enquiry consent behavior intact while legal copy remains pending

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

- TypeScript 7 toolchain migration — #115 — deliberately deferred until typescript-eslint and the wider toolchain officially support the chosen migration architecture
- Sanity Studio v6 environment verification — #85 — code migration complete; only operational observation against the intended environment remains

Major compiler/CMS changes must preserve strict type checking, schema governance, production builds, and the complete CI/browser gate. They should not be merged as isolated dependency-major bumps merely because Dependabot opened an update.

## Future platform opportunities

These are not committed milestones and must not displace operational stabilization or the bounded Milestone 16 delivery sequence:

- richer background-job processing and dedicated queue infrastructure when scale justifies it
- approved AI-assisted learning tools with explicit privacy and human-review boundaries
- SSO/SCIM and external HR-system integrations only after the first-party organization model is proven
- native mobile applications
- dedicated external uptime and paging service
- deeper analytics only where data minimization and consent requirements are satisfied
