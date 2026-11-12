# Claude Code guide — Luminol Academy

Read `AGENTS.md` first; its rules apply to every change. This file adds product context and the working procedure used for Milestones 21–22.

## Product context

- Luminol Academy, Blida (Algeria): School of Psychology, School of Languages, School of Professional Development, plus free events/sessions.
- Business time zone `Africa/Algiers` (UTC+1, no DST); currency DZD (stored as minor units ×100).
- Public and staff UI: Arabic first (RTL), French and English supported. The wordmark stays English "Luminol Academy".
- Never invent prices, credentials, partnerships, results, legal text or accreditation. Attendance certificates are never presented as accreditation. Staff enter real amounts; nothing is seeded as business data.
- Nothing sends messages, publishes, schedules outreach or spends money automatically. Approvals record a decision only.
- Outbound contact only for people with recorded contact consent. Notes are operational, never clinical.

## Where things are

- Admin app: `apps/admin`. CRM frame `components/crm-shell.tsx`; permission-aware navigation `lib/staff-navigation.ts`.
- Operations (M21): `/today`, `/consultations`, `/clients`, `/office-payments`, `/tasks`, `/team` — data in `packages/database/src/{staff-roles,consultations,office-payments,operations-tasks}.ts`, rules in `packages/validation/src/*`.
- CRM (M22): `/crm` dashboard, `/crm/pipeline`, `/crm/leads/[id]`, `/crm/contacts/[id]`, `/crm/search` — data in `packages/database/src/crm.ts`.
- Roles: `admin` (owner), `consultant`, `enquiry-agent`, `staff` (trainer). Granted on `/team`; permissions seeded by migrations.
- Operator guide: `docs/MILESTONE_21_OPERATIONS.md`. Next plan: `docs/MILESTONE_23_CRM_SECTIONS_PLAN.md`.

## How to work

1. Open a governing issue per milestone; build in slices on branches `mNN/<slice>`, one PR each, stacked if needed.
2. Every new table: Prisma model + hand-written SQL migration in `packages/database/prisma/migrations/<timestamp>_<name>/migration.sql` following Prisma naming (`Table_col_idx`, `Table_col_fkey`), CHECK constraints for text limits, append-only triggers for audit/history tables, and permission/role seeds with `ON CONFLICT DO NOTHING`.
3. Pure rules go in `packages/validation` with unit tests; persistence in `packages/database/src/*.ts` with `*.integration.test.ts` (runs when `TEST_DATABASE_URL` is set).
4. Every admin surface: server-side permission check, Zod-validated input, AR/FR/EN copy with a localization test, `<bdi>` around user text, design tokens only.
5. Before pushing: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (CI also runs the production dependency audit and Playwright).
6. Going live is an owner decision: merge in order, then run the **Production migrations** workflow (`workflow_dispatch`, type `APPLY`), then verify the Vercel deployments of web, portal and admin.
