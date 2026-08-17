import { z } from 'zod';

import { getSanityConfig } from './sanity';

const SANITY_API_VERSION = '2024-01-01';
const programmeLanguageSchema = z.enum(['ar', 'fr', 'en']);
const schoolSlugSchema = z.enum(['psychology', 'languages', 'training']);
const fractionSchema = z.number().finite().min(0).max(1);

const programmeImageSchema = z.object({
  url: z
    .string()
    .trim()
    .url()
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && url.hostname === 'cdn.sanity.io';
      } catch {
        return false;
      }
    }, 'Programme images must use Sanity CDN.'),
  alt: z.string().trim().min(3).max(180),
  crop: z
    .object({
      top: fractionSchema,
      bottom: fractionSchema,
      left: fractionSchema,
      right: fractionSchema,
    })
    .nullish(),
  hotspot: z
    .object({
      x: fractionSchema,
      y: fractionSchema,
      width: z.number().finite().nonnegative().max(1),
      height: z.number().finite().nonnegative().max(1),
    })
    .nullish(),
  dimensions: z.object({
    width: z.number().int().positive().max(100_000),
    height: z.number().int().positive().max(100_000),
  }),
});

const publicProgrammeDetailSchema = z.object({
  _id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(320),
  slug: z.object({ current: z.string().trim().min(1).max(96) }),
  school: schoolSlugSchema,
  languages: z.array(programmeLanguageSchema).max(3).default([]),
  delivery: z.string().trim().max(80).nullish(),
  featured: z.boolean().default(false),
  image: programmeImageSchema.nullish(),
  bodyText: z.string().trim().max(20_000).default(''),
  outcomes: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  audience: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
});

export type PublicProgrammeDetail = z.infer<typeof publicProgrammeDetailSchema>;

const safeSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isPublicProgrammeSlug(slug: string): boolean {
  const normalizedSlug = slug.trim().toLowerCase();
  return (
    normalizedSlug.length > 0 &&
    normalizedSlug.length <= 96 &&
    safeSlugPattern.test(normalizedSlug)
  );
}

export async function getPublicProgrammeBySlug(
  slug: string,
): Promise<PublicProgrammeDetail | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!isPublicProgrammeSlug(normalizedSlug)) return null;

  const config = getSanityConfig();
  if (!config) return null;

  const query = `*[
    _type == "programme" &&
    active == true &&
    !(_id in path("drafts.**")) &&
    slug.current == $slug
  ][0] {
    _id,
    title,
    summary,
    slug,
    school,
    "languages": coalesce(languages, []),
    delivery,
    "featured": coalesce(featured, false),
    "bodyText": coalesce(pt::text(body), ""),
    "outcomes": coalesce(outcomes, []),
    "audience": coalesce(audience, []),
    "image": select(
      defined(image.asset) &&
      coalesce(image.publicationApproved, false) == true => {
        "url": image.asset->url,
        "alt": image.alt,
        "crop": image.crop,
        "hotspot": image.hotspot,
        "dimensions": image.asset->metadata.dimensions
      },
      null
    )
  }`;

  const endpoint = new URL(
    `https://${config.projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${config.dataset}`,
  );
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('$slug', JSON.stringify(normalizedSlug));

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const envelope = z.object({ result: z.unknown() }).safeParse(payload);
    if (!envelope.success || envelope.data.result === null) return null;

    const programme = publicProgrammeDetailSchema.safeParse(
      envelope.data.result,
    );
    return programme.success ? programme.data : null;
  } catch {
    return null;
  }
}
