import type { MetadataRoute } from 'next';

import { resolvePublicSiteOrigin } from '../lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${resolvePublicSiteOrigin()}/sitemap.xml`,
  };
}
