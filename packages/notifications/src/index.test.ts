import { describe, expect, it } from 'vitest';
import { isQuietTime, retryDelayMs, shouldDeliver } from './index';
describe('notification policy', () => {
  it('never suppresses mandatory transactional messages', () =>
    expect(shouldDeliver('transactional', false)).toBe(true));
  it('honours marketing opt-out', () =>
    expect(shouldDeliver('marketing', false)).toBe(false));
  it('handles overnight quiet time in the configured timezone', () =>
    expect(
      isQuietTime(new Date('2026-08-02T22:30:00Z'), 'UTC', 22 * 60, 7 * 60),
    ).toBe(true));
  it('bounds retries and terminates', () => {
    expect(retryDelayMs(1)).toBe(30_000);
    expect(retryDelayMs(5)).toBeNull();
  });
});
