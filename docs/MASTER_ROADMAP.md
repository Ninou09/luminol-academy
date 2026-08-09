# Luminol Academy Master Roadmap

This document is the canonical delivery sequence for Luminol Academy. `PROJECT_STATUS.md` records the live state; this file defines the intended product path.

## Product principles

- One connected academy with Psychology, Languages, and Professional Development schools.
- Authentication, authorization, validation, privacy, and auditability are required platform behavior.
- Shared capabilities must be implemented once and reused across schools.
- Sensitive psychology information must never be exposed through general learning or administration views.
- Every milestone includes tests, documentation, accessibility, and production build validation.

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

## Active product milestone

### Milestone 14 — Search and Discovery

Status: In progress

The first delivery slice adds privacy-safe learner search across only the authenticated learner's active or completed, published programme content. Search is server-scoped to enrolled courses, validates URL-owned input with Zod, normalizes and bounds queries, searches every eligible enrollment, gates results on real text matches before ranking, supports automatic RTL/LTR query direction, and returns direct programme or lesson destinations without exposing another learner's content.

Planned follow-up slices:

- governed public programme discovery using only published content
- school and language filters with shareable URL state
- protected administration search where operationally useful
- privacy-safe aggregate search telemetry without retaining raw sensitive queries

AI/vector search and external paid search providers remain explicitly out of scope until the deterministic search layer is proven.

## Active operational phase — Post-launch stabilization

This phase continues alongside product milestones. Its purpose is to prove and maintain the operational controls required for wider use.

### Availability and monitoring

- scheduled synthetic checks for the public website, learner portal, and administration application
- public metadata, sitemap, robots, security-header, and certificate-privacy checks
- clear failure evidence in GitHub Actions
- assigned monitoring and incident ownership before public promotion

### Authenticated production verification

- restricted admin and learner smoke accounts
- authenticated Playwright storage-state configuration
- protected administration and learner journey verification
- Clerk, Sanity, and OAuth CSP and browser checks

### Data recovery and operations

- Neon point-in-time recovery and restore drill
- documented row, constraint, and critical-journey validation
- rollback target and incident lead assignment
- production migration evidence retained without exposing secrets

### Outbound email activation

- verified Luminol sender domain
- controlled Resend API key and From address
- monitored delivery to an approved test recipient
- worker retry and dead-letter verification
- gradual enablement for real learners

## Future platform opportunities

These are not committed milestones and must not displace operational stabilization:

- multilingual content and full interface localization
- richer background-job processing
- approved AI-assisted learning tools
- corporate accounts and team learning
- native mobile applications
- dedicated external uptime and paging service
