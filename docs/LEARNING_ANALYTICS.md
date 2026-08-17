# Learning analytics and outcomes

Milestone 17 adds first-party learning and outcome views derived from existing Luminol records. These views are deliberately bounded: they explain progress and programme activity without becoming a learner-scoring, surveillance, psychology, finance, identity, or cross-tenant analytics system.

## Data model

Analytics are read models over existing source-of-truth records. Milestone 17 does not add a second learning-record store, raw analytics event stream, external analytics/CDP vendor, or predictive model.

The analytics contract defines four audiences:

- learner self
- instructor cohort
- academy administrator
- organization manager

Only audiences for which the repository has an enforceable server-side authorization path are implemented. The current schema does not contain a cohort ownership graph that can safely prove which instructor owns which learners, so instructor/cohort analytics remain intentionally unavailable instead of inferring access.

## Learner outcomes

The learner `/progress` view is self-only and is built from the synchronized signed-in user's existing records. It can display:

- active programme count
- completed programme count
- completed lesson count
- in-progress lesson count
- active certificate count
- latest learning activity date

The view is not a score, ranking, diagnosis, prediction, employability measure, intelligence measure, personality measure, or wellbeing inference.

## Academy programme analytics

The protected administration `/analytics` view requires the existing `academy:manage` server permission before aggregate data are read.

For published programmes that meet the privacy threshold, it can display:

- participant count
- active enrolment count
- completed enrolment count
- learning records active in the fixed recent-activity window
- active certificate count
- placement attempts requiring review

Draft programmes are excluded. The recent-activity window is fixed at 30 days.

## Organization manager analytics

The protected portal `/organization/analytics` view reuses the existing active OWNER/MANAGER organization membership and corporate-manager tenant checks. An optional organization identifier supplied by the browser never grants access; the server resolves it only within the signed-in user's authorized memberships.

Eligible organization aggregates include:

- seat utilization
- sponsored learning assignment totals
- sponsored learning completion totals and percentage
- per-sponsored-course assignment/completion aggregates
- per-team sponsored-learning aggregates

Organization analytics use active organization courses and active sponsorships, exclude soft-deleted users, and deduplicate enrolments before counting assignments.

## Small-group suppression

The default minimum aggregate group size is **5**.

Any academy, organization, course, or team aggregate below its applicable threshold fails closed. Suppressed organization analytics do not return the exact small-group size to the presentation layer. The interface shows only that the aggregate is protected until the minimum group is reached.

A denominator of zero produces zero for bounded percentage helpers rather than an undefined or infinite value.

## Forbidden data

Milestone 17 analytics must not expose or persist the following data classes as analytics payloads:

- assessment answers
- psychology content or notes
- enquiry messages
- payment details or private finance records
- private certificate metadata
- learner-authored text
- raw search queries
- session identifiers
- IP addresses
- identity records as analytics dimensions

The analytics layer also prohibits learner ranking, hidden behavioral scoring, predictive dropout/risk scoring, diagnosis or wellbeing inference, intelligence/personality inference, employability scoring, AI-generated performance judgments, and cross-organization benchmarking that could expose tenant data.

## Localization

Learner, academy, and organization analytics explanations are localized in Arabic, French, and English. Arabic uses the existing RTL-safe application layouts. Dynamic source-of-truth names such as organization, team, programme, and course names are displayed as stored and are not automatically translated.

## Authorization boundaries

- learner outcomes: authenticated synchronized user, self only
- academy analytics: synchronized user with `academy:manage`
- organization analytics: active OWNER/MANAGER membership for the exact organization plus the existing corporate-manager policy
- instructor/cohort analytics: not implemented until an explicit cohort ownership/authorization graph exists

All authorization is performed server-side. Browser-supplied identifiers are selectors, not authorities.

## Verification

Every Milestone 17 slice must pass the repository's exact-head `quality` gate, including frozen dependency installation, secret scanning, production dependency audit, Prisma validation and migration-chain checks, lint, Prettier, strict type checking, unit/integration tests, production builds, and public smoke tests. Authenticated preview smoke runs only when protected test credentials are configured.

Production visual verification is separate from repository correctness. When the Vercel free-plan deployment allowance is exhausted, the repository work remains unmerged until exact-head quality is green, while production/browser verification waits for deployment capacity to return rather than bypassing safeguards or paying for unnecessary builds.
