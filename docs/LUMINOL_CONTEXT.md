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
- Email templates

analytics
- Tracking and analytics

finance
- Finance domain contracts, persistence services, authorization, payments, refunds, receipts, subscriptions, reconciliation, corporate billing, and audit events

## Services

services/

api
- Backend API

ai
- AI features

search
- Search infrastructure

notifications
- Email/SMS/push notifications

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

Current:

## Milestone 11 — Finance and Payments

Implemented scope includes:

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

Deployment behavior:

- application builds generate Prisma Client
- database migrations do not run automatically during preview application builds
- production migrations must be run explicitly with `pnpm --filter @luminol/database migrate:deploy`

# Future Roadmap

Milestone 12:
Notifications and certificates

Milestone 13:
Security audit and production launch
