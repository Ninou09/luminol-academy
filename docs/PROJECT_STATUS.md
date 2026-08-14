# Luminol Academy Project Status

_Last updated: 2026-08-14_

## Current state

Luminol Academy is a production-oriented multilingual platform with a public website, learner portal, administration application, Sanity Studio, PostgreSQL persistence, Clerk authentication, database-backed RBAC, language learning, professional development, finance foundations, notifications, certificates, deterministic search and discovery, and governed Arabic/French/English localization.

The canonical branch is:

`main`

Current canonical `main` head at this status update:

`54a622ac1dd6f7e56100e66aade7eef823bd09ae`

Stable production application aliases:

- Public website: `https://luminol-academy-web.vercel.app`
- Learner portal: `https://luminol-academy-portal.vercel.app`
- Administration: `https://luminol-academy-admin.vercel.app`

Milestones 1 through 15 are complete in the repository. Milestone 16 — Organizations and Team Learning — is now active under #214, with its first domain-governance slice developed through PR #215. Post-launch stabilization, public-experience hardening, media governance, and operational verification continue in parallel and remain independent release gates.

Repository progress and production freshness are tracked separately. The current canonical `main` head passed its required exact-head GitHub pull-request quality gate before merge. Vercel Free-plan build-rate limits can temporarily prevent a corresponding production build; such quota limits do not block continued repository development, but no quota-blocked change is described as live until a production deployment and post-deploy verification actually exist.

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

### Milestone 14 — Search and Discovery

- privacy-safe learner search scoped to the signed-in learner's eligible published learning content
- governed public programme discovery with school/language filtering and fail-closed Sanity validation
- protected administration search across approved operational fields only
- literal PostgreSQL wildcard handling and indexed contains-search support
- aggregate search-outcome telemetry that does not store raw queries, identities, sessions, or IP addresses

### Milestone 15 — Arabic, French, and English Localization

- shared typed locale contract for `ar`, `fr`, and `en`
- locale-aware routing, persistence, metadata, canonical and `hreflang` behavior
- localized public website, learner portal, and administration interfaces
- Arabic RTL document behavior and mixed-script bidi safeguards
- localized search/discovery state and protected-route behavior without weakening authorization or privacy boundaries

## Active milestone

### Milestone 16 — Organizations and Team Learning

Status: Active

Governing issue: #214

Current implementation slice: PR #215 — organization/team domain governance before persistence.

The milestone is explicitly bounded to five staged slices:

1. organization lifecycle, membership roles, team contracts, tenant-scope checks, seat mutation scope, privacy-safe manager visibility, and aggregate progress contracts
2. first-class organization/team persistence and a production-safe migration/backfill path while preserving normal learner enrolments
3. protected academy administration for organizations, teams, memberships, course assignment, and audited seat operations
4. a restricted organization-manager experience that is separate from global academy administration and exposes only approved organization-scoped aggregates
5. safe integration with corporate billing, notifications, certificates, and Arabic/French/English localization

Milestone 16 must preserve these boundaries:

- server-side verification of every organization-scoped read and write
- organization membership is separate from global RBAC
- organization identifiers from requests are untrusted and cross-organization access fails closed
- managers do not receive assessment answers, psychology content, enquiry messages, personal finance data, private certificate metadata, or unrelated learner records
- existing enrolment, finance, certificate, notification, and search systems are reused rather than replaced
- SSO/SAML/SCIM, HRIS integrations, AI manager insights, and public organization profiles are outside this milestone

The milestone is not production-live merely because repository slices merge; deployment and post-deploy verification remain separate evidence requirements.

## Post-milestone public hardening

After Milestone 15, the public experience received a substantial premium visual, accessibility, privacy, and operational hardening programme:

