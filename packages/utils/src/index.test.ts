import { describe, expect, it } from 'vitest';
import {
  directionFor,
  joinClassNames,
  redactSensitive,
  safeInternalRedirect,
} from './index';
describe('utilities', () => {
  it('selects RTL for Arabic', () => expect(directionFor('ar')).toBe('rtl'));
  it('joins truthy classes', () =>
    expect(joinClassNames('a', false, 'b')).toBe('a b'));
  it('redacts nested sensitive fields without changing safe metadata', () => {
    expect(
      redactSensitive({ event: 'failed', providerPayload: { token: 'x' } }),
    ).toEqual({ event: 'failed', providerPayload: '[REDACTED]' });
  });
  it('accepts only same-origin relative redirects', () => {
    expect(safeInternalRedirect('/account?tab=profile')).toBe(
      '/account?tab=profile',
    );
    expect(safeInternalRedirect('//evil.example')).toBe('/');
    expect(safeInternalRedirect('https://evil.example')).toBe('/');
    expect(safeInternalRedirect('/\\evil.example')).toBe('/');
  });
});
