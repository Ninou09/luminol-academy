# Luminol Academy

**English** · [العربية](README.ar.md)

Luminol Academy is a trilingual (Arabic, French, English) learning institution based in Blida, Algeria, with three schools: the **School of Psychology**, the **School of Languages** and the **School of Professional Development**. This repository is the production monorepo behind its public website, learner portal, administration and CRM workspace, and editorial CMS.

| Application   | Purpose                                                    | Production                                | Local                 |
| ------------- | ---------------------------------------------------------- | ----------------------------------------- | --------------------- |
| `apps/web`    | Public website: schools, programmes, consultations         | https://luminol-academy-web.vercel.app    | http://localhost:3000 |
| `apps/admin`  | Administration, CRM, operations and finance                | https://luminol-academy-admin.vercel.app  | http://localhost:3001 |
| `apps/portal` | Learner and client portal: courses, progress, certificates | https://luminol-academy-portal.vercel.app | http://localhost:3002 |
| `apps/studio` | Sanity Studio for editorial content                        | Hosted by Sanity                          | http://localhost:3333 |

## Documentation

Start with the [documentation index](docs/README.md). The most useful entry points are:

- [Architecture](docs/ARCHITECTURE.md): applications, shared packages, data flow and request lifecycle
- [Configuration and deployment](docs/CONFIGURATION.md): every environment variable, Vercel projects and release flow
- [Public website](docs/PUBLIC_WEBSITE.md): features, localization, media rules and the AI assistant
- [Public site review](docs/PUBLIC_SITE_REVIEW.md): annotated screenshots of the consultation and programme journeys
- [Project status](docs/PROJECT_STATUS.md) and [master roadmap](docs/MASTER_ROADMAP.md)

Arabic translations of the core guides live in [`docs/ar`](docs/ar/README.md).

## Technology

| Layer         | Choice                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------ |
| Framework     | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)                          |
| Styling       | Tailwind CSS 4, CSS Modules, shared design tokens                                          |
| Data          | PostgreSQL 16, Prisma ORM 7                                                                |
| Identity      | Clerk, with database-backed role-based access control                                      |
| Content       | Sanity 6 with typed, reviewed fallbacks                                                    |
| Messaging     | Resend (email), Telegram (staff alerts), scheduled notification worker                     |
| AI            | Anthropic Claude for the public assistant; opt-in OpenAI gateway for the admin AI operator |
| Motion and 3D | three.js, GSAP and Lenis, disabled under reduced motion                                    |
| Tooling       | pnpm 10 workspaces, Turborepo, Vitest, Playwright, ESLint, Prettier                        |
| Hosting       | Vercel (one project per application), GitHub Actions for CI                                |

## Getting started

### Prerequisites

- Node.js 20.19+, 22.13+ or 24+
- pnpm 10.34.5 or newer within major version 10 (enable it with `corepack enable`)
- Docker Desktop, for the local PostgreSQL service
- Accounts for Clerk, Sanity, Resend, Vercel and Anthropic when you connect hosted services

### Local setup

```bash
corepack enable
pnpm install
cp .env.example .env                 # replace only the placeholders you need
docker compose up -d postgres        # PostgreSQL 16 with a health check
pnpm db:generate                     # generate the Prisma client
pnpm db:migrate --name init          # apply migrations to the local database
pnpm dev                             # start every application
```

The committed `.env.example` holds safe placeholders only. Never commit a real `.env` file. Every variable is described in [Configuration and deployment](docs/CONFIGURATION.md).

### GitHub Codespaces

1. Open the repository on GitHub and choose **Code → Codespaces → Create codespace** on the branch you want to review.
2. Run the local setup commands above in the Codespaces terminal.
3. Open the **Ports** panel. Ports 3000, 3001, 3002 and 3333 map to the four applications. Keep port visibility private unless you intend to share a preview.

## Commands

| Command               | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `pnpm dev`            | Run all applications in development mode                            |
| `pnpm build`          | Production build of every workspace                                 |
| `pnpm lint`           | ESLint across all workspaces                                        |
| `pnpm typecheck`      | Strict TypeScript checks                                            |
| `pnpm test`           | Vitest unit and integration tests                                   |
| `pnpm test:e2e`       | Playwright browser tests (run `pnpm exec playwright install` first) |
| `pnpm format`         | Format the repository with Prettier                                 |
| `pnpm format:check`   | Verify formatting, as CI does                                       |
| `pnpm db:generate`    | Generate the Prisma client                                          |
| `pnpm db:migrate`     | Create and apply a local migration                                  |
| `pnpm db:studio`      | Inspect local data in Prisma Studio                                 |
| `pnpm security:check` | Secret scan and GitHub Action pin check                             |

## Quality gates

Every pull request runs the `quality` workflow, which is required before merging into `main`:

1. Frozen dependency install, secret scan and Action pin check
2. Prisma generation, schema validation and migration replay on an ephemeral PostgreSQL
3. Lint, Prettier formatting check, strict typecheck and unit tests
4. Production builds of every application
5. Public Playwright smoke tests, plus authenticated journeys when their protected state is configured
6. Production dependency audit (`pnpm audit --prod --audit-level high`)

`main` is protected: changes land through pull requests only, and force pushes and deletion are blocked.

## Engineering conventions

The full rule set is in [AGENTS.md](AGENTS.md). In short:

- Use pnpm only and run workspace commands from the repository root.
- Keep TypeScript strict, avoid `any` and validate every external input with Zod.
- Keep applications independently deployable. Shared code belongs in `packages/*`; an application never imports another application.
- Every user-facing change must work in Arabic (right-to-left), French and English, with semantic, accessible HTML.
- Use design tokens instead of hard-coded brand colours.
- Public media keeps its source, alternative text and crop intent. Unreviewed or fabricated imagery is not published.
- Never commit secrets, client data or generated build output.

## Security

Report suspected vulnerabilities privately to the academy at luminolacademy09@gmail.com rather than opening a public issue. Security controls and the launch audit are described in [Security and launch readiness](docs/SECURITY_AND_LAUNCH_READINESS.md).

## Licence

This is a private repository. No open-source licence is granted; all rights belong to Luminol Academy.
