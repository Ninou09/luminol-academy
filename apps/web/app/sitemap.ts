import type { MetadataRoute } from 'next';

const baseRoutes = [
  '',
  '/about',
  '/contact',
  '/schools/psychology',
  '/schools/languages',
  '/schools/training',
] as const;

const translatedRoutes = ['fr', 'en'].flatMap((locale) =>
  baseRoutes.map((route) => `/${locale}${route}`),
);

const routes = [...baseRoutes, ...translatedRoutes] as const;
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

  return routes.map((route) => ({
    url: `${origin}${route}`,
    changeFrequency: route === '' || route === '/fr' || route === '/en' ? 'weekly' : 'monthly',
    priority:
      route === '' || route === '/fr' || route === '/en'
        ? 1
        : route.includes('/schools/')
          ? 0.85
          : 0.7,
  }));
}
