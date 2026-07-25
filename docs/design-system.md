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
  and IBM Plex Sans Arabic with Noto Sans Arabic fallback supports Arabic.

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

## Governance

Add a token only when it represents a repeated design decision across multiple
features. Add components for reusable behavior or semantics—not merely to avoid
writing markup. Every new component must support keyboard use, narrow screens
and both LTR and RTL document directions.
