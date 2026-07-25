import { z } from 'zod';
import type { SchoolSlug } from './schools';

const SANITY_API_VERSION = '2024-01-01';
const placeholderProjectIds = new Set([
  'example',
  'placeholder',
  'replace-me',
]);

const cmsProgrammeSchema = z.object({
  _id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(320),
  slug: z.object({ current: z.string().min(1) }).nullish(),
  delivery: z.string().trim().max(80).nullish(),
  featured: z.boolean().default(false),
});

const cmsProgrammeListSchema = z.array(cmsProgrammeSchema).max(100);

export type CmsProgramme = z.infer<typeof cmsProgrammeSchema>;

type SanityConfig = {
  projectId: string;
  dataset: string;
};

export function getSanityConfig(): SanityConfig | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';

  if (
    !projectId ||
    placeholderProjectIds.has(projectId) ||
    !/^[a-z0-9]+$/.test(projectId) ||
    !/^[a-zA-Z0-9_-]+$/.test(dataset)
  ) {
    return null;
  }

  return { projectId, dataset };
}

export async function getProgrammesForSchool(
  school: SchoolSlug,
): Promise<CmsProgramme[] | null> {
  const config = getSanityConfig();
  if (!config) return null;

  const query = `*[
    _type == "programme" &&
    school == $school &&
    active == true
  ] | order(order asc, title asc) {
    _id,
    title,
    summary,
    slug,
    delivery,
    "featured": coalesce(featured, false)
  }`;

  const endpoint = new URL(
    `https://${config.projectId}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${config.dataset}`,
  );
  endpoint.searchParams.set('query', query);
  endpoint.searchParams.set('$school', JSON.stringify(school));

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    const result = z.object({ result: z.unknown() }).safeParse(payload);
    if (!result.success) return null;

    const programmes = cmsProgrammeListSchema.safeParse(result.data.result);
    return programmes.success ? programmes.data : null;
  } catch {
    return null;
  }
}
