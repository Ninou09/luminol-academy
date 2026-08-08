# Luminol design system

The Luminol design system supports a premium public academy, learner portal,
administration interface and future Arabic experience without coupling those
products together.

## Brand idea

**Human potential, illuminated.**

Luminol is intellectual without feeling cold, premium without becoming
exclusive and structured without losing humanity. The master brand connects
three distinct schools:

- Psychology — calm intelligence
- Languages — confident connection
- Professional Training — applied ambition

## Colour system

Use the shared semantic tokens from `@luminol/config/tokens.css`.

### Master brand

- **Ink** — primary text, navigation, institutional sections and high-contrast
  surfaces.
- **Gold** — emphasis, selection, signature detail and high-value calls to
  action.
- **Canvas** — the default editorial background.
- **Surface** — cards, forms and content groupings.
- **Muted** — secondary copy only; never use it where contrast becomes weak.
- **Line** — restrained separators and grid structure.

### School accents

School colour never replaces the master brand. It identifies context and
focuses attention.

- **Psychology:** use the psychology token for calm, supportive emphasis.
- **Languages:** use the languages token for energetic, social emphasis.
- **Professional Training:** use the training token for ambitious, practical
  emphasis.

Do not introduce decorative gradients without a content purpose. Gradients are
limited to atmospheric hero lighting and dark institutional sections.

## Typography

- **Display:** Cormorant Garamond for major editorial headings.
- **Latin interface/body:** Manrope.
- **Arabic:** IBM Plex Sans Arabic with Noto Sans Arabic fallback.
- Major headings use disciplined line lengths of approximately 9–14 characters
  per line at large sizes.
- Body copy should normally be 16–19px with a line height between 1.65 and 1.8.
- Utility labels should not render below 11px.

Arabic documents set `lang="ar"` and `dir="rtl"` at the document boundary.
Components use logical properties so spacing, borders and directional controls
mirror correctly. Arabic copy must be written or reviewed as Arabic content,
not produced as an unapproved literal translation.

## Spacing and grid

The flagship website uses:

- Page gutter: `clamp(1.1rem, 4vw, 4.5rem)`
- Section rhythm: `clamp(5.5rem, 9vw, 9rem)`
- Editorial maximum width: `92rem`
- Desktop: 12-column thinking expressed through two- and three-column layouts
- Tablet: deliberate two-column collapse
- Mobile: one-column composition with reordered emphasis, not merely smaller
  desktop cards

Whitespace must separate ideas, not create empty spectacle.

## Shape and depth

- Small radius: 0.65rem
- Medium radius: 1.1rem
- Large editorial image radius: 1.6rem
- Pill radius is reserved for primary actions and compact tags.
- Avoid stacking rounded cards inside rounded cards.
- Shadows are used for floating conversion or media elements only.
- Most content hierarchy should come from typography, spacing and rules.

## Buttons and links

- Primary button: ink or school accent depending on context.
- Secondary button: transparent with a clear border.
- Text link: specific action language plus a restrained directional arrow.
- Avoid generic “Learn more” labels.
- Minimum interactive target: 44px.
- Every interactive element needs a visible `:focus-visible` state.

## Cards

Use three families:

1. **Editorial branch card** — purposeful image, school accent rule and one
   specific action.
2. **Programme row/card** — programme title, concise benefit, optional approved
   CMS image, delivery information and enquiry action.
3. **Utility card** — compact, border-led and free from decorative shadows.

Cards must not contain invented dates, claims, results, instructor identities or
testimonials.

## Forms

- Labels remain visible above controls.
- Inputs use a calm surface, clear border and strong focus ring.
- Error and success messages use live regions.
- The public enquiry form does not request unnecessary sensitive information.
- Consent remains explicit and required.
- Form logic, validation and backend behaviour are preserved during visual
  redesigns.

## Photography

Photography is editorial evidence, not decoration.

- Founder portrait: About and selected Psychology sections only after approval.
- Psychology: attentive, warm support conversations; avoid clinical coldness
  and meditation clichés.
- Languages: social communication and adult learning; avoid flags and textbook
  clichés.
- Professional Training: active collaboration and facilitation; avoid staged
  handshakes and empty boardrooms.
- Events: approved real posters and event photographs.
- Certificates/materials: credibility and detail sections.
- Group photographs: use only with publication permission.

Temporary licensed Unsplash photography is documented in
`docs/public-site-redesign.md` and should be replaced with authentic Luminol
assets as they become available.

## Image ratios

- Hero/editorial image: approximately 4:5 or responsive cinematic crop.
- Branch card: 16:10 to 4:3.
- Programme image: 16:9.
- Team portrait: 4:5.
- Use `next/image`, meaningful alt text, stable dimensions and purpose-specific
  crops.

## Motion principles

- Motion supports orientation and hierarchy.
- Standard reveal: 460ms with 18px or less travel.
- Stagger: 55–80ms.
- Image hover: maximum 1.8% scale.
- No permanent floating cards, rapid parallax or decorative motion loops.
- The experience must remain complete without JavaScript animation.
- `prefers-reduced-motion` disables movement and preserves content visibility.

## Icon style

Prefer typographic arrows, simple geometric marks and meaningful line symbols.
Do not introduce mixed icon packs or novelty illustrations.

## CMS and proof governance

The website displays:

- Programmes only when active, otherwise reviewed fallback programme copy.
- Team members only when active with approved public details.
- Testimonials only when active and `consentConfirmed` is true.
- No generic statistics or unverified superlatives.

## Application setup

Import shared tokens immediately after Tailwind:

```css
@import 'tailwindcss';
@import '@luminol/config/tokens.css';
```

Use logical properties such as `padding-inline`, `inset-inline-start` and
`border-inline-start`. Do not hard-code left/right behavior for shared
components.

## Reusable components

`@luminol/ui` provides buttons, containers, cards, badges and the text wordmark.
The public website adds:

- `SiteHeader` and `SiteFooter`
- `EditorialImage`
- shared flagship page composition in `app/flagship.module.css`
- governed Sanity readers for programmes, team members and testimonials

Add components for repeated behavior or semantics, not simply to reduce markup.
Every new component must support keyboard navigation, narrow screens and both
LTR and RTL document directions.