- token-governed premium homepage, school, About, and Contact storytelling
- reusable reduced-motion-aware public motion controller
- premium sticky header/footer and responsive RTL-safe layouts
- governed editorial media fallbacks and explicit Sanity programme-image publication approval with safe default `false`
- premium localized 404 recovery experience
- localized keyboard skip-to-content navigation and stable `main#main-content` targets across public routes
- mobile primary navigation that remains available within a contained horizontal row rather than disappearing on narrow screens
- reduced-motion-safe scrolling, sticky-header anchor offsets, and explicit token-governed keyboard focus rings on the public shell
- Organization structured data, localized metadata improvements, sitemap/robots hardening, and public regression coverage
- Vercel monorepo affected-package checks plus opt-in non-production preview policy to reduce free-plan deployment pressure
- production dependency-audit repair and continued exact-head audit coverage (#201)
- explicit `noindex, nofollow` indexing boundary for the learner portal (#202)
- accessible enquiry pending/submission status behavior (#203)
- bounded shared caching for generated social previews (#204)
- production sign-in health-probe maintenance and protection-aware monitoring (#206 and #192)
- stricter public-enquiry transport boundaries, including JSON-only submissions, cross-site browser rejection, and `no-store` responses (#208)
- approved founder portrait publication on the localized About experience (#209)
- approved founder portrait publication on the Psychology school hero while preserving governed abstract visuals for Languages and Professional Training (#210)
- standards-compatible `Retry-After` timing on rate-limited public enquiry responses without weakening the existing trusted-edge and privacy boundaries (#212)

Approved real photography is not fabricated or substituted. The approved founder media is now governed in repository code, while additional branch/programme photography remains dependent on explicit rights and publication approval.

## Parallel operational phase

Post-launch stabilization continues alongside Milestone 16. Current operational and governance work remains:

1. Publish and verify one approved active Sanity programme image with meaningful alternative text, crop, hotspot, and publication approval (#45 and #93).
2. Configure a restricted administration smoke account when production Clerk access permits it, then enable authenticated browser-smoke storage states and protected journeys (#40).
3. Launch the migrated Sanity Studio v6 against the intended project/dataset and record non-sensitive operational verification without changing production content (#85).
4. Verify a Luminol sender domain before enabling real learner email, then complete a monitored outbound delivery and retry/dead-letter check (#40).
5. Designate a backup operator before wider promotion or any planned primary-operator absence (#40).
6. Confirm the repaired scheduled production-health workflow with a fully green post-fix scheduled or manual run before closing #192.
7. Configure repository/ruleset protection for `main`, requiring the existing quality gate without deadlocking the single-operator workflow (#186).
8. Publish reviewed privacy, terms, and cookie notices only after approved legal copy and verified operator details are supplied (#150).
9. Keep TypeScript 7 deferred until typescript-eslint and the wider toolchain officially support the chosen migration architecture (#115).

## Current blockers and deferred external inputs

- **Approved programme media:** rendering and approval infrastructure is complete, but final Sanity production verification still requires an approved active image-bearing programme; tracked in #45 and #93.
- **Restricted administration smoke access:** production Clerk administration access remains deferred until the required account/service access is available; tracked in #40.
- **Sanity Studio environment verification:** the v6 code migration is complete, but the Studio still needs to be observed against the intended Sanity project/dataset; tracked in #85.
- **Outbound email:** a verified sender domain and controlled monitored delivery are still required before learner email activation; tracked in #40.
- **Backup operations:** `Ninou09` remains the named primary operator and a backup operator is still required before broader promotion; tracked in #40.
- **Reviewed legal copy:** privacy, terms, and cookie publication must not invent legal entity details, retention periods, lawful bases, transfer claims, or contractual rights; tracked in #150.
- **Repository settings:** `main` branch protection/ruleset enforcement remains a GitHub repository-settings task rather than an application-code change; tracked in #186.
- **Production deployment freshness:** Vercel build-rate limits may temporarily leave production behind the repository head. This is a deployment-capacity constraint, not a reason to stop repository work; production claims remain evidence-based.

## Quality gates

Every production change must preserve the architecture and pass the repository's exact-head quality gate:

- frozen dependency installation
- secret and dependency security checks
- production dependency audit
- Prisma generation and migration validation
- linting and repository formatting
- strict type checking across workspaces
- unit and integration tests
- production builds
- public Playwright smoke tests
- authenticated smoke tests when protected test credentials are available
- independent review when review capacity is available, with no unresolved actionable review threads before merge

GitHub exact-head CI is the required repository merge gate. Vercel previews are supplementary and may be unavailable during free-plan quota pressure. Production deployment and post-deploy verification remain separate requirements before a merged change is considered live.

## Planned maintenance, not active milestones

- TypeScript 7 toolchain migration remains intentionally deferred under #115 until the repository can use an officially supported compiler/tooling combination.
- Sanity Studio v6 code migration is complete through PR #112; #85 now tracks only operational environment verification of the migrated Studio.

Major compiler/CMS changes must preserve strict type checking, schema governance, production builds, and the complete CI/browser gate. They must not be used to bypass current operational blockers or mixed into unrelated feature work.
