# Luminol Academy Project Status

_Last updated: 2026-08-19_

## Current state

Luminol Academy is a production-oriented multilingual platform with a public website, learner portal, administration application, Sanity Studio, PostgreSQL persistence, Clerk authentication, database-backed RBAC, language learning, professional development, finance foundations, notifications, certificates, deterministic search and discovery, governed Arabic/French/English localization, first-class organization/team learning, privacy-safe learning analytics, instructor/cohort delivery, cohort sessions and attendance, and a governed professional-project submission/review workflow.

The canonical branch is `main`.

Milestone 20 repository implementation reference:

`3b65c6160de6fd35cb350d39ac13c22b25deef55`

Stable production application aliases:

- Public website: `https://luminol-academy-web.vercel.app`
- Learner portal: `https://luminol-academy-portal.vercel.app`
- Administration: `https://luminol-academy-admin.vercel.app`

Milestones 1 through 18 are complete with recorded production evidence. Milestone 19 is repository-complete but remains open for its explicitly required exact-merged-head protected deployment evidence. Milestone 20 is repository-complete and its governing issue is closed; protected authenticated browser journeys remain a separate operational evidence requirement under #40 rather than a reason to weaken application authorization.

Milestone 20 implementation issue #270 is closed as completed after Slices A–F merged through PRs #271–#276. The final Slice F exact-head quality run passed frozen install, security/dependency checks, Prisma generation and migration-chain validation, lint, strict repository formatting, type checking, tests, fixture reconciliation, production builds, Playwright installation, and public smoke tests. The protected authenticated preview journey remained skipped because the required protected test state/configuration is not available, so this status does not claim that protected production browser verification is complete.

## Delivered milestones

### Milestones 1–16

The previously delivered foundation remains intact:

- production monorepo, shared packages, Prisma/PostgreSQL and CI
- Clerk synchronization, database-backed roles/permissions and protected server routes
- accessible design system and RTL/reduced-motion foundations
- governed public website and Sanity CMS
- learner portal, guided course workspace and account experience
- administration operations
- CEFR language platform and placement workflows
- professional-development domain/workflows
- finance and payment lifecycle foundations
- notifications and verifiable certificate lifecycle
- production hardening, launch, search/discovery and AR/FR/EN localization
- organizations, teams, seats, organization-manager scope and audited organization operations

Milestone 16 production database migration/backfill/integrity verification completed successfully on 2026-08-15. Issue #214 is closed as completed.

### Milestone 17 — Privacy-safe Learning Analytics and Outcomes

Status: Complete through PRs #247–#252; governing issue #246 is closed as completed after production deployment verification.

Delivered:

- typed analytics privacy/visibility contracts
- learner-self aggregate learning outcomes
- protected learner outcomes presentation
- academy programme aggregates behind `academy:manage`
- minimum group size of five with fail-closed suppression
- organization-manager aggregates scoped to existing organization membership
- Arabic/French/English presentation and analytics documentation

Production evidence now covers both protected application sides: the READY administration production build at `e548b8a4850a752a62a71ccef3fca74d5bc794a5` is a descendant of the final Milestone 17 merge and explicitly contains `/analytics`, while the READY portal production build at `3b65c6160de6fd35cb350d39ac13c22b25deef55` contains the learner/organization analytics surfaces. Signed-out verification fails closed and fresh runtime-error checks are clear. Full authenticated smoke-account journeys remain separately tracked under #40. No learner ranking, sensitive-trait inference, or parallel raw analytics event store was introduced.

### Milestone 18 — Instructor Cohorts, Ownership, and Delivery Operations

Status: Complete through PRs #254–#259; governing issue #253 is closed as completed after production deployment verification.

Delivered:

- explicit cohort/instructor authorization contracts
- persisted cohorts, instructor assignments and cohort memberships
- exact-assignment instructor workspace and minimal teaching view
- audited academy cohort delivery and assignment/reassignment operations
- privacy-suppressed instructor/cohort analytics

The READY portal production build at `3b65c6160de6fd35cb350d39ac13c22b25deef55` is a descendant of the final Milestone 18 merge and its production build output includes `/instructor`, `/instructor/cohorts/[cohort]`, and `/instructor/cohorts/[cohort]/analytics`. Signed-out verification fails closed and the production runtime-error check is clear. Instructor access is derived only from persisted server-verified assignment or an explicit academy authority; it is never inferred from request input or activity history.

