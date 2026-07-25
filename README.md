# Luminol Academy

Production monorepo foundation for Luminol Academy: a multilingual, premium learning institution spanning the School of Psychology, School of Languages, and School of Professional Development.

## Workspace map

| Workspace     | Purpose                      | Local URL             |
| ------------- | ---------------------------- | --------------------- |
| `apps/web`    | Public institutional website | http://localhost:3000 |
| `apps/admin`  | Administration dashboard     | http://localhost:3001 |
| `apps/portal` | Student and client portal    | http://localhost:3002 |
| `apps/studio` | Sanity Studio                | http://localhost:3333 |

Shared packages provide UI, database access, authentication, validation, configuration, domain types, utilities, email delivery, and analytics contracts. Turborepo coordinates all workspace tasks.

## Prerequisites

- Node.js 20 or newer
- pnpm 10 (Corepack recommended)
- Docker Desktop (for local PostgreSQL)
- Accounts for Clerk, Sanity, Resend, GitHub, and Vercel when connecting hosted services

## Browser-based setup (GitHub Codespaces)

1. In GitHub, open the repository, select **Code → Codespaces → Create codespace on main**.
2. In the Codespaces terminal run `corepack enable && pnpm install`.
3. Create local configuration with `cp .env.example .env` and replace only the service placeholders you intend to use.
4. Start PostgreSQL with `docker compose up -d postgres`.
5. Generate the Prisma client and initialize the database with `pnpm db:generate && pnpm db:migrate --name init`.
6. Start the workspaces with `pnpm dev`.
7. Open the forwarded **Ports** panel: ports 3000, 3001, 3002, and 3333 map to the four applications above. Set port visibility to private unless you intentionally need to share a preview.

For a local browser workflow, clone the repository, run the same commands in a terminal, then visit the URLs in the workspace map.

## Environment variables

Copy `.env.example` to `.env`. The committed file contains safe placeholders only.

| Variable                                                 | Required for               | Source                             |
| -------------------------------------------------------- | -------------------------- | ---------------------------------- |
| `DATABASE_URL`                                           | Prisma/PostgreSQL          | Local Docker value is ready to use |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Authentication             | Clerk dashboard                    |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `SANITY_API_TOKEN`     | CMS reads/writes           | Sanity project settings            |
| `NEXT_PUBLIC_SANITY_DATASET`                             | CMS dataset                | Usually `production`               |
| `RESEND_API_KEY`                                         | Transactional email        | Resend API keys                    |
| `NEXT_PUBLIC_APP_URL`                                    | Absolute application links | Deployment URL                     |

Sanity Studio uses the corresponding `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` variables. Published active programmes are validated and rendered on their matching public school pages. If CMS configuration or content is unavailable, reviewed typed fallback programmes keep the website operational.

## Content management

Run `pnpm --filter @luminol/studio dev` to open Sanity Studio locally. Studio manages programmes, site settings, team members, and consent-confirmed testimonials. See [docs/cms.md](docs/cms.md) for environment setup, publishing rules, content safety, CORS configuration, and fallback behavior.

## Commands

```bash
pnpm dev          # run all applications in development
pnpm build        # production-build every workspace
pnpm lint         # lint all workspaces
pnpm typecheck    # strict TypeScript checks
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright browser tests (install browser first)
pnpm format       # format tracked source files
pnpm db:generate  # generate Prisma client
pnpm db:migrate   # create/apply a local migration
pnpm db:studio    # inspect local data
```

## Architecture and deployment

Each app is independently deployable. In Vercel, create separate projects with the applicable app directory as **Root Directory**, while retaining pnpm workspace access. Configure secrets in each Vercel environment rather than committing `.env` files. The root Dockerfile verifies the whole monorepo; Docker Compose supplies a development-only PostgreSQL 16 service with a health check and persistent volume.

Arabic experiences must set `dir="rtl"` on the document boundary and use the Arabic tokenized font stack. Latin experiences use Manrope and Cormorant Garamond. Brand colors and font families live in `@luminol/config/tailwind` and application Tailwind themes.

## Quality gates

Pull requests run install, lint, strict typecheck, unit tests, and production builds in GitHub Actions. Keep changes within the relevant milestone, validate external input with Zod, preserve semantic accessibility and RTL behavior, and never commit credentials.
