# Public flagship QA checklist

Use this checklist before PR #94 is marked ready or merged.

## Visual review

- [ ] Homepage hero fits within common laptop viewports without hiding the three-school navigator.
- [ ] Psychology feels calm, safe and intelligent without clinical or wellness clichés.
- [ ] Languages feels social, global and practical without flag or textbook clichés.
- [ ] Professional Training feels ambitious and applied without generic corporate imagery.
- [ ] About, Contact and all three school pages clearly belong to the same master brand.
- [ ] Mobile layouts preserve hierarchy and do not merely shrink desktop composition.
- [ ] Temporary licensed images are credited and are not represented as Luminol photography.

## Content and governance

- [ ] No invented statistics, events, results, testimonials or instructor identities appear.
- [ ] Team profiles render only from active approved CMS records.
- [ ] Testimonials render only when active and publication consent is confirmed.
- [ ] Programme CMS content safely falls back to reviewed Luminol copy.
- [ ] Psychology boundaries and referral language remain visible.
- [ ] Arabic is not presented as complete until professionally reviewed content exists.

## Interaction and accessibility

- [ ] Header, mobile navigation, branch navigation, FAQs and form are keyboard usable.
- [ ] Focus indicators remain visible on light and dark surfaces.
- [ ] Headings retain a logical hierarchy.
- [ ] Images have meaningful alt text.
- [ ] Body and utility copy meet contrast and minimum-size requirements.
- [ ] Reduced-motion mode removes decorative movement without hiding content.

## Technical verification

- [ ] Frozen installation and production dependency audit pass.
- [ ] Prisma validation and migration deployment pass.
- [ ] Lint and repository formatting pass.
- [ ] Full typecheck and test suite pass.
- [ ] All production builds pass.
- [ ] Playwright public-route smoke tests pass.
- [ ] Exact-head Vercel preview returns HTTP 200 for all major public routes.
- [ ] Canonical, Open Graph and Twitter metadata remain route-specific.
- [ ] Sitemap, robots.txt, structured data and security headers remain active.
- [ ] No console, hydration, image-loading or runtime errors are visible.

## Release gate

PR #94 remains a draft until the exact-head preview has passed visual review at desktop and mobile widths and every available automated quality gate is green.
