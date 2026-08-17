# Learning analytics and outcomes

Milestone 17 adds first-party learning and outcome views derived from existing Luminol records. These views are deliberately bounded: they explain progress and programme activity without becoming a learner-scoring, surveillance, psychology, finance, identity, or cross-tenant analytics system.

Milestone 18 now supplies the persisted instructor-to-cohort ownership graph required to enable the previously deferred instructor/cohort analytics audience without inferring authority from activity, identity, names, domains, reviews, or browser input.

## Data model

Analytics are read models over existing source-of-truth records. The analytics layer does not add a second learning-record store, raw analytics event stream, external analytics/CDP vendor, or predictive model.

The analytics contract defines four audiences:

- learner self
- instructor cohort
- academy administrator
- organization manager

Every implemented audience has an enforceable server-side authorization path. Instructor/cohort access is backed by the exact active persisted `CohortInstructorAssignment`; a browser-supplied cohort identifier is only a selector and cannot grant access.

## Learner outcomes

The learner `/progress` view is self-only and is built from the synchronized signed-in user's existing records. It can display:

- active programme count
- completed programme count
- completed lesson count
- in-progress lesson count
- active certificate count
- latest learning activity date

The view is not a score, ranking, diagnosis, prediction, employability measure, intelligence measure, personality measure, or wellbeing inference.

## Instructor cohort analytics

The protected portal `/instructor/cohorts/[cohort]/analytics` view resolves the synchronized signed-in user, then verifies an active persisted assignment to that exact non-cancelled cohort before any cross-learner analytics records are read. Instructor authority remains separate from academy-wide RBAC and organization-manager membership.

For cohorts meeting the privacy threshold, the view can display only explainable aggregates derived from existing first-party records:

- eligible active cohort participant count
- completed cohort enrolments and completion percentage
- unique cohort learners with learning activity during the fixed recent-activity window
- active certificates for the cohort programme and certificate percentage
- existing placement attempts already marked `REVIEW_REQUIRED`

The recent-activity window remains the same fixed **30 days** used by academy learning analytics. Review workload counts only an existing governed status; assessment answers and scores are never selected. No learner identity is returned by the analytics read model.

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

Any instructor cohort, academy, organization, course, or team aggregate below its applicable threshold fails closed. Suppressed instructor and organization analytics do not return the exact small-group size to the presentation layer. The interface shows only that the aggregate is protected until the minimum group is reached.

A denominator of zero produces zero for bounded percentage helpers rather than an undefined or infinite value.

## Forbidden data

Learning analytics must not expose or persist the following data classes as analytics payloads:

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

The analytics layer also prohibits learner ranking, instructor ranking, hidden behavioral scoring, predictive dropout/risk scoring, diagnosis or wellbeing inference, intelligence/personality inference, employability scoring, AI-generated performance judgments, and cross-organization benchmarking that could expose tenant data.

## Localization

Learner, instructor, academy, and organization analytics explanations are localized in Arabic, French, and English. Arabic uses the existing RTL-safe application layouts. Dynamic source-of-truth names such as organization, team, programme, course, cohort, learner, and instructor names are displayed as stored and are not automatically translated.

## Authorization boundaries

- learner outcomes: authenticated synchronized user, self only
- instructor cohort analytics: authenticated synchronized user with an active persisted assignment to the exact non-cancelled cohort; no assignment means no analytics read
- academy analytics: synchronized user with `academy:manage`
- organization analytics: active OWNER/MANAGER membership for the exact organization plus the existing corporate-manager policy

All authorization is performed server-side. Browser-supplied identifiers are selectors, not authorities. Instructor assignment, academy RBAC, and organization membership remain distinct scopes.

## Metric and privacy verification

Instructor cohort analytics reuse the Milestone 17 analytics contract and minimum group threshold rather than defining a weaker parallel policy. Small cohorts are suppressed before aggregate values reach the UI, and the suppressed result deliberately omits the exact small-group count.

The instructor reader selects only the minimum identifiers necessary to scope source records internally, then returns aggregate values. It does not select or return names, email addresses, assessment answers/scores, psychology data, enquiries, finance/payment data, certificate metadata, learner-authored text, raw search queries, session identifiers, or IP addresses.

## Verification

Every analytics slice must pass the repository's exact-head `quality` gate, including frozen dependency installation, secret scanning, production dependency audit, Prisma validation and migration-chain checks, lint, Prettier, strict type checking, unit/integration tests, production builds, and public smoke tests. Authenticated preview smoke runs only when protected test credentials are configured.

Production visual verification is separate from repository correctness. When the Vercel free-plan deployment allowance is exhausted, repository correctness remains governed by exact-head quality while production/browser verification waits for deployment capacity to return rather than bypassing safeguards or paying for unnecessary builds.
