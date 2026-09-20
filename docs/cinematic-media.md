# Cinematic public-site media

## Refinement

The header and footer display the user's original `1000077217.jpg` logo artwork.
The source is preserved as `luminol-logo-original.jpg`; CSS clips the phone UI
and isolates the emblem (x220, y700, width440, height490). The academy name remains
accessible HTML beside it. No generated or redrawn logo is substituted.

Languages now uses https://www.pexels.com/photo/1181533/ (Christina Morillo),
showing a whiteboard conversation. Training uses
https://www.pexels.com/photo/3183197/ (fauxels), showing team collaboration.
These are illustrative stock images, not photographs of academy staff.

The homepage adds a scroll-linked hero transform, staggered title entrance,
and card-image zoom. Scroll work is passive and requestAnimationFrame-throttled;
reduced-motion preferences disable these effects. Navigation is never scroll-jacked.

The public website uses locally optimized media sourced from Pexels under the
[Pexels license](https://www.pexels.com/license/).

| Asset                                   | Creator           | Source                                                                | Local use                    |
| --------------------------------------- | ----------------- | --------------------------------------------------------------------- | ---------------------------- |
| Sunlight through trees video and poster | Martina Tomšič    | https://www.pexels.com/video/a-sunlight-shines-through-trees-4867892/ | Homepage hero                |
| Whiteboard conversation                 | Christina Morillo | https://www.pexels.com/photo/1181533/                                 | Languages imagery            |
| Team workshop                           | fauxels           | https://www.pexels.com/photo/3183197/                                 | Training imagery             |
| Collaboration photograph                | fauxels           | https://www.pexels.com/photo/3184306/                                 | Psychology and About imagery |

The hero serves a WebP poster immediately. The MP4 is attached only after
hydration, and is not loaded when the visitor requests reduced motion or has
data-saving enabled. It pauses when the tab or hero leaves view.

All media components retain source, license, crop, credit, and localized alt
metadata in the rendered markup. No founder portrait is rendered.

Manrope, Noto Sans Arabic, and Cormorant Garamond are self-hosted from the
Google Fonts repository. Their SIL Open Font License files are included beside
the fonts in `apps/web/app/fonts`, so builds do not require a Google Fonts request.
