# Luminol public website — editorial redesign

## Direction

The reference video (https://www.youtube.com/watch?v=h2MjhbwVKLk) was analyzed from its full 15:20 auto-generated transcript. Its useful principles are visual storytelling through scroll, deliberate camera/image composition, consistent brand details, and a separately composed mobile layout. This implementation uses lightweight photographic parallax and native sticky story chapters, not a video frame sequence. Reduced-motion preferences disable both effects.

Kent College (https://kentcollege.com/) informed the community photography and clear school pathways. The Walker School (https://www.thewalkerschool.org/) informed the immersive section scale, bold hierarchy, and values-led storytelling. Its embedded film was restricted in the review browser, but the page and scroll sections were readable. No reference-site code, branding, photographs, testimonials or claims were copied.

## Scope

- Public homepage, shared header/footer, full-screen keyboard-accessible navigation.
- Editorial hero treatments on About, Programmes, Contact, Consultations and school pages.
- Arabic RTL, French and English copy. Existing CMS programmes, programme filters, enquiries and workshop pages retain their data and flows.
- Original supplied Luminol logo retained. No founder portrait added.
- Native dialog provides Escape dismissal, focus containment and focus restoration. Body scrolling is restored when closed or unmounted.

## Imagery

The owner explicitly asked to integrate the previously commissioned AI-generated academy asset kit and add diverse realistic assets. `public/media/academy/manifest.json` records source, owner authorization and illustrative status. Localized descriptions, crop intent and focal positions live in `lib/academy-media.ts`. These illustrative scenes are not evidence of actual Luminol staff, students, premises or outcomes.

One new image was generated with the built-in image-generation tool: `public/media/academy/community-courtyard.webp`. All other new project images come from the owner's Luminol Website Asset Kit v3. The homepage uses distinct scenes for the hero, community, school cards, learning chapters and learning formats.

New hero prompt: Wide 16:9 candid editorial photograph of three North African adult learners, aged 22–30, walking and talking with notebooks in a modest sunlit Mediterranean courtyard. Cream headscarf/navy overshirt, olive cardigan and light-blue shirt; group in the right two-thirds, shaded foliage and limestone to the left for the heading. Natural late-afternoon light, realistic skin, hair and hands, 35mm documentary photography, no invented school signage, logos, text, uniforms, certificates or glamour retouching.

## Verification

- Root `pnpm lint`: pass (20 workspace tasks).
- Root `pnpm typecheck`: pass (20 workspace tasks).
- Root `pnpm test`: pass (986 tests, 114 existing skips).
- Root `pnpm build`: pass (20 workspace tasks, including public web/admin/portal builds).
- Visual and interaction verification: pending preview deployment.

No database, authentication, payment, outbound messaging, operational application or production environment changes are included.
