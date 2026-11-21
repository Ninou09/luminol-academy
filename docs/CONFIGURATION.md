# Configuration and deployment

**English** · [العربية](ar/CONFIGURATION.md)

This is the reference for every environment variable the platform reads, where each one is set, and how changes reach production.

## Principles

- `.env.example` is the template for local development. It contains placeholders only and is safe to commit.
- Hosted values live in **Vercel → Project → Settings → Environment Variables** for the applications, and in **GitHub → Settings → Secrets and variables → Actions** for scheduled workers.
- Variables prefixed `NEXT_PUBLIC_` are embedded in the browser bundle at build time. Never give a secret this prefix.
- Changing a `NEXT_PUBLIC_` variable requires a new deployment; server-only variables apply to the next deployment as well.
- Set paired variables together. Telegram alerts stay off until both values exist, but Turnstile verification starts as soon as `TURNSTILE_SECRET_KEY` exists, so set the site key in the same change.

## Shared variables

| Variable                                             | Scope                      | Required                 | Purpose                                                                                    |
| ---------------------------------------------------- | -------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                                       | web, portal, admin, worker | Yes                      | PostgreSQL connection string used by Prisma                                                |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`                  | portal, admin, web         | Yes for portal and admin | Clerk publishable key (`pk_live_…` in production)                                          |
| `CLERK_SECRET_KEY`                                   | portal, admin, web         | Yes for portal and admin | Clerk secret key (`sk_live_…` in production)                                               |
| `CLERK_WEBHOOK_SECRET`                               | web, admin                 | For user sync            | Verifies Clerk webhook signatures                                                          |
| `NEXT_PUBLIC_APP_URL`                                | all                        | Recommended              | Canonical origin for absolute links; the portal also uses it for links back to the website |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`                      | web                        | For CMS                  | Sanity project identifier                                                                  |
| `NEXT_PUBLIC_SANITY_DATASET`                         | web                        | For CMS                  | Sanity dataset, usually `production`                                                       |
| `SANITY_API_TOKEN`                                   | web                        | For CMS writes           | Server-side Sanity token                                                                   |
| `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` | studio                     | Yes for Studio           | Studio equivalents of the Sanity variables                                                 |

## Public website (`apps/web`)

