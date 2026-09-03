import {
  SUPPORTED_LOCALES,
  buildLanguageAlternates,
  localizePathname,
} from '@luminol/localization';
import type { MetadataRoute } from 'next';

import { isPublicProgrammeSlug } from '../lib/programme-detail';
import { getPublicProgrammes } from '../lib/sanity';
import { resolvePublicSiteOrigin } from '../lib/site-url';

const routes = [
  '',
  '/programmes',
  '/consultations',
  '/about',
  '/contact',
  '/schools/psychology',
  '/schools/languages',
  '/schools/training',
] as const;

function buildAbsoluteLanguageAlternates(origin: string, pathname: string) {
  return Object.fromEntries(
    Object.entries(buildLanguageAlternates(pathname)).map(
      ([language, localizedPathname]) => [
        language,
        `${origin}${localizedPathname}`,
      ],
    ),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = resolvePublicSiteOrigin();
  const staticEntries = SUPPORTED_LOCALES.flatMap((locale) =>
    routes.map((route) => {
      const pathname = route === '' ? '/' : route;

      return {
        url: `${origin}${localizePathname(locale, pathname)}`,
        alternates: {
          languages: buildAbsoluteLanguageAlternates(origin, pathname),
        },
        changeFrequency:
          route === '' ? ('weekly' as const) : ('monthly' as const),
        priority:
          route === ''
            ? 1
            : route === '/consultations' || route.startsWith('/schools/')
              ? 0.8
              : 0.7,
      };
    }),
  );

  const programmes = await getPublicProgrammes();
  if (!programmes) return staticEntries;

  const seenSlugs = new Set<string>();
  const programmePaths = programmes.flatMap((programme) => {
    const slug = programme.slug.current.trim().toLowerCase();
    if (!isPublicProgrammeSlug(slug) || seenSlugs.has(slug)) return [];
    seenSlugs.add(slug);
    return [`/programmes/${slug}`];
  });

  const programmeEntries = SUPPORTED_LOCALES.flatMap((locale) =>
    programmePaths.map((pathname) => ({
      url: `${origin}${localizePathname(locale, pathname)}`,
      alternates: {
        languages: buildAbsoluteLanguageAlternates(origin, pathname),
      },
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  );

  return [...staticEntries, ...programmeEntries];
}
