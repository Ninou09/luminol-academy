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

- Notification orchestration, preferences, delivery records, retries, and provider adapters

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

Milestone 11 delivered:

- finance-domain contracts and validation
- invoices and line items
- payment intents and transactions
- refunds with balance and currency protections
- pricing plans, coupons, and redemptions
- subscriptions and receipts
- reconciliation and corporate billing
- finance audit events
- additive Prisma models and migration
- server-side transactional finance services
- finance RBAC permissions and authorization tests
- authenticated learner billing views
- protected admin finance dashboard
- provider adapter boundaries

Current:

## Milestone 12 — Notifications and Certificates

Delivered scope:

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

Milestone 12 uses additive persistence for preferences, transactional outbox events, channel deliveries, attempts and audit history. Email delivery is provider-independent and retries are bounded before dead-lettering. Certificates are issued only from completed enrolments, retain immutable snapshots and public verification exposes only credential identity fields. Application builds generate Prisma Client; workers and deployments run migrations separately.

Deployment behavior:

- application builds generate Prisma Client
- database migrations do not run automatically during preview application builds
- production migrations must be run explicitly with `pnpm --filter @luminol/database migrate:deploy`
- notification provider credentials must come only from environment variables

# Future Roadmap

Milestone 13:
Security audit and production launch
