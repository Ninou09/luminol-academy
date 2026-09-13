# Focused public enquiry improvements

This change shortens the path from programme discovery or consultation information to an enquiry. It preserves the existing three-school structure and media approval rules.

## Visitor behaviour

- The homepage leads to the published programme catalogue and highlights a programme from that same source. ACT retains its next-cohort waitlist label. An unavailable or empty catalogue produces no spotlight; no dates, prices or availability are invented.
- The contact form appears before the school exploration links. On narrow screens it also precedes the explanation of the follow-up process.
- The initial form asks for a name, contact method and corresponding contact detail, area of interest, and consent. WhatsApp is the initial contact method; email and phone remain available.
- Message, city, format and timing are optional in an expandable section. Programme and consultation context, campaign attribution and consent continue through the existing enquiry API.
- Unanswered city, format and timing are stored as null. Existing admin qualification reports can identify them for later follow-up. No database migration is required.
- Submission failure preserves the visitor's answers for retry. Success confirms receipt of a request and explains that the team must subsequently confirm registration or an appointment.
- Public verification, programme catalogue and printable learner certificate copy explicitly describe attendance certificates. Shared Arabic, French and English wording states that these do not confer academic accreditation or a professional licence. Certificate eligibility, access control, issuance and revocation logic are unchanged.

## Validation

- `pnpm lint` and `pnpm typecheck`: all 20 workspace tasks passed.
- `pnpm test`: 936 tests passed; 114 tests requiring integration configuration were skipped.
- `pnpm build --env-mode=loose`: all 20 workspace builds passed. Loose mode was needed locally to pass the workspace HTTP proxy to Google Fonts fetching; application configuration was not changed.
- `pnpm format:check`: passed.
- 22 focused Playwright checks passed, covering the short enquiry flow in all three locales, required consent, email switching, failed submissions and retry, consultation context, programme links and context, accessible landmarks, and Arabic mobile layout.
- Browser submission tests intercepted the API. Catalogue browser checks used a local CMS fixture; API tests used the existing mocked persistence boundary. No production enquiry or notification was created.
- Final browser review covered Arabic home and contact at 1440px and 390px, with no horizontal overflow or page errors.

## Remaining release work

- Restore the GitHub connection, push `improve/luminol-enquiry-readiness`, and open a pull request against `main`. This branch is outside the existing Vercel automatic deployment branch patterns. Preserve deployment privacy and obtain the owner's approval before exposing a new deployment publicly.
- Run the required GitHub quality gate, including its ephemeral PostgreSQL integration checks, before merging.
- Complete the previously documented protected admin-to-registration journey with restricted accounts, and retain the existing operator checks for notification delivery and reviewed legal notices.
- Add the owner's approved original logo and academy photography through the existing governed media path, preserving source, alt text, crop intent and approval metadata.

The local verification does not close the protected launch evidence gaps recorded in `PROJECT_STATUS.md`.