| Variable                                                  | Required            | Purpose                                                                                                                             |
| --------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                    | Recommended         | Canonical site origin for metadata, sitemap and Open Graph URLs                                                                     |
| `NEXT_PUBLIC_PORTAL_URL`                                  | Optional            | Learner portal origin for the **My account** link. Defaults to the production portal                                                |
| `ANTHROPIC_API_KEY`                                       | For the assistant   | Enables AI answers in the public assistant. Without it the assistant shows contact channels                                         |
| `LUMINOL_ASSISTANT_MODEL`                                 | Optional            | Claude model for the assistant. Default `claude-haiku-5-5`                                                                          |
| `LUMINOL_ASSISTANT_DISABLED`                              | Optional            | Set to `1` to hide the assistant entirely                                                                                           |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Optional, as a pair | Cloudflare Turnstile spam protection on enquiry forms. Without it, a honeypot field and per-address rate limiting protect the forms |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`                 | Optional, as a pair | Instant Telegram alert to staff for each new enquiry                                                                                |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                             | Optional            | WhatsApp number in international digits. Defaults to the academy's official number                                                  |
| `NEXT_PUBLIC_BOOKING_URL`                                 | Optional            | HTTPS scheduling link (for example Cal.com) shown next to the consultation form                                                     |
| `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS`                     | Optional            | Set to `1` after enabling Vercel Web Analytics on the project                                                                       |
| `RESEND_API_KEY` / `NOTIFICATION_FROM_EMAIL`              | Optional, as a pair | Sends an acknowledgement email for email-first enquiries                                                                            |

## Administration (`apps/admin`)

| Variable                                                                 | Default          | Purpose                                                                     |
| ------------------------------------------------------------------------ | ---------------- | --------------------------------------------------------------------------- |
| `LUMINOL_AI_PROVIDER_MODE`                                               | `OFF`            | Set to `OPENAI` to enable the AI operator                                   |
| `OPENAI_API_KEY`                                                         | –                | Required when the AI operator is enabled                                    |
| `LUMINOL_AI_MODEL`                                                       | provider default | Model used by the AI operator                                               |
| `LUMINOL_AI_MONTHLY_BUDGET_USD`                                          | –                | Hard monthly spending limit                                                 |
| `LUMINOL_AI_INPUT_USD_PER_MILLION` / `LUMINOL_AI_OUTPUT_USD_PER_MILLION` | –                | Token prices used for budget accounting                                     |
| `LUMINOL_AI_TIMEOUT_MS`                                                  | –                | Provider request timeout                                                    |
| `CRON_SECRET`                                                            | –                | Bearer secret (32+ characters) for the scheduled social publishing endpoint |

## Workers (`packages/worker`)

These run from GitHub Actions on a schedule, so their values are Actions secrets.

| Variable                                                   | Default | Purpose                                                     |
| ---------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| `RESEND_API_KEY` / `NOTIFICATION_FROM_EMAIL`               | –       | Email delivery for queued notifications                     |
| `NOTIFICATION_PROVIDER_TIMEOUT_MS`                         | `30000` | Email provider timeout                                      |
| `NOTIFICATION_WORKER_BATCH_SIZE`                           | `25`    | Notifications processed per run                             |
| `NOTIFICATION_WORKER_INTERVAL_MS`                          | `5000`  | Poll interval for a continuously hosted worker              |
| `LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE`                    | `OFF`   | Set to `INSTAGRAM_REELS_DUE` to publish approved, due Reels |
| `LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE`              | `10`    | Reels processed per run                                     |
| `LUMINOL_SOCIAL_PUBLISHING_WORKER_INTERVAL_MS`             | `15000` | Poll interval for a continuously hosted worker              |
| `LUMINOL_META_PUBLISHING_MODE`                             | `OFF`   | Set to `INSTAGRAM_REELS` to allow Meta delivery             |
| `LUMINOL_META_GRAPH_VERSION` / `LUMINOL_META_ACCESS_TOKEN` | –       | Meta Graph API version and server-side access token         |
| `LUMINOL_META_REQUEST_TIMEOUT_MS`                          | `10000` | Meta request timeout                                        |

Scheduled social publishing needs **both** `LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE` and `LUMINOL_META_PUBLISHING_MODE` to be switched on.

## Testing

| Variable                    | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `TEST_DATABASE_URL`         | Database used by integration tests. CI provides an ephemeral PostgreSQL |
| `LUMINOL_PROGRAMME_FIXTURE` | Serves a fixed test programme catalogue to the browser fixture server   |

## Deployment

### Vercel projects

| Project                  | Root directory | Production URL                            |
| ------------------------ | -------------- | ----------------------------------------- |
| `luminol-academy-web`    | `apps/web`     | https://luminol-academy-web.vercel.app    |
| `luminol-academy-portal` | `apps/portal`  | https://luminol-academy-portal.vercel.app |
| `luminol-academy-admin`  | `apps/admin`   | https://luminol-academy-admin.vercel.app  |

Each project installs with `pnpm install --frozen-lockfile` and builds with `pnpm build`, which generates the Prisma client before `next build`. An ignored-build command skips projects whose code did not change; its rules are documented in [Vercel deployment selection](deployments.md).

Automatic deployments run for `main` (production) and for branches named `preview-*` (previews). Other branches do not deploy automatically.

### Release flow

1. Create a branch from `main` and open a pull request.
2. The required `quality` check must pass. Fix failures on the branch; never bypass the check.
3. Merge the pull request. Vercel builds and promotes the affected projects to production.
4. Verify the production URLs. The scheduled health check also runs every 6 hours.
5. If a release misbehaves, use **Vercel → Deployments → Instant Rollback** on the affected project, then fix forward through a new pull request.

Database migrations reach production through the dedicated **production migrations** workflow, never from a local machine.

### Production checklist for a new environment

- [ ] Clerk **Production** instance created, and its `pk_live_…` and `sk_live_…` keys set on portal and admin
- [ ] `DATABASE_URL` points to the production database, and migrations are applied
- [ ] `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_PORTAL_URL` set to the final domains
- [ ] `ANTHROPIC_API_KEY` set on the web project, if the assistant should answer
- [ ] Turnstile, Telegram and Resend pairs set, if those features are wanted
- [ ] Each project redeployed after its variables changed
