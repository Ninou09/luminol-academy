import type { MetadataRoute } from 'next';

import { resolvePublicSiteOrigin } from '../lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const origin = resolvePublicSiteOrigin();

  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
