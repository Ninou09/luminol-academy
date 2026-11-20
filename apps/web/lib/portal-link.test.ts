import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPortalHref } from './portal-link';

describe('getPortalHref', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('opens the deployed learner portal in the visitor language', () => {
    expect(getPortalHref('ar')).toBe(
      'https://luminol-academy-portal.vercel.app/ar',
    );
  });

  it('uses the configured portal origin and ignores invalid values', () => {
    vi.stubEnv('NEXT_PUBLIC_PORTAL_URL', 'https://my.luminol.dz/whatever');
    expect(getPortalHref('fr')).toBe('https://my.luminol.dz/fr');
    vi.stubEnv('NEXT_PUBLIC_PORTAL_URL', 'not a url');
    expect(getPortalHref('en')).toBe(
      'https://luminol-academy-portal.vercel.app/en',
    );
  });
});
