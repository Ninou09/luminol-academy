# Luminol Arabic Flagship — Creative and Motion Direction

## 1. Creative direction and visuals

### Art direction
The public experience should feel like a contemporary educational institution with the confidence of a cultural brand: editorial, human, cinematic and unmistakably Luminol. The interface stays Arabic-first and RTL, with strong institutional structure inspired by leading school-system websites while avoiding literal copying.

The visual system uses Luminol navy and cyan as the institutional core, warm gold for emphasis, clean white space, large human photography, thin structural rules and controlled depth. Photography is treated as evidence of learning and human interaction, not decoration.

### Typography
- Arabic UI/body: system-safe Arabic-capable stack already used by the application, with large weights and generous line height.
- Latin support: clean sans-serif fallback for the English brand lockup and metadata.
- Headline behavior: large Arabic display scale, short lines, strong rhythm and kinetic line-by-line reveals rather than decorative display fonts that could compromise Arabic rendering.

### Imagery
Photography should show believable adult learning, conversation, mentorship and professional development. Temporary stock imagery must stay visibly credited and must never be represented as real Luminol photography.

Current replacement image direction:
- Hero: adult learners in an active course/workshop, wide composition with room for Arabic copy.
- Psychology: thoughtful two-person support conversation, natural light, calm neutral environment.
- Languages: adult learners speaking and collaborating in a modern classroom.
- Professional training: diverse adults watching or participating in a presentation/workshop.
- Learning story: one-to-one tutoring/mentoring with real study materials and human interaction.

Future authentic photography prompts:
- `Wide documentary photograph inside Luminol Academy, Blida, Algeria; adult learners in a bright modern classroom, instructor facilitating discussion, candid expressions, premium editorial education photography, natural daylight, navy and warm neutral accents, realistic skin tones, no staged stock-photo poses, 16:9.`
- `Luminol psychology workshop, respectful non-clinical educational setting, facilitator listening to an adult participant, calm natural light, private and human atmosphere, documentary editorial photography, no medical props, no exaggerated emotion.`
- `Luminol language class in active conversation, small group of adult learners, visible notebooks and teaching material, energetic but sophisticated, real classroom, editorial photography, natural movement.`
- `Luminol professional training workshop, adults collaborating around a table and presentation screen, leadership and practical learning, premium corporate editorial photography, candid, modern.`

### Abstract/3D layer
Do not replace human photography with generic 3D renders. Use abstract motion only as a supporting layer: soft cyan/gold light fields, thin orbital lines, depth grids and responsive highlights that react to scroll/pointer movement.

## 2. Page architecture and psychological goal

### Homepage
1. **Utility + institutional header** — instant orientation and trust.
2. **Cinematic hero** — communicate the three-part value proposition in under five seconds; primary goal is emotional confidence and immediate comprehension.
3. **Quick access rail** — reduce decision friction and give visitors direct routes to registration or one of the three schools.
4. **Connected-academy story** — explain why psychology, language and professional development belong under one brand.
5. **Three-school discovery** — let visitors self-identify with a branch through people, language and visual personality.
6. **Trust principles** — replace unverifiable metrics with credible operating principles.
7. **Learning journey** — make the next step feel simple, finite and low-risk.
8. **Governed people/testimonials** — social proof appears only when approved CMS records exist.
9. **Strong final conversion** — one clear invitation to contact the academy.

### School pages
1. Branch-specific cinematic hero.
2. Outcome framing: what the learner should gain.
3. Programme discovery fed by Sanity with safe fallbacks.
4. Method/approach scrollytelling.
5. Audience and expertise signals.
6. FAQ and safety/expectation notes.
7. Conversion CTA connected to the working enquiry flow.

### About
Institutional story, connected-school model, values and learning philosophy. Psychological goal: convert design quality into organizational credibility.

### Contact
Keep the working enquiry form primary. Use clear paths and calm context around it. Psychological goal: make contacting Luminol feel easy, safe and specific rather than like a generic lead form.

## 3. High-impact motion and UX

### Motion language
Motion should feel expensive because it is coordinated, not because everything moves. Use a hierarchy:
- global scroll progress and sticky-header compression;
- slow photographic parallax;
- staggered hero typography;
- depth-aware hover/tilt on high-value cards;
- magnetic CTA movement on fine pointers;
- cursor halo that expands over interactive controls;
- radial light response tied to pointer position;
- directional reveal choreography for major sections;
- image zoom and crop drift on hover/scroll;
- subtle animated sheen in dark trust sections.

### Trigger events
- **Scroll:** hero image drifts at a slower rate than content; section media receives bounded parallax; reveal groups enter with directional blur/clip transitions; the header progress line fills.
- **Pointer move:** hero light field and image shift subtly; cards tilt a few degrees and receive a local highlight; CTAs move magnetically by only a few pixels.
- **Hover:** school photography zooms and shifts; arrows translate; borders/light fields respond; cursor halo expands.
- **Click/tap:** keep navigation immediate. Do not delay route changes for decorative animation.

### Scroll-jacking decision
Do **not** hijack native scrolling. Full scroll-jacking creates accessibility, mobile and performance problems and can make an education website harder to use. The premium alternative is cinematic scrollytelling layered on top of native scrolling, with the same visual impact and much better usability.

### Accessibility/performance rules
- `prefers-reduced-motion: reduce` removes parallax, cursor halo, magnetic motion, tilt and long transitions.
- Pointer-only effects are disabled on coarse/touch pointers.
- Motion is driven through `requestAnimationFrame` and passive scroll listeners.
- Transform/opacity are preferred over layout-changing properties.
- No animation may block navigation or form submission.

## 4. Technical stack recommendation

Keep the existing production stack instead of introducing a new animation framework just for spectacle:
- **Next.js 16 / React** — existing routing, metadata, server rendering and integrations.
- **CSS + logical properties** — Arabic/RTL-first layout, responsive visual system, gradients, 3D perspective and progressive-enhancement motion.
- **IntersectionObserver** — section reveal orchestration.
- **requestAnimationFrame + Pointer Events** — bounded parallax, cursor halo, magnetic CTAs and card tilt.
- **Next Image** — optimized remote editorial photography from governed hosts.
- **Sanity** — programme imagery/content and governed public records.
- **Playwright + Vitest** — regression coverage for RTL, routes, forms and motion fallbacks.

GSAP/Framer Motion/Three.js should only be introduced later for a clearly justified interaction that cannot be achieved cleanly with the existing lightweight motion layer. WebGL should not become a requirement for core navigation or content.

## Production gate
Before merge: exact-head Vercel preview, repository-wide CI, desktop/mobile visual QA, reduced-motion QA, keyboard QA and independent PR review must all be green.