# September 24: a denser, more useful public academy

Continues PR #552 from `76f69bf5` on `preview-luminol-premium-redesign`. The owner chose a dense cinematic layout, “Explore programmes” and “Request a consultation”, editorial judgment for motion, their supplied testimonial comments, verified content and the existing enquiry flow.

## Owner-directed film and palette update

The owner supplied more visual references and asked for the About page colors on Home, plus a moving professional-academy hero. The homepage uses the same cream, mist, pale cyan and navy design tokens across its rail and learning section. In the latest revision, the hero uses a muted, looping 12-second Pexels film by Tima Miroshnichenko: three adult learners working with books in front of a library wall. Its local H.264 file is 831,069 bytes at 1280×720, with a 76,062-byte WebP poster and no audio. It plays only when visible, pauses when the page is hidden or the visitor pauses it, and stays still for reduced-motion and Save-Data visitors. Source, license, crop and the fact that this is not Luminol premises or alumni are recorded in `apps/web/public/media/stock/manifest.json`, without an overlaid production label in the public design.

The owner-provided French-learning still life replaces the homepage Languages card image. Its original JPEG is used without editing, with localized alt text and a centered crop that keeps the notebook and Eiffel Tower together. Provenance is in `apps/web/public/media/provided/manifest.json`. Other supplied images with unrelated certificates, children, premises or prominent promotional claims were not used. The Pinterest link was treated as visual direction only.

The two remaining approach scenes are now separate, silent, locally optimized films: a library conversation for “Connect” and a facilitated professional presentation for “Become.” Each retains the first film's play/pause and visibility behavior and has a WebP poster for reduced-motion, mobile and data-saving visitors. The psychology and professional-training school cards use reviewed photography of conversation and collaborative work. The spirit collage now pairs two people reading with the detail of choosing a book. Visible “AI illustration,” “Stock photograph,” “Provided image” and “Stock film” badges were removed from the design, as were raw JSON media links from the footer. Provenance, approval and crop metadata remain in source and manifests; the page does not claim the pictured people or spaces belong to Luminol.

Browser verification found and fixed a pointer hit area that blocked the hero film pause control. Local validation for this update: root lint, typecheck, unit tests (996 passed) and production build, then 41 focused public browser tests covering scene provenance, playback, reduced motion, Save-Data and AR/FR/EN mobile layout. The preview branch and PR are updated without changing the production branch.

## Design and real defects

- Fixed the community collage's collapsed fill-image containers with parent-qualified positioning and explicit responsive height. Downloaded images previously occupied zero visible height because the shared figure style overrode absolute positioning.
- Clipped the transformed hero to its own section; it previously obscured the school navigation strip during scrolling.
- Increased the welcome line to 18–26px, made the two primary routes explicit, reduced section/chapter spacing and added useful school topics. The original logo remains.
- Added three source-backed testimonial excerpts with Arabic originals and clearly labeled French/English translations. These are general training feedback, not endorsements of the current ACT cohort. Provenance: `docs/testimonial-provenance.md`.
- Reused the existing enquiry component on the homepage, including consent, contact preference, optional qualification fields, validation, attribution and submission behavior.
- Programme imagery resolves centrally: approved current CMS imagery first; evergreen reflection imagery for the ACT waitlist (never an expired cohort poster); reviewed topic or school fallback otherwise. All 12 school offerings have stable localized topic keys. Approved Sanity crops are contained rather than cropped again.
- The published psychology school currently has one CMS programme. That state now uses the full programme grid width, pairing its image and content horizontally on desktop and stacking them at tablet/mobile sizes. This removes the empty second column while preserving the existing layout for schools with several programmes. Verified with the isolated single-ACT fixture at English 1440px, French 768px and Arabic 390px, including decoded imagery, full grid-width coverage and unclipped headings.

## Assets, facts and motion

Eleven reviewed Pexels photographs add different settings and scales: outdoor study, writing, conversation, English teaching, French books/culture, devices, public speaking, psychology discussion, professional collaboration and library reading. Each has local WebP delivery, localized alt text, approval, source, creator, license and crop intent. The underlying source records distinguish real stock from generated scenes, while the public design uses no technical media badges. These people/spaces are never identified as actual Luminol people or premises. No founder portrait was added.

The source of truth is `apps/web/public/media/stock/manifest.json`. A six-second notebook film is 726,090 bytes, silent, 1280×720 H.264 with fast-start; its poster is 24,486 bytes. The new Connect and Become films are 615,234 and 674,226 bytes. Approach films load only when sufficiently visible on desktop, pause offscreen, honor manual pause, and keep a poster until explicitly requested for mobile, reduced motion and Save-Data. No animation dependency was added. Native scroll drives modest layered depth, with static reduced-motion behavior.

No student totals, success rates, ratings, opening dates or enrolment figures were invented. The three-school count is derived from the existing school definitions. The founder experience statement remains the academy's existing editorial copy; testimonial screenshots are not used to infer statistics or current programme logistics.

Reference direction: [Kent College](https://kentcollege.com/), [The Walker School](https://www.thewalkerschool.org/), the [owner's tutorial](https://www.youtube.com/watch?v=h2MjhbwVKLk), [Motion's official scroll guidance](https://motion.dev/docs/react-scroll-animations) and [public repository](https://github.com/motiondivision/motion). These informed hierarchy, pacing and progressive enhancement; their code, branding and media were not copied.

## Validation

Run root pnpm lint, typecheck, test and build, then public browser tests against the production build and isolated CMS fixtures. Coverage includes actual decoded image dimensions, hero-rail hit testing, no-JavaScript imagery, all four ACT image placements in AR/FR/EN, film loading/pause preferences and a mocked homepage enquiry. Final counts and preview deployment status are recorded on PR #552. No production deployment, merge, database change or operational application change is part of this revision.
