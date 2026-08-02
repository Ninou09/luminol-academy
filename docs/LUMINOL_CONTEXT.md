# Luminol Academy Project Context

## Mission

Luminol Academy is a premium digital ecosystem combining three educational and professional branches:

1. School of Psychology
   - Mental wellness
   - Coaching
   - Psychological services

2. School of Languages
   - Language learning
   - Fluency programs
   - Placement testing

3. School of Professional Development
   - Career training
   - Corporate training
   - Skills development

# Brand Identity

Name:

Luminol Academy

Positioning:

Modern, intellectual, empowering, accessible.

Design direction:

- Premium
- Minimal
- Editorial
- Professional
- Human-centered

Brand colors:

Primary Navy:
#102A43

Gold:
#C79A3B

Canvas:
#FAFAF8

# Technology Architecture

## Applications

apps/

web

- Public-facing website

admin

- Internal administration platform

portal

- Student/client portal

studio

- Sanity CMS

## Shared Packages

packages/

ui

- Design system and reusable components

database

- Prisma database layer

auth

- Authentication and authorization

validation

- Zod validation schemas

config

- Shared configuration

types

- Shared TypeScript types

utils

- Utility functions

emails

- Email provider boundary and reusable email templates

analytics

- Tracking and analytics

finance

- Finance domain contracts, persistence services, authorization, payments, refunds, receipts, subscriptions, reconciliation, corporate billing, and audit events

certificates

- Certificate issuance, verification, revocation, rendering data, and audit contracts

## Services

services/

api

- Backend API

ai

- AI features

search

- Search infrastructure

notifications

- Notification orchestration, preferences, delivery records, retries, provider adapters, and a separately deployed worker with PostgreSQL-backed leases

worker

- Background jobs

# Technology Stack

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend:

- PostgreSQL
- Prisma

Authentication:

- Clerk

CMS:

- Sanity

Deployment:

- Vercel
- GitHub Actions
- Docker

Testing:

- Vitest
- Playwright

# Security Principles

Security is a core requirement.

Always implement:

- Authentication
- Authorization
- RBAC
- Audit logging
- Input validation
- Secure file handling
- Rate limiting
- Encryption where required
- Secure secrets management

Psychology data requires the highest confidentiality.

Never expose:

- Therapy notes
- Assessments
- Private client records

without explicit authorization.

Financial data must use server-side authorization, idempotent mutations, integer minor-unit money values, validated currencies, transactional writes, and auditable state transitions.

Never store card numbers, CVV values, raw payment credentials, or payment-provider secrets in application records.

Notifications must avoid exposing sensitive psychology, financial, or identity data in subject lines, lock-screen previews, delivery logs, and provider metadata.

Certificate verification must expose only the minimum public information required to validate authenticity. Issued certificate snapshots and audit history must remain immutable, while revocation must be explicit and traceable.

Public certificate verification uses an atomic PostgreSQL rate-limit bucket. Certificate replacement is a serializable transaction that supersedes the prior credential, preserves its immutable snapshot on the replacement, links both records, and audits both sides.

## Deployment operations

Application builds and scheduled workers never execute migrations. Apply migrations as an explicit release step with `pnpm --filter @luminol/database migrate:deploy`.

The zero-cost starter deployment is `.github/workflows/notification-worker.yml`: GitHub Actions invokes `pnpm --filter @luminol/worker run:once` every 15 minutes (or manually), claims one bounded batch, processes every claimed ID with the normal retry/dead-letter logic, disconnects, and exits. The workflow skips safely while provider credentials are not configured.

Outbound email delivery is intentionally deferred until an email provider account is approved. In-app notifications remain available. Do not merge an email-provider adapter or configure provider secrets until the provider is approved and the adapter has passed review, CI, production configuration validation, and a controlled test delivery.

# Development Rules

Every milestone must:

1. Preserve existing architecture.
2. Add production-quality code.
3. Include tests.
4. Pass linting.
5. Pass type checking.
6. Pass builds.
7. Include documentation updates.

Never:

- Commit secrets.
- Disable security controls.
- Ignore failing tests.
- Create temporary hacks.
- Break existing functionality.

# Current Status

Completed:

- Milestone 1 — Production Monorepo Foundation
- Milestone 2 — Database and Authentication
- Milestone 3 — Design System and UI Foundation
- Milestone 4 — Public Website
- Milestone 5 — CMS Implementation
- Milestone 6 — Admin Dashboard
- Milestone 7 — Student Portal
- Milestone 8 — Psychology Platform
- Milestone 9 — Language Platform
- Milestone 10 — Professional Development Platform
- Milestone 11 — Finance and Payments
- Milestone 12 — Notifications and Certificates

Milestone 12 delivered:

- notification templates and typed payload contracts
- in-app and email notification channels
- user notification preferences, consent, and quiet-time rules
- database-backed outbox, delivery attempts, idempotency, retries, and dead-letter handling
- provider-independent email and notification adapters
- secure learner notification inbox and admin delivery visibility
- certificate eligibility and issuance workflows
- immutable certificate issuance snapshots
- unique certificate serials and verification codes
- public certificate verification with minimal data exposure
- certificate revocation, replacement, and audit history
- printable or downloadable certificate rendering data
- server-side RBAC, organization isolation, validation, and tests
- production database migrations applied successfully

Deferred operational item:

- outbound email provider activation and controlled delivery test; scheduled worker remains skip-safe without provider secrets

Current:

## Milestone 13 — Security Audit and Production Launch

Required scope:

- comprehensive authorization, RBAC, and organization-isolation audit across web, portal, admin, API, finance, psychology, notifications, and certificates
- production security headers and Content Security Policy compatible with Clerk, Sanity, Vercel, and required application assets
- CSRF, open-redirect, SSRF, unsafe file handling, injection, mass-assignment, insecure direct object reference, and sensitive-data exposure review
- rate-limit review for public and high-risk endpoints
- privacy-safe logging, error handling, audit-event coverage, and secret scanning
- dependency, lockfile, GitHub Actions, and supply-chain review
- production environment validation without exposing secret values
- PostgreSQL migration status, backup/restore readiness, and operational runbooks
- authenticated Playwright smoke tests for critical admin and learner journeys where credentials can be safely provided through CI secrets
- unauthenticated production smoke tests for public pages and certificate verification
- accessibility, SEO, robots, sitemap, error-page, and mobile launch checks
- monitoring, rollback, incident-response, and launch checklist documentation
- final CI, Vercel preview, controlled production deployment, and post-deployment verification

Outbound email provider setup is not a blocker for Milestone 13. The launch checklist must clearly mark external email delivery as deferred and verify that the worker skips safely while provider secrets are absent.
