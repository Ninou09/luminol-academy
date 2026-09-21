# Cinematic public-site media

## Current film direction

The user requested removal of the decorative 3D model and replacement of the
forest video and previous photographs. The uploaded 11:30 reference was reviewed
at 30-second intervals, with closer frame sequences around 05:15–05:45 and
07:50–08:20. Its relevant ideas are large moving visual subjects, bold type,
restrained navigation and staged transitions. The academy translates those ideas
into a full-width learning film, phrase-level title masks, native-scroll framing,
and alternating large photographs. The rejected sculpture is removed.

The logo remains the original supplied artwork. Arabic, French and English
content, attendance-certificate wording and public routes remain unchanged.

## Media provenance

All new media is illustrative stock, not Luminol premises, staff or participants.
Source links and licenses remain in the rendered markup and visible credits.

| Local asset                                         | Source                                                                                       | Creator / license                                | Crop                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------- |
| `editorial/academy-film.mp4`, `academy-poster.webp` | https://mixkit.co/free-stock-video/a-hand-runs-through-the-book-spines-in-the-library-50726/ | Mixkit Stock Video Free License                  | Centered 16:9                |
| Second shot in the film                             | https://mixkit.co/free-stock-video/reverse-tour-of-a-library-full-of-books-21595/            | Mixkit Stock Video Free License                  | Centered 16:9                |
| `editorial/conversation.jpg`                        | https://unsplash.com/photos/LQ1t-8Ms5PY                                                      | Christina @ wocintechchat.com / Unsplash License | Centered, keep both speakers |
| `editorial/students.jpg`                            | https://unsplash.com/photos/omeaHbEFlN4                                                      | Alexis Brown / Unsplash License                  | Centered, books and students |
| `editorial/team.jpg`                                | https://unsplash.com/photos/vdXMSiX-n6M                                                      | Mimi Thian / Unsplash License                    | Centered, preserve group     |

Both exact Mixkit asset pages state free commercial/personal use. The 16-second
film combines excerpts with a one-second dissolve, H.264 1280×720 at 24fps,
without audio, faststart enabled, approximately 1.7 MB. A local WebP poster is
served first. Reduced-motion or Save-Data visitors never load the film.
Playback pauses offscreen and resumes on return, while respecting manual pause.
The new photographs are locally hosted and optimized by Next Image.

MotionSites reference supplied by the user:
https://motionsites.ai/?prompt=future-machine . Use only publicly available/free
material; do not import paid assets or add an account requirement to Luminol.

## Verification and rollback

Keep regression coverage for video recovery, dynamic reduced motion, source
metadata, Arabic mobile/desktop navigation, and the sticky-header anchor offset.
Run lint, typecheck, unit tests, build and CI browser tests before merge. Visually
review the actual preview. Deploy with the existing GitHub/Vercel integration.
Rollback by reverting this scoped change; there are no data migrations.
