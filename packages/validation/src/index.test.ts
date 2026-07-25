import { describe, expect, it } from 'vitest';
import { localeSchema } from './index';
describe('localeSchema', () => {
  it('accepts supported locales', () =>
    expect(localeSchema.parse('ar')).toBe('ar'));
  it('rejects unsupported locales', () =>
    expect(() => localeSchema.parse('de')).toThrow());
});
