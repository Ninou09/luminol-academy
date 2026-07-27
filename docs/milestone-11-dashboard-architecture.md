# Milestone 11 — Unified Dashboard Architecture

## Goal
Create the unified Luminol experience layer connecting learners, instructors, and administrators.

## Portal Routes

- `/dashboard` — learner overview
- `/dashboard/courses` — enrolled courses and continuation flow
- `/dashboard/progress` — learning progress
- `/dashboard/certificates` — earned certificates
- `/dashboard/resources` — saved resources
- `/dashboard/settings` — profile and preferences

## Instructor Workspace

- Course management
- Content workflow
- Student activity overview
- Performance analytics

## Administration

- User management
- Role and permission controls
- Course reporting
- Platform health overview

## Implementation Principles

- Authorization remains server-side.
- Existing Clerk authentication and RBAC are preserved.
- Prisma models remain the source of truth.
- Arabic experiences must preserve RTL support.
- Components should be reusable through `@luminol/ui`.

## Build Order

1. Shared dashboard shell and navigation.
2. Learner dashboard data services.
3. Progress and certificate widgets.
4. Instructor workspace.
5. Admin experience enhancements.
6. Automated tests and accessibility review.
