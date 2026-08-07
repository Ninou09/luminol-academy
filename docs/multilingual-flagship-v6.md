# Multilingual Flagship V8

This validation marker records the current public-site refinement scope on PR #94.

## Public locales

- Arabic: `/`
- French: `/fr`
- English: `/en`

Each locale includes Home, About, Contact, Psychology, Languages, and Professional Training routes. Language switching preserves the equivalent public route.

## Visual refinement

The V8 pass reduces headline and media scale again, keeps a more symmetrical institutional grid, replaces the primary editorial photography with wider education-focused scenes, changes the hero and language video treatment, reduces over-cropping across video and photography, strengthens the official navy/cyan/gold palette, and adds compact icon-led detail, richer hover states and restrained ambient motion.

## Reference audit

The homepage architecture was compared against high-performing education experiences including Avenues and Punahou plus the Eduka education-template reference. The implementation adopts high-level patterns such as clearer information hierarchy, compact quick-access navigation, small icon cues, narrative learning sections, restrained media scale and strong conversion actions without copying proprietary layout or assets.

## Accessibility and governance

Motion respects `prefers-reduced-motion`, video remains muted by default, editorial media is visibly treated as illustrative rather than authentic Luminol documentation, and governed Sanity team/testimonial publication rules remain unchanged.

## Validation gate

The branch must pass the complete repository CI suite and receive a Ready Vercel preview before this visual pass is considered deployment-verified.
