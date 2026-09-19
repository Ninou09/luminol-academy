# Cinematic public-site media

The public website uses locally optimized media sourced from Pexels under the
[Pexels license](https://www.pexels.com/license/).

| Asset                                   | Creator        | Source                                                                | Local use                          |
| --------------------------------------- | -------------- | --------------------------------------------------------------------- | ---------------------------------- |
| Sunlight through trees video and poster | Martina Tomšič | https://www.pexels.com/video/a-sunlight-shines-through-trees-4867892/ | Homepage hero and Training imagery |
| Bookshelves photograph                  | Pixabay        | https://www.pexels.com/photo/159711/                                  | Languages imagery                  |
| Collaboration photograph                | fauxels        | https://www.pexels.com/photo/3184306/                                 | Psychology and About imagery       |

The hero serves a WebP poster immediately. The MP4 is attached only after
hydration, and is not loaded when the visitor requests reduced motion or has
data-saving enabled. It pauses when the tab or hero leaves view.

All media components retain source, license, crop, credit, and localized alt
metadata in the rendered markup. No founder portrait is rendered.

Manrope, Noto Sans Arabic, and Cormorant Garamond are self-hosted from the
Google Fonts repository. Their SIL Open Font License files are included beside
the fonts in `apps/web/app/fonts`, so builds do not require a Google Fonts request.
