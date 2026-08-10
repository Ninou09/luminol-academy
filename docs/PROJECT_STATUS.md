# Luminol Academy Project Status

_Last updated: 2026-08-11_

## Current state

Luminol Academy is a production-oriented multilingual platform with a public website, learner portal, administration application, Sanity Studio, PostgreSQL persistence, Clerk authentication, database-backed RBAC, language learning, professional development, finance foundations, notifications, certificates, deterministic search and discovery, and governed Arabic/French/English localization.

The canonical branch is:

`main`

Stable production applications:

- Public website: `https://luminol-academy-web.vercel.app`
- Learner portal: `https://luminol-academy-portal.vercel.app`
- Administration: `https://luminol-academy-admin.vercel.app`

Milestones 1 through 15 are complete in the repository. The platform is in post-launch stabilization and public-experience hardening rather than an active numbered product milestone.

Production freshness recovered after the temporary Vercel Free-plan deployment-capacity incident tracked in #128. Current `main` (`6c15cc5de002dc79290ad402d98ba74691b35c50`) is deployed to the public production project. The stable public alias has been re-verified for its absolute sitemap declaration, Organization structured data, hardened response headers, and representative localized content. Grouped runtime-error checks for web, administration, and portal showed no errors in the post-recovery verification window.

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

## Post-milestone public hardening

After Milestone 15, the public experience received a large premium visual and accessibility upgrade without introducing unapproved real media:

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

Approved real photography is intentionally not fabricated or substituted. Real-media rollout remains dependent on approved governed assets.

## Current operational phase

The platform is in post-launch stabilization. Current work is intentionally operational and governance-focused:

1. Publish and verify one approved active Sanity programme image with meaningful alternative text, crop, hotspot, and publication approval (#45 and #93).
2. Configure a restricted administration smoke account when production Clerk access permits it, then enable authenticated browser-smoke storage states and protected journeys (#40).
3. Launch the migrated Sanity Studio v6 against the intended project/dataset and record non-sensitive operational verification without changing production content (#85).
4. Verify a Luminol sender domain before enabling real learner email, then complete a monitored outbound delivery and retry/dead-letter check (#40).
5. Designate a backup operator before wider promotion or any planned primary-operator absence (#40).
6. Keep TypeScript 7 deferred until typescript-eslint and the wider toolchain officially support the chosen migration architecture (#115).

## Current external blockers

- **Approved real media:** the rendering and approval infrastructure is complete, but no approved active image-bearing programme is available for final production verification; tracked in #45 and #93.
- **Restricted administration smoke access:** production Clerk administration access remains deferred until the required account/service access is available; tracked in #40.
- **Sanity Studio environment verification:** the v6 code migration is complete, but the Studio still needs to be observed against the intended Sanity project/dataset; tracked in #85.
- **Outbound email:** a verified sender domain and controlled monitored delivery are still required before learner email activation; tracked in #40.
- **Backup operations:** `Ninou09` remains the named primary operator and a backup operator is still required before broader promotion; tracked in #40.

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

Vercel previews are opt-in for non-production branches and supplementary to the GitHub CI merge gate. Production deployment and post-deploy verification remain required before a change is considered live.

## Planned maintenance, not active milestones

- TypeScript 7 toolchain migration remains intentionally deferred under #115 until the repository can use an officially supported compiler/tooling combination.
- Sanity Studio v6 code migration is complete through PR #112; #85 now tracks only operational environment verification of the migrated Studio.

Major compiler/CMS changes must preserve strict type checking, schema governance, production builds, and the complete CI/browser gate. They must not be used to bypass current operational blockers or mixed into unrelated feature work.
