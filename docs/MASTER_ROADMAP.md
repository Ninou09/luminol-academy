# Luminol Academy Master Roadmap

This document is the canonical delivery sequence for Luminol Academy. `PROJECT_STATUS.md` records the live state; this file defines the intended product path.

## Product principles

- One connected academy with Psychology, Languages, and Professional Development schools.
- Authentication, authorization, validation, privacy, and auditability are required platform behavior.
- Shared capabilities must be implemented once and reused across schools.
- Sensitive psychology information must never be exposed through general learning or administration views.
- Every milestone includes tests, documentation, accessibility, and production build validation.

## Delivered platform foundation

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

## Active delivery

### Milestone 9 — Language Platform

Status: In progress

#### 9A — Language domain foundation

- CEFR level support from A1 through C2
- target language and instruction-language metadata
- reading, listening, speaking, writing, grammar, and vocabulary taxonomy
- language-specific course configuration
- placement-assessment persistence
- additive database migration and tests

#### 9B — Placement experience

- protected placement entry point
- bounded and validated assessment attempts
- objective-question scoring
- instructor-review path for productive skills
- recommended CEFR level and learning path
- attempt history and result visibility

#### 9C — Language learner dashboard

- active language programmes
- CEFR and skill progress
- continue learning
- weekly learning activity
- intentional empty states

#### 9D — Vocabulary and practice

- personal vocabulary notebook
- lesson-linked vocabulary
- confidence and review state
- grammar and vocabulary practice exercises
- secure server-side ownership checks

#### 9E — Instructor and administration tools

- language programme configuration
- assessment authoring
- attempt review
- learner placement overrides with audit history
- language analytics

#### 9F — Completion and quality

- responsive and accessibility review
- unit and integration coverage
- documentation updates
- CI and production build validation

## Planned delivery

### Milestone 10 — Professional Development Platform

- competency-based programmes
- workshops and cohorts
- practical assignments
- instructor review
- professional-development analytics

### Milestone 11 — Finance and Payments

- product and price model
- checkout integration
- payment and refund lifecycle
- invoices and receipts
- finance administration
- webhook idempotency and reconciliation

### Milestone 12 — Notifications and Certificates

- transactional email pipeline
- enrolment and learning notifications
- scheduled reminders
- certificate delivery
- delivery preferences and audit history

### Milestone 13 — Production Hardening and Launch

- security audit
- privacy review
- accessibility audit
- performance optimization
- monitoring, alerting, and observability
- backup and recovery validation
- launch runbook and production deployment

## Future platform opportunities

These are not committed milestones and must not displace launch-critical work:

- multilingual content and interface localization
- search infrastructure
- background-job processing
- approved AI-assisted learning tools
- corporate accounts and team learning
- native mobile applications
