import {
  SUPPORTED_LOCALES,
  buildLanguageAlternates,
  localizePathname,
} from '@luminol/localization';
import type { MetadataRoute } from 'next';

import { journalArticles } from '../lib/journal';
import { isPublicProgrammeSlug } from '../lib/programme-detail';
import { publicSearch } from '../lib/public-seo';
import { getPublicProgrammes } from '../lib/sanity';
import { resolvePublicSiteOrigin } from '../lib/site-url';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = resolvePublicSiteOrigin();
  const entries = new Map<string, string | undefined>(
    Object.keys(publicSearch).map((path) => [path, undefined]),
  );
  for (const article of journalArticles) {
    if (!article.draft) {
      entries.set(
        `/journal/${article.slug}`,
        article.updatedAt ?? article.date,
      );
    }
  }
  for (const programme of (await getPublicProgrammes()) ?? []) {
    const slug = programme.slug.current.trim().toLowerCase();
    if (!isPublicProgrammeSlug(slug)) continue;
    const path = `/programmes/${slug}`;
    if (!entries.has(path)) entries.set(path, programme.updatedAt ?? undefined);
  }

  return Array.from(entries).flatMap(([path, changedAt]) => {
    const languages = Object.fromEntries(
      Object.entries(buildLanguageAlternates(path)).map(([language, href]) => [
        language,
        `${origin}${href}`,
      ]),
    );
    return SUPPORTED_LOCALES.map((locale) => ({
      url: `${origin}${localizePathname(locale, path)}`,
      alternates: { languages },
      ...(changedAt && Number.isFinite(Date.parse(changedAt))
        ? { lastModified: changedAt }
        : {}),
    }));
  });
}
