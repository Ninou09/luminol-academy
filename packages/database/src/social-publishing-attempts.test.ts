import { describe, expect, test } from 'vitest';

import {
  buildSocialPublishingIdempotencyKey,
  socialPublishingRetryDelayMs,
} from './social-publishing-attempts';

const planIdentity = {
  actionId: 'content-calendar:v1:publish:item:r2',
  platform: 'INSTAGRAM' as const,
  accountRef: 'luminol-instagram',
  externalAccountId: 'ig-123',
  contentCalendarItemId: 'item',
  contentRevision: 2,
};

describe('social publishing attempt policy helpers', () => {
  test('builds stable bounded idempotency keys from the exact delivery identity', () => {
    const first = buildSocialPublishingIdempotencyKey(planIdentity);
    const second = buildSocialPublishingIdempotencyKey({ ...planIdentity });

    expect(first).toBe(second);
    expect(first).toMatch(/^social-publish:v1:[a-f0-9]{64}$/);
  });

  test('changes the idempotency key when the approved revision changes', () => {
    expect(buildSocialPublishingIdempotencyKey(planIdentity)).not.toBe(
      buildSocialPublishingIdempotencyKey({
        ...planIdentity,
        contentRevision: 3,
      }),
    );
  });

  test('uses a bounded retry schedule and then dead-letters', () => {
    expect(socialPublishingRetryDelayMs(1)).toBe(60_000);
    expect(socialPublishingRetryDelayMs(2)).toBe(5 * 60_000);
    expect(socialPublishingRetryDelayMs(3)).toBeNull();
    expect(socialPublishingRetryDelayMs(0)).toBeNull();
    expect(socialPublishingRetryDelayMs(1.5)).toBeNull();
  });
});
