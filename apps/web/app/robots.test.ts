import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from './robots';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('robots metadata', () => {
  it('publishes the host and sitemap using the configured public origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: '/api/' },
      sitemap: 'https://academy.example.com/sitemap.xml',
      host: 'https://academy.example.com',
    });
  });

  it('uses the stable fallback origin for malformed configuration', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/', disallow: '/api/' },
      sitemap: 'https://luminol-academy-web.vercel.app/sitemap.xml',
      host: 'https://luminol-academy-web.vercel.app',
    });
  });
});
