# Handoff: where the project stands and what comes next

_Last updated: 23 November 2026_

This page lets work continue from any computer. It lists what is live, the next actions in order, and what is still waiting on the academy.

## Live now

| Application    | URL                                       |
| -------------- | ----------------------------------------- |
| Public website | https://luminol-academy-web.vercel.app    |
| Learner portal | https://luminol-academy-portal.vercel.app |
| Administration | https://luminol-academy-admin.vercel.app  |

Recently merged into `main`:

| Pull request | Change                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| #582         | Public site redesign, consultation and programme journeys, unique imagery per page, English and Arabic documentation   |
| #583         | `vitest` 5, `svix` 2 (Clerk webhook verification adapted, with tests), pinned GitHub Actions                           |
| #584         | Automated accessibility checks (axe, WCAG 2.1 AA) in CI; loop-safe locale proxy for local Windows builds               |
| #588         | Owner-confirmed content: consultation types, 31+ years of experience, languages programmes, course FAQ, founder byline |
| #589         | 18-hour courses in Arabic with some Darija and French; fee wording without amounts                                     |

## Continue on another computer

1. Install Node.js 22 or 24 and Git, then enable pnpm with `corepack enable`.
2. Clone the repository and install: `git clone https://github.com/Ninou09/luminol-academy.git`, then `pnpm install` in the folder.
3. Follow the local setup in the [README](../README.md#local-setup) if you need to run the site locally.

## Next actions, in order

### 1. Load the nine psychology courses into Sanity

The courses from the founder's site are ready in [`apps/studio/seed/psychology-courses.ndjson`](../apps/studio/seed/psychology-courses.ndjson), in Arabic, French and English. ACT is already published, so the file holds the other nine:

CBT techniques · EFT · marital counselling · family counsellor · schema therapy · learning difficulties (assessment and care) · child psychology · effective parenting · learning difficulties for parents and teachers.

Each course is set to: School of Psychology, taught in Arabic, delivery "Flexible" (in person or online), active.

From the repository root:

```bash
npx sanity@latest login
```

Sign in with the academy's Sanity account in the browser window that opens. Then find the project ID at https://www.sanity.io/manage and run, in PowerShell from the `apps/studio` folder (replace `PROJECT_ID`):

```powershell
$env:SANITY_STUDIO_PROJECT_ID = 'PROJECT_ID'
npx sanity@latest dataset import seed/psychology-courses.ndjson production --missing
```

On macOS or Linux, use `SANITY_STUDIO_PROJECT_ID=PROJECT_ID npx sanity@latest dataset import seed/psychology-courses.ndjson production --missing` instead.

`--missing` adds only courses that do not exist yet, so running it twice is safe. The courses appear on `/programmes` and the Psychology school page within a minute. Once there is more than one course, the Programmes intro also shows the "18 hours" line.

Course hours (18 per course) are already stated in the FAQ and the Programmes intro. Do not add prices: the owner asked that fees are explained personally.

### 2. Accounts and keys (Vercel → Project → Settings → Environment Variables)

| Item                                                                                                                  | Project       | Needed for                                                              | Cost                                        |
| --------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| Clerk **Production** instance: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_live_…`) and `CLERK_SECRET_KEY` (`sk_live_…`) | portal, admin | Real learner and staff sign-in                                          | Free up to 50,000 returning users per month |
| `ANTHROPIC_API_KEY`                                                                                                   | web           | AI assistant answers (without it, the assistant shows contact channels) | Prepaid usage; no free tier                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` **and** `TURNSTILE_SECRET_KEY`, in the same change                                   | web           | Spam protection on forms                                                | Free                                        |
| `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`                                                                           | web           | Instant staff alert for each request                                    | Free                                        |
| `RESEND_API_KEY` and `NOTIFICATION_FROM_EMAIL`                                                                        | web           | Confirmation emails                                                     | Free up to 3,000 per month                  |

Redeploy each project after changing its variables. Full reference: [Configuration and deployment](CONFIGURATION.md).

**Hosting note:** Vercel's free Hobby plan is for non-commercial use only. The academy charges for courses, so plan for Vercel Pro (about US$20 per month) or another host.

### 3. Pull requests waiting for a decision

| Pull request                 | Recommendation                                                          |
| ---------------------------- | ----------------------------------------------------------------------- |
| #558 GitHub Actions updates  | Close: already included through #583                                    |
| #576 `@types/node` 26        | Close: the site runs on Node 20–24                                      |
| #579 `@clerk/nextjs` 7       | Do after the Clerk production instance exists, as its own tested change |
| #549, #552, #556, #560, #571 | Owner decides: keep, update onto `main`, or close                       |

### 4. Engineering backlog

1. Consultations page: mobile Largest Contentful Paint rose from 1.80 s to 2.41 s in the #581 lab measurement. Bring it back under 2.0 s.
2. Move the journal from `apps/web/lib/journal.ts` into Sanity, keeping drafts unindexed until published.
3. Connect consultation requests to the administration consultations workspace, with a WhatsApp confirmation template.
4. Add `Course`, `Event`, `FAQPage` and `LocalBusiness` structured data where content supports it.
5. Build an evaluation set for the AI assistant (Arabic, Darija, French, English, including crisis and out-of-scope questions).
6. Portal launch: switch Clerk to production and walk through sign-in, courses, progress and certificates on a phone in Arabic.
7. Configure the protected Playwright state so authenticated journeys run in CI.

## Waiting on the academy

| Item                                                                           | Status                                                                                              |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Team photo and short biographies                                               | Owner will send later. **Remind the owner once the work above is done.**                            |
| Testimonials with written consent                                              | Owner will send later                                                                               |
| The four draft journal articles                                                | Hidden from search. Waiting for publish, change or remove, per article. Signed "Kheddaoui Fettouma" |
| Legal name, registration number, privacy contact, refund rule                  | Not answered yet (owner guide, part F)                                                              |
| Paid service choices: hosting plan, own domain, assistant mode, online booking | Not answered yet (owner guide, part G)                                                              |

## Decisions already made by the owner

- Contact details, address (شارع الزيات، فيلا رقم 2، البليدة) and social links are correct.
- Consultations: individual, couples and family, mostly led by the founder, Kheddaoui Fettouma, 31+ years of experience. No parent attendance or signature is required.
- Fees: consultations have a fixed fee, but **no amounts are published**. The site says fees are accessible and explained personally by WhatsApp or phone.
- Courses: all psychology and language courses are open. A group starts once full. 18 hours each, in Arabic with some Darija and a little French, in person or online, with a certificate of attendance.
- Languages school: level programmes and a speaking programme.
- Journal articles are signed by Kheddaoui Fettouma.
