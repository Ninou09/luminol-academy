# Luminol Academy Master Roadmap

This document is the canonical delivery sequence for Luminol Academy. `PROJECT_STATUS.md` records the live repository and operational state; this file defines the intended product path.

## Product principles

- One connected academy with Psychology, Languages, and Professional Development schools.
- Authentication, authorization, validation, privacy, and auditability are required platform behavior.
- Shared capabilities are implemented once and reused across schools.
- Sensitive psychology information must never be exposed through general learning, analytics, instructor, organization, or administration views.
- Every milestone includes tests, documentation, accessibility, and production-build validation.
- Dynamic, personal, sensitive, or governed content must not be automatically translated or publicly published without its applicable approval boundary.
- Repository completion and production-live verification are separate evidence gates. Deployment or external-service constraints must not be mistaken for product implementation failure or used to weaken repository safeguards.

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

Delivered capabilities include security and privacy hardening, dependency checks, migration and recovery runbooks, public smoke tests, controlled production deployment, and production verification.

### Milestone 14 — Search and Discovery

Status: Complete

Delivered capabilities include privacy-safe learner search, governed public programme discovery, protected administration search, literal wildcard-safe matching, indexed operational search, and aggregate search-outcome telemetry that stores no raw query text, user identity, session identifier, or IP address.

### Milestone 15 — Arabic, French, and English Localization

Status: Complete

Delivered capabilities include the shared typed `ar`/`fr`/`en` locale contract, localized routing and persistence, Arabic RTL behavior, mixed-script safeguards, localized canonical/`hreflang`/metadata behavior, and preservation of protected source records without guessed automatic translation.

### Milestone 16 — Organizations and Team Learning

Status: Complete

Governing issue: #214 — closed as completed.

Delivered capabilities include first-class organizations, memberships, teams, seats, assigned learning, organization-manager scope, audited academy operations, verified organization links into existing finance/notification flows, and tenant-safe aggregate learning visibility. The production database migration/backfill/integrity-verification gate completed successfully on 2026-08-15.

### Milestone 17 — Privacy-safe Learning Analytics and Outcomes

Status: Complete; governing issue #246 is closed as completed after protected production deployment verification.

Delivered through PRs #247–#252:

- typed analytics privacy and visibility contracts
- learner-self learning/outcome read models and protected portal presentation
- academy programme aggregates behind `academy:manage`
- minimum-group suppression with a threshold of five
- organization-manager aggregates scoped to existing organization membership
- Arabic/French/English analytics presentation and documentation

Production verification confirms the protected administration deployment contains `/analytics` on a main descendant of the final Milestone 17 merge, and the READY learner portal deployment contains the learner/organization analytics surfaces. Signed-out requests fail closed and fresh runtime-error checks are clear. Full authenticated smoke-account journeys remain an operational follow-up under #40. The milestone does not create learner rankings, hidden behavioral scoring, sensitive-trait inference, or a parallel raw analytics event store.

### Milestone 18 — Instructor Cohorts, Ownership, and Delivery Operations

Status: Complete; governing issue #253 is closed as completed after protected production deployment verification.

Delivered through PRs #254–#259:

- first-class cohort lifecycle and instructor assignment contracts
- persisted cohorts, instructor assignments, and cohort memberships linked to existing courses and enrolments
- exact-assignment instructor workspace and cohort teaching views
- academy-authorized cohort delivery and assignment/reassignment operations with audit history
- privacy-suppressed instructor/cohort analytics using Milestone 17 rules

The READY learner portal production build is a descendant of the final Milestone 18 merge and explicitly contains `/instructor`, `/instructor/cohorts/[cohort]`, and `/instructor/cohorts/[cohort]/analytics`. Signed-out access fails closed and fresh production runtime-error verification is clear. Instructor authority remains distinct from academy RBAC and organization-manager authority. Ownership is never inferred from names, activity, submissions, or historical coincidence.

### Milestone 19 — Cohort Sessions, Attendance, and Learner Schedule

Status: Repository implementation complete; exact-merged-head production-live verification remains tracked separately in #263.

Delivered through PRs #264–#269:

- session lifecycle and attendance domain contracts
- session and attendance persistence with cohort/enrolment invariants
- academy session creation, rescheduling, cancellation, and audit history
- instructor attendance recording only for eligible learners in assigned cohorts
- learner self-only upcoming/past schedule and attendance state
- privacy-bounded attendance aggregates

Session time is persisted as UTC instants with an IANA timezone for display semantics. No external calendar or video provider was invented.

### Milestone 20 — Professional Project Submissions and Review Workflow

Status: Repository implementation complete. Governing issue #270 is closed as completed.

Delivered through PRs #271–#276, ending at implementation merge `3b65c6160de6fd35cb350d39ac13c22b25deef55`:

- persistent professional project/submission lifecycle and audit history
- learner draft, submit, status, revision, and resubmission workspace
- exact persisted reviewer assignment and bounded reviewer inbox/detail access
- human review decisions with append-only structured review history and learner-visible feedback
- privacy-safe, idempotent in-app notices for meaningful submission/review transitions using the existing notification infrastructure
- academy professional-project workflow aggregates with minimum-group suppression and no learner-authored content in analytics

Review decisions remain human-entered. There is no AI grading, automatic reviewer assignment, learner ranking, or automatic certification decision.

## Post-milestone public experience hardening

Status: Ongoing as no-cost repository polish where it does not depend on external approvals or account settings; tracked primarily through #235 and specific blocker issues.

Delivered hardening includes premium localized public layouts, reduced-motion behavior, mobile navigation, keyboard skip navigation/focus states, governed CMS media publication, localized metadata and structured data, robots/sitemap hardening, public browser regression coverage, safer enquiry transport, production dependency auditing, learner-portal indexing exclusion, bounded social-preview caching, approved founder media within its documented governance boundary, and progressively more forgiving multilingual programme discovery without storing raw search text.

Current public-site discoverability remains separately blocked by the production Vercel Deployment Protection setting tracked in #241. Application code must not weaken Clerk protection on learner or administration surfaces to work around that project-level setting.

## Parallel operational phase — Post-launch stabilization

Repository work and production-live evidence remain separate. The active operational dependencies are:

- #40 — restricted administration smoke access, authenticated browser state/configuration, sender-domain activation and monitored email delivery, and backup-operator readiness
- #241 — remove Vercel Authentication/SSO from the public production website while retaining appropriate protection elsewhere
- #150 — publish privacy, terms, and cookie notices only after reviewed approved legal copy and verified operator details are supplied
- #85 — observe the migrated Sanity Studio against the intended project/dataset without changing production content merely for verification
- #115 — keep TypeScript 7 migration deferred until the repository toolchain has official compatible support

The `Protect main` ruleset and exact-head GitHub Actions `quality` gate remain mandatory. Authenticated preview smoke may be skipped only when the protected credentials/configuration are genuinely unavailable; that skip is an operational evidence gap, not permission to claim the protected journeys have been verified.

## Next product milestone

No Milestone 21 is currently committed. Do not invent one solely because Milestone 20 repository implementation is complete. New numbered product work should be opened only after a concrete product objective is selected and its authorization, privacy, data-governance, testing, and operational boundaries are written down.

Until then, prioritize non-blocked stabilization and public-experience polish under the existing issues without fabricating external approvals, legal facts, production evidence, or provider integrations.
