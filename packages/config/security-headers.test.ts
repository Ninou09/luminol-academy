import { describe, expect, it } from 'vitest';
import {
  adminProtectedResponseSource,
  privateCacheHeaders,
} from './security-headers.mjs';

describe('protected response caching', () => {
  it('keeps protected pages private while excluding versioned static assets', () => {
    expect(adminProtectedResponseSource).toContain('_next/static');
    expect(adminProtectedResponseSource).toContain('_next/image');
    expect(privateCacheHeaders).toContainEqual({
      key: 'Cache-Control',
      value: 'private, no-store, max-age=0',
    });
  });
});
