# Luminol CMS operations

Sanity Studio is Luminol's governed editorial workspace. It manages programme,
site, team and approved testimonial content without coupling the public website
to Studio availability.

## Content types

### Programme

Programmes belong to one of the three stable school values:

- `psychology`
- `languages`
- `training`

The public website reads only documents where `active` is true. Title, slug,
school and summary are required. Display order controls the sequence within a
school page. Images require meaningful alternative text.

When a programme image is present, the public website accepts only the
published `https://cdn.sanity.io` asset URL together with its approved
alternative text, source dimensions, crop and hotspot. The card image URL is
generated at a stable 16:9 size while preserving the editor-selected crop and
keeping the selected hotspot in frame. A programme without an image keeps the
reviewed text-only card layout. Missing alternative text, a non-Sanity image
host, invalid framing metadata or malformed CMS data causes the complete
external programme response to fail closed and the school page to use its
reviewed fallback programmes.

### Site Settings

Stores institutional mission, vision and internal enquiry-response guidance.
Keep one canonical settings document.

### Team Member

Stores approved names, roles, biographies and portraits. A portrait must have
alternative text and the document must be active before it is eligible for
public use.

### Testimonial

Testimonials require explicit written publication consent. Studio prevents
publication-ready testimonial data from validating until
`consentConfirmed` is true. Never create synthetic quotes or publish private
client information.

## Environment setup

The public website reads published content with:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
```

Studio uses:

```text
SANITY_STUDIO_PROJECT_ID
SANITY_STUDIO_DATASET
```

Set real values in the deployment environment. Keep tokens and secrets outside
the repository. Public programme reads do not require `SANITY_API_TOKEN`.

Add each deployed website and Studio origin to the Sanity project's approved
CORS origins. Enable credentials only for Studio origins that require an
authenticated session.

## Publishing workflow

1. Create or update the document in Studio.
2. Confirm the school, public summary, ordering and delivery format.
3. Check image purpose, permission and meaningful alternative text.
4. Adjust the image crop and hotspot so the important subject remains visible
   in the programme card's 16:9 frame.
5. Review all claims, names and consent-sensitive information.
6. Set `active` to true only when the content is ready.
7. Publish the document.
8. Verify the matching school page after the website cache refreshes.
9. For an image-bearing programme, confirm the rendered asset comes from
   `cdn.sanity.io`, reflects the approved crop and hotspot, and uses the
   approved alternative text.

The public website revalidates CMS programme data every five minutes.

## Availability and validation

CMS responses are validated before use. If Sanity is unconfigured, unavailable
or returns content that does not match the public contract, the school pages
use their reviewed typed fallback programmes. This keeps the website available
without silently rendering malformed external data.

Schema changes must remain backward-compatible with published documents or
include a documented content migration.
