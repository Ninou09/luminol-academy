import { describe, expect, it } from 'vitest';
import { privateCacheHeaders, securityHeaders } from './security-headers.mjs';

describe('production web hardening', () => {
  it('sets critical browser protections and a restrictive CSP', () => {
    const headers = new Map(
      securityHeaders.map(({ key, value }) => [key, value]),
    );
    expect(headers.get('Content-Security-Policy')).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers.get('Content-Security-Policy')).toContain(
      "object-src 'none'",
    );
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('prevents shared caches from retaining authenticated pages', () => {
    expect(privateCacheHeaders).toContainEqual({
      key: 'Cache-Control',
      value: 'private, no-store, max-age=0',
    });
  });
});
