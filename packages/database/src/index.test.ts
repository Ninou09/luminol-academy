import { describe, expect, it } from 'vitest';
import { resolveDatabaseUrl } from './index';

describe('database environment', () => {
  it('accepts an explicit PostgreSQL URL', () => {
    const url = 'postgresql://user:password@database.example/luminol';
    expect(resolveDatabaseUrl(url, 'production')).toBe(url);
  });

  it('uses the local database only outside production', () => {
    expect(resolveDatabaseUrl(undefined, 'development')).toContain(
      'localhost:5432/luminol',
    );
  });

  it('refuses to start production database access without a URL', () => {
    expect(() => resolveDatabaseUrl(undefined, 'production')).toThrow(
      'DATABASE_URL must be configured for production',
    );
  });
});
