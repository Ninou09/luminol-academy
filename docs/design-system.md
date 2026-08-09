# Luminol design system

The Luminol design system translates the academy's intellectual, modern,
empowering and accessible identity into reusable product primitives. It serves
the public website, learner portal, administration interface and future native
experiences without coupling those applications together.

## Foundation

- **Ink** is the primary brand and text colour.
- **Gold** is reserved for emphasis, active states and high-value actions.
- **Canvas** and **surface** keep layouts calm, readable and human.
- School colours distinguish Psychology, Languages and Professional Training
  without replacing the core Luminol identity.
- Manrope is the Latin interface face, Cormorant Garamond is the display face,
  and Noto Sans Arabic supports Arabic with a system sans-serif fallback.

The public website loads the governed font families through `next/font` so they
are bundled with the application instead of depending on a runtime third-party
font request. CSS font tokens retain system fallbacks for resilience.

Tokens are available as typed values from `@luminol/config/tailwind` and as
Tailwind/CSS custom properties from `@luminol/config/tokens.css`.

## Application setup

Import the shared CSS tokens immediately after Tailwind:

```css
@import 'tailwindcss';
@import '@luminol/config/tokens.css';
```

Use semantic variables such as `var(--color-brand-ink)` and logical CSS
properties such as `padding-inline` and `border-inline-start`. Do not introduce
new hard-coded brand colours inside applications.

Set `lang` and `dir` at the document boundary. Arabic documents use
`dir="rtl"`; components must not override direction locally unless rendering an
isolated bidirectional value.

## Components

`@luminol/ui` provides:

- `Button` and `ButtonLink` with primary, secondary and quiet variants
- `Container` and `Section` for consistent responsive layout
- `Stack` for vertical rhythm
- `Card` and `Badge` for structured content
- `Wordmark` for a consistent text lockup

All interactive controls include visible keyboard focus, minimum target sizes
and reduced-motion support. Prefer native semantic elements and preserve their
accessible names.

## Editorial media foundation

The public website uses `EditorialMedia` as the governed presentation boundary
for programme imagery. It has two deliberate states:

- an approved CMS-backed asset with meaningful alternative text and an explicit
  source marker;
- a branch-specific decorative fallback when no approved asset is available.

A missing image must therefore degrade to an intentional Luminol composition,
not a broken image, an empty hole, or an unreviewed stock replacement. The
fallback is decorative and hidden from assistive technology because the nearby
programme title and description carry the content.

Psychology, Languages and Professional Training each receive a restrained soft
surface derived from their existing school token. Shared media radius, aspect
ratio, shadow, duration and easing tokens keep future hero, card and feature
media consistent. Motion remains subtle and the repository-wide reduced-motion
rule disables it for users who request less motion.

Real media added in later visual phases must preserve its source, review status,
alt text and responsive crop intent before it replaces a governed fallback.

## Governance

Add a token only when it represents a repeated design decision across multiple
features. Add components for reusable behavior or semantics—not merely to avoid
writing markup. Every new component must support keyboard use, narrow screens
and both LTR and RTL document directions.
