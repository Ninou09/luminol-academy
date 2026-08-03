import type { MetadataRoute } from 'next';

const routes = ['', '/about', '/contact'];
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
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
