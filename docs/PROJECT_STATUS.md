# Luminol Academy Project Status

_Last updated: 2026-07-26_

## Current state

Luminol Academy has a production-oriented monorepo, Clerk-backed authentication and RBAC, a shared design system, a public website, Sanity CMS integration, administration workflows, a learner portal, certificate verification, and a guided lesson experience.

The current implementation branch is:

`codex/build-milestone-9-language-platform`

The active milestone is:

**Milestone 9 — Language Platform**

## Completed delivery history

### Milestone 1 — Production monorepo foundation

- pnpm workspace and Turborepo
- Next.js applications for web, admin, portal, and studio
- shared packages
- Prisma and PostgreSQL foundations
- Docker, CI, testing, linting, and type checking
- merged in PR #1

### Milestone 2 — Database, authentication, and authorization

- production Prisma domain models
- Clerk synchronization
- database-backed roles and permissions
- protected application routes
- signed webhook handling
- merged in PR #4

### Milestone 3 — Design system

- typed design tokens
- shared UI primitives
- accessible focus and reduced-motion foundations
- RTL-safe application styling
- merged in PR #5

### Milestone 4 — Public website and CMS

- premium homepage in PR #6
- dedicated school pages in PR #7
- About page and contact enquiry flow in PR #8
- governed Sanity CMS integration in PR #9

### Milestone 5 — Learner platform foundations

- database-backed learner dashboard in PR #10
- enrolment-protected course workspace in PR #11
- public certificate verification and privacy controls in PR #12

### Milestone 6 — Administration operations

- operations dashboard in PR #13
- controlled enquiry workflow in PR #14
- secure enrolment management in PR #15
- deployment and production build corrections in PRs #16–#25

### Milestone 7 — Learner account

- protected learner account overview
- synchronized identity and role visibility
- merged in PR #26

### Milestone 8 — Guided learning experience

- lesson viewer
- resume learning
- previous and next navigation across modules
- secure external resources
- server-validated completion flow
- merged in PR #27

## Current milestone — Language Platform

The language platform will extend the existing course, module, lesson, enrolment, and learning-record architecture rather than duplicate it.

Planned delivery slices:

1. Language domain foundation
   - CEFR levels A1–C2
   - target and instruction languages
   - language skill taxonomy
   - placement assessment model

2. Learner experience
   - language dashboard
   - skill-level progress
   - vocabulary notebook
   - continue-learning integration

3. Assessment experience
   - placement tests
   - reading, listening, speaking, and writing exercises
   - automatic and instructor-reviewed scoring

4. Administration and instruction
   - language-course configuration
   - exercise authoring
   - placement review
   - learner analytics

5. Completion
   - tests and documentation
   - accessibility and responsive review
   - CI validation

## Quality gates

Every milestone must preserve the existing architecture and pass:

- dependency installation
- Prisma generation
- linting
- strict type checking
- unit tests
- production builds

## Technical debt and follow-up

- keep the roadmap and this status file updated in every milestone PR
- add wider end-to-end coverage once deployment environments are stable
- add monitoring and observability before production launch
- complete a dedicated security and accessibility audit before launch
