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

## Milestone 1 — Production Monorepo Foundation

Includes:

- pnpm workspace
- Turborepo
- Next.js applications
- Shared packages
- Prisma foundation
- PostgreSQL Docker setup
- CI/CD
- Testing infrastructure
- Documentation


Current:

## Milestone 2 — Database and Authentication

Goals:

- Complete Prisma domain model
- User system
- Roles and permissions
- Clerk authentication
- RBAC
- Protected routes
- Seed data
- Authentication testing


# Future Roadmap

Milestone 3:
Design system and UI foundation

Milestone 4:
Public website

Milestone 5:
CMS implementation

Milestone 6:
Admin dashboard

Milestone 7:
Student portal

Milestone 8:
Psychology platform

Milestone 9:
Language platform

Milestone 10:
Professional development platform

Milestone 11:
Finance and payments

Milestone 12:
Notifications and certificates

Milestone 13:
Security audit and production launch
