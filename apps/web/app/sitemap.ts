import {
  SUPPORTED_LOCALES,
  localizePathname,
} from '@luminol/localization';
import type { MetadataRoute } from 'next';

const routes = [
  '',
  '/programmes',
  '/about',
  '/contact',
  '/schools/psychology',
  '/schools/languages',
  '/schools/training',
] as const;
const fallbackSiteUrl = 'https://luminol-academy-web.vercel.app';

function resolveSiteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configured || fallbackSiteUrl).origin;
  } catch {
    return fallbackSiteUrl;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = resolveSiteOrigin();

  return SUPPORTED_LOCALES.flatMap((locale) =>
    routes.map((route) => {
      const pathname = route === '' ? '/' : route;

      return {
        url: `${origin}${localizePathname(locale, pathname)}`,
        changeFrequency:
          route === '' ? ('weekly' as const) : ('monthly' as const),
        priority: route === '' ? 1 : route.startsWith('/schools/') ? 0.8 : 0.7,
      };
    }),
  );
}
