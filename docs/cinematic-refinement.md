# Cinematic refinement — September 2026

## Direction

Evolve the existing Arabic-first academy, preserving the current content, routes,
CMS, attendance-certificate wording, photography provenance and founder-photo restriction.
Homepage mode: Persuade. Details and consultation forms stay readable and predictable.

Visual thesis: knowledge unfolding into light. An original CSS 3D sculpture of
layered pages gives Luminol an identifiable moment beside its video hero. Navy,
cyan, warm white, existing Arabic/Latin fonts and generous editorial rhythm stay.
Whole phrases animate together so Arabic shaping is preserved. Native scrolling,
keyboard links and reduced motion take precedence over decoration.

## Scope and observable outcomes

- Background video resumes on returning to the hero or visible tab. Explicit pause
  stays paused. Reduced motion and Save-Data keep a still poster, including changes
  during the session. No timer or forced retry defeats autoplay policy.
- Navigation to another page starts at the top; explicit section links still land
  at their sections. Browser back/forward and page reload follow the same top rule
  when there is no explicit fragment. No network refresh is required for this UX.
- Original supplied logo is displayed with sufficient source resolution and a
  controlled crop. The symbol remains the original artwork.
- Perspective layers respond to pointer/scroll only where appropriate; touch and
  reduced-motion views receive a static composition. No WebGL dependency, cursor
  replacement, scroll hijacking, fabricated proof, or extra analytics.

## Verification / release

Add regression coverage for playback recovery, manual pause, live preference
changes and Arabic navigation at mobile/desktop widths. Run the repository's lint,
typecheck, tests and build, then public browser smoke and a live visual pass.
Deploy via the existing repository/Vercel integration. Roll back by reverting this
scoped commit, with no data or credential migration.

Reference: https://www.youtube.com/watch?v=jMSzC8qLHD8 — page/title accessible, but
video playback was unavailable in the verification browser. No claim of reproducing
unseen frames or of a guaranteed commercial valuation.
