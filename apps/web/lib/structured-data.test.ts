import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildOrganizationJsonLd,
  serializeJsonLd,
} from './structured-data';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Organization structured data', () => {
  it('uses only verified public organization fields and the configured origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(buildOrganizationJsonLd('Public description')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      '@id': 'https://academy.example.com/#organization',
      name: 'Luminol Academy',
      url: 'https://academy.example.com',
      description: 'Public description',
    });
  });

  it('uses the stable fallback origin when site configuration is malformed', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    expect(buildOrganizationJsonLd('Public description').url).toBe(
      'https://luminol-academy-web.vercel.app',
    );
  });

  it('escapes raw angle-bracket openings during JSON-LD serialization', () => {
    const serialized = serializeJsonLd({ description: '<script>alert(1)</script>' });

    expect(serialized).not.toContain('<');
    expect(serialized).toContain('\\u003cscript>');
  });
});