### Milestone 19 — Cohort Sessions, Attendance, and Learner Schedule

Repository status: Complete through PRs #264–#269.

Delivered:

- first-party session lifecycle and attendance states
- session/attendance persistence with cohort and enrolment invariants
- academy create/reschedule/cancel operations with audit history
- exact-assignment instructor attendance workspace
- learner self-only session schedule and attendance state
- privacy-bounded attendance aggregates

Production-live follow-up remains tracked under #263 because that issue explicitly requires protected portal/admin deployment verification on the exact merged head. No external calendar/video integration was invented.

### Milestone 20 — Professional Project Submissions and Review Workflow

Repository status: Complete through PRs #271–#276. Governing issue #270 is closed as completed.

Delivered:

- persistent professional project and submission lifecycle
- learner draft/submit/status/revision/resubmission workspace
- persisted explicit reviewer assignment with exact reviewer scope
- human review decisions and append-only structured review history
- learner-visible structured feedback
- privacy-safe, idempotent in-app transition notifications using the existing notification infrastructure
- privacy-suppressed academy professional-project workflow aggregates

The implementation keeps learner-authored project content, reviewer feedback and professional scores out of aggregate analytics. It does not add AI grading, learner ranking, automatic reviewer assignment, or automatic certification decisions.

## Public experience and no-cost polish

The premium public-site hardening stream remains active through #235 where work is free and not blocked by external approvals/settings. Existing work includes premium localized layouts, governed programme/founder media, skip navigation and focus states, reduced-motion behavior, mobile navigation, metadata/canonical/`hreflang` improvements, robots/sitemap hardening, structured data, safer enquiry transport, public regression coverage, bounded social-preview caching and production dependency-audit safeguards.

The canonical roadmap/status documents are kept synchronized with completed milestone evidence so repository completion, production deployment evidence, and still-blocked authenticated/browser requirements are not conflated.

## Active external or operational dependencies

- **Public production discoverability — #241:** the public Vercel production project remains behind Vercel Authentication/SSO. This is a project-level deployment-protection setting, not a reason to weaken Clerk or application authorization.
- **Protected browser verification — #40:** a restricted administration smoke account and authenticated Playwright storage-state/base-URL configuration are still required before protected administration and learner journeys can be verified in CI/production.
- **Outbound learner email — #40:** a verified Luminol sender domain and a controlled monitored delivery/retry/dead-letter check are still required before real learner email is enabled.
- **Backup operations — #40:** a backup operator is still required before broader promotion or planned primary-operator absence.
- **Reviewed public legal notices — #150:** privacy, terms and cookie copy must come from reviewed approved legal/operator information rather than technical inference.
- **Sanity Studio environment observation — #85:** the v6 code migration is complete, but the migrated Studio still needs non-sensitive operational verification against the intended project/dataset.
- **TypeScript 7 — #115:** migration remains deliberately deferred until the repository's lint/tooling ecosystem officially supports the chosen architecture.

## Repository governance baseline

`Protect main` requires changes to reach `main` through a pull request and requires the GitHub Actions `quality` check before merge. Force pushes and deletion are blocked and review conversations must be resolved. Do not weaken or rename the quality gate, introduce broad bypass permissions, or fabricate an unavailable second reviewer merely to clear a merge.

The required repository quality path remains:

- frozen dependency installation
- secret/dependency security checks and production dependency audit
- Prisma generation plus migration-chain validation when applicable
- lint and repository formatting
- strict type checking across workspaces
- unit/integration tests
- production builds
- public Playwright smoke tests
- authenticated smoke tests when protected test credentials/configuration are available
- exact-head GitHub CI before merge

Vercel deployments and post-deploy production observations are supplementary evidence gates. A merged repository change is not automatically production-live.

## Next product milestone

No Milestone 21 is currently committed. The next numbered milestone should not be invented from momentum alone. Until a concrete product objective is selected, continue non-blocked stabilization and public-experience polish under existing issues while preserving current privacy, authorization, content-governance and operational boundaries.
