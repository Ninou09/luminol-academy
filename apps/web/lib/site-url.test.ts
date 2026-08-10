import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FALLBACK_PUBLIC_SITE_URL,
  resolvePublicSiteOrigin,
  resolvePublicSiteUrl,
} from './site-url';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('public site URL resolution', () => {
  it('preserves a configured metadata base while exposing its origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example.com/base/');

    expect(resolvePublicSiteUrl().toString()).toBe(
      'https://academy.example.com/base/',
    );
    expect(resolvePublicSiteOrigin()).toBe('https://academy.example.com');
  });

  it('falls back safely when the configured URL is malformed', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'not a url');

    expect(resolvePublicSiteUrl().toString()).toBe(
      `${FALLBACK_PUBLIC_SITE_URL}/`,
    );
    expect(resolvePublicSiteOrigin()).toBe(FALLBACK_PUBLIC_SITE_URL);
  });
});
