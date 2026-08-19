import { describe, expect, it } from 'vitest';

import { resolvePublicSiteOrigin } from '../lib/site-url';
import robots from './robots';

describe('robots metadata', () => {
  it('declares the public host and sitemap from the same canonical origin', () => {
    const origin = resolvePublicSiteOrigin();

    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: '/api/' },
      sitemap: `${origin}/sitemap.xml`,
      host: origin,
    });
  });
});
