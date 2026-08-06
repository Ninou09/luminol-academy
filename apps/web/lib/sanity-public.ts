import { z } from 'zod';
import type { SchoolSlug } from './schools';
import { getSanityConfig } from './sanity';

const SANITY_API_VERSION = '2024-01-01';

const approvedImageUrlSchema = z
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
  }, 'Public images must use the Sanity CDN.');

const portraitSchema = z.object({
  url: approvedImageUrlSchema,
  alt: z.string().trim().min(3).max(180),
});

const publicTeamMemberSchema = z.object({
  _id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  school: z.enum(['psychology', 'languages', 'training']).nullish(),
  bio: z.string().trim().max(1_200).nullish(),
  portrait: portraitSchema.nullish(),
});

const publicTestimonialSchema = z.object({
  _id: z.string().min(1),
  quote: z.string().trim().min(20).max(600),
  personName: z.string().trim().min(1).max(100),
  context: z.string().trim().max(140).nullish(),
  school: z.enum(['psychology', 'languages', 'training']),
});

export type PublicTeamMember = z.infer<typeof publicTeamMemberSchema>;
export type PublicTestimonial = z.infer<typeof publicTestimonialSchema>;

async function fetchSanityResult(
  query: string,
  parameters: Record<string, string> = {},
): Promise<unknown | null> {
  const config = getSanityConfig();
  if (!config) return null;

  const endpoint = new URL(
    `https://${config.projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${config.dataset}`,
  );
  endpoint.searchParams.set('query', query);
  for (const [key, value] of Object.entries(parameters)) {
    endpoint.searchParams.set(`$${key}`, JSON.stringify(value));
  }

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const parsed = z.object({ result: z.unknown() }).safeParse(payload);
    return parsed.success ? parsed.data.result : null;
  } catch {
    return null;
  }
}

export async function getPublicTeamMembers(
  school?: SchoolSlug,
): Promise<PublicTeamMember[] | null> {
  const schoolFilter = school ? '&& school == $school' : '';
  const query = `*[
    _type == "teamMember" &&
    active == true
    ${schoolFilter}
  ] | order(order asc, name asc) {
    _id,
    name,
    role,
    school,
    bio,
    "portrait": select(
      defined(portrait.asset) => {
        "url": portrait.asset->url,
        "alt": portrait.alt
      },
      null
    )
  }`;

  const result = await fetchSanityResult(
    query,
    school ? { school } : undefined,
  );
  const parsed = z.array(publicTeamMemberSchema).max(100).safeParse(result);
  return parsed.success ? parsed.data : null;
}

export async function getPublicTestimonials(
  school?: SchoolSlug,
): Promise<PublicTestimonial[] | null> {
  const schoolFilter = school ? '&& school == $school' : '';
  const query = `*[
    _type == "testimonial" &&
    active == true &&
    consentConfirmed == true
    ${schoolFilter}
  ] | order(_createdAt desc) {
    _id,
    quote,
    personName,
    context,
    school
  }`;

  const result = await fetchSanityResult(
    query,
    school ? { school } : undefined,
  );
  const parsed = z.array(publicTestimonialSchema).max(100).safeParse(result);
  return parsed.success ? parsed.data : null;
}
