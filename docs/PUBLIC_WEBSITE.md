# Public website

**English** · [العربية](ar/PUBLIC_WEBSITE.md)

`apps/web` is the academy's public face. It presents the three schools, turns interest into consultation and programme enquiries, and builds trust through clear, calm and fully localized content. This guide covers what the site contains, how its main features behave, and the rules every change must respect.

## Routes

Every route exists in Arabic, French and English under `/ar`, `/fr` and `/en`.

| Route                         | Content                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `/`                           | Home: the three schools, featured programmes, upcoming events, team, newsletter |
| `/schools`                    | Schools hub with a short quiz that suggests the right school                    |
| `/schools/[school]`           | Psychology, Languages and Professional Development school pages                 |
| `/programmes`                 | Programme catalogue with search and URL-preserved filters                       |
| `/programmes/[slug]`          | Programme detail with enrolment status and a programme-specific enquiry         |
| `/consultations`              | Psychological consultations and the consultation request form                   |
| `/approach`                   | The academy's therapeutic and teaching approach, including the ACT model        |
| `/events`                     | Archive of past meetings, ordered by their end date in Algeria time             |
| `/workshops/[slug]`           | Workshop participant pages with schedule, FAQ and calendar download             |
| `/journal`, `/journal/[slug]` | Editorial articles. Draft articles are excluded from search indexing            |
| `/about`, `/contact`          | Academy story, team, address, opening hours and contact channels                |
| `/certificates/[id]`          | Public certificate verification that never reveals unknown records              |
| `/privacy`                    | Privacy policy                                                                  |
| `/psy-library`                | Psychology reading library                                                      |

API routes: `/api/enquiries`, `/api/newsletter`, `/api/assistant`, `/api/events/[id]/calendar` (iCalendar download), `/api/social-preview` (Open Graph images) and `/api/webhooks/clerk`.

## Features

### Enquiries

Consultation, programme and contact forms share one enquiry pipeline (see [Architecture](ARCHITECTURE.md#enquiries-and-leads)). Visitors choose WhatsApp, phone or email. The form remembers entered contacts while the visitor switches channel, submits only the selected channel, keeps optional details collapsed, requires consent, and preserves input after a failure so the visitor can retry. The academy confirms each appointment by contacting the visitor; the site never promises a booked time.

### AI assistant

A floating assistant answers questions about schools, programmes, consultations, opening hours and contacts. It asks for consent before the first message, refuses to give diagnosis or treatment, and answers crisis messages with emergency and human contacts without calling the model. Configure it with `ANTHROPIC_API_KEY`; without the key it shows the academy's contact channels. See [Configuration](CONFIGURATION.md#public-website-appsweb).

### Search

Programme search maps everyday words in English, French, Arabic and Algerian Darja to the topics and school they usually mean. A visitor typing "my child does not listen" or "قلق" still finds relevant programmes when those exact words do not appear in a title.

### Events and calendars

Upcoming events appear on the home page, and past events move to `/events`. Each event offers an `.ics` download in Algeria time, so it opens in any calendar application.

### Accessibility and comfort

- A display settings menu offers larger text and high contrast, remembered per browser.
- Calm mode replaces the animated background with a still landscape.
- Animation, video and 3D scenes stop when the visitor's system requests reduced motion.
- Every page has a skip link, landmark regions, visible focus states and tap targets of at least 32 px on phones.
- Layouts are checked from 320 px to 1920 px wide with no horizontal scrolling or clipped text.

### Learner portal link

The header shows a **My account** link to the learner portal, localized to the current language. Its target comes from `NEXT_PUBLIC_PORTAL_URL`.

## Localization rules

- Arabic is right-to-left. The root layout sets `lang` and `dir` on the document, and components use logical CSS properties (`inline-start`, `inline-end`) so layouts mirror correctly.
- Arabic text uses Noto Sans Arabic without Latin letter spacing. Latin text uses Manrope and Cormorant Garamond.
- Every visible string, image alternative text and metadata field exists in all three languages. Canonical URLs, `hreflang` alternates and an `x-default` fallback are published for every page.
- Check phone numbers, prices and dates inside Arabic sentences in the browser: they must keep their left-to-right digit order.

## Media rules

- Each page uses its own photographs. The same image is not repeated on another page.
- Every image is a WebP with explicit dimensions, alternative text in three languages, and a crop intent that keeps faces and subjects in frame.
- Media is never fabricated to represent real people, clients or events. Placeholder or unreviewed imagery is not published.
- Commissioned artwork and photo credits are recorded in [Cinematic public-site media](cinematic-media.md).

## Academy facts used on the site

| Fact          | Value                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| Address       | Villa No. 2, Ezzayat Street, Blida, Algeria                                                 |
| Opening hours | Saturday to Thursday, 08:00–17:00. Closed on Friday                                         |
| WhatsApp      | +213 553 14 02 93 (WhatsApp Business, used by every button) · second line +213 556 91 45 17 |
| Reception     | +213 777 07 71 97                                                                           |
| Email         | luminolacademy09@gmail.com                                                                  |

Keep these values in `apps/web/lib/contact-channels.ts` and the localized copy in sync when they change. Client records from the CRM are never published on the website.

## Related documents

- [Public site review](PUBLIC_SITE_REVIEW.md): annotated screenshots of the main journeys
- [Design system](design-system.md) and [design rationale](DESIGN_RATIONALE.md)
- [Public enquiry readiness](public-enquiry-readiness.md)
- [Milestone 15 public localization validation](milestone-15-public-localization-validation.md)
