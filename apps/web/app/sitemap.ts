import type { MetadataRoute } from 'next';

const routes = ['', '/about', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://luminol.academy';
  return routes.map((route) => ({
    url: `${origin}${route}`,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
