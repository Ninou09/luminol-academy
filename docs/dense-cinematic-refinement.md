# September 24: a denser, more useful public academy

Continues PR #552 from `76f69bf5` on `preview-luminol-premium-redesign`. The owner chose a dense cinematic layout, “Explore programmes” and “Request a consultation”, editorial judgment for motion, their supplied testimonial comments, verified content and the existing enquiry flow.

## Design and real defects

- Fixed the community collage's collapsed fill-image containers with parent-qualified positioning and explicit responsive height. Downloaded images previously occupied zero visible height because the shared figure style overrode absolute positioning.
- Clipped the transformed hero to its own section; it previously obscured the school navigation strip during scrolling.
- Increased the welcome line to 18–26px, made the two primary routes explicit, reduced section/chapter spacing and added useful school topics. The original logo and courtyard composition remain.
- Added three source-backed testimonial excerpts with Arabic originals and clearly labeled French/English translations. These are general training feedback, not endorsements of the current ACT cohort. Provenance: `docs/testimonial-provenance.md`.
- Reused the existing enquiry component on the homepage, including consent, contact preference, optional qualification fields, validation, attribution and submission behavior.
- Programme imagery resolves centrally: approved current CMS imagery first; evergreen reflection imagery for the ACT waitlist (never an expired cohort poster); reviewed topic or school fallback otherwise. All 12 school offerings have stable localized topic keys. Approved Sanity crops are contained rather than cropped again.
- The published psychology school currently has one CMS programme. That state now uses the full programme grid width, pairing its image and content horizontally on desktop and stacking them at tablet/mobile sizes. This removes the empty second column while preserving the existing layout for schools with several programmes. Verified with the isolated single-ACT fixture at English 1440px, French 768px and Arabic 390px, including decoded imagery, full grid-width coverage and unclipped headings.

## Assets, facts and motion

Seven reviewed Pexels photographs add different settings and scales: outdoor study, writing, conversation, English teaching, French books/culture, devices and public speaking. Each has local WebP delivery, localized alt text, visible illustrative stock labels, approval, source, creator, license and crop intent. Generated academy scenes retain their separate AI labels. These people/spaces are never identified as actual Luminol people or premises. No founder portrait was added.

The source of truth is `apps/web/public/media/stock/manifest.json`. The photographs total about 490KiB. A six-second notebook film is 726,090 bytes, silent, 1280×720 H.264 with fast-start; its poster is 24,486 bytes. It loads only when sufficiently visible on desktop, pauses offscreen, honors manual pause, and keeps a poster until explicitly requested for mobile, reduced motion and Save-Data. No animation dependency was added. Native scroll drives modest layered depth, with static reduced-motion behavior.

No student totals, success rates, ratings, opening dates or enrolment figures were invented. The three-school count is derived from the existing school definitions. The founder experience statement remains the academy's existing editorial copy; testimonial screenshots are not used to infer statistics or current programme logistics.

Reference direction: [Kent College](https://kentcollege.com/), [The Walker School](https://www.thewalkerschool.org/), the [owner's tutorial](https://www.youtube.com/watch?v=h2MjhbwVKLk), [Motion's official scroll guidance](https://motion.dev/docs/react-scroll-animations) and [public repository](https://github.com/motiondivision/motion). These informed hierarchy, pacing and progressive enhancement; their code, branding and media were not copied.

## Validation

Run root pnpm lint, typecheck, test and build, then public browser tests against the production build and isolated CMS fixtures. Coverage includes actual decoded image dimensions, hero-rail hit testing, no-JavaScript imagery, all four ACT image placements in AR/FR/EN, film loading/pause preferences and a mocked homepage enquiry. Final counts and preview deployment status are recorded on PR #552. No production deployment, merge, database change or operational application change is part of this revision.
