import { describe, expect, it } from 'vitest';

import {
  canTransitionSubscriptionStatus,
  scheduleSubscriptionCancellation,
  validateSubscriptionPeriod,
} from './subscriptions';

describe('subscription lifecycle', () => {
  const activeSubscription = {
    id: 'sub_1',
    customerId: 'customer_1',
    priceId: 'price_monthly_1',
    billingInterval: 'monthly' as const,
    status: 'active' as const,
    currentPeriodStart: new Date('2026-07-01T00:00:00.000Z'),
    currentPeriodEnd: new Date('2026-08-01T00:00:00.000Z'),
    cancelAtPeriodEnd: false,
  };

  it('allows recovery from past due and blocks terminal transitions', () => {
    expect(canTransitionSubscriptionStatus('past_due', 'active')).toBe(true);
    expect(canTransitionSubscriptionStatus('cancelled', 'active')).toBe(false);
    expect(canTransitionSubscriptionStatus('expired', 'active')).toBe(false);
  });

  it('validates billing periods', () => {
    expect(validateSubscriptionPeriod(activeSubscription)).toMatchObject({
      id: 'sub_1',
      status: 'active',
    });

    expect(() =>
      validateSubscriptionPeriod({
        ...activeSubscription,
        currentPeriodEnd: activeSubscription.currentPeriodStart,
      }),
    ).toThrow('Subscription period end must be after its start');
  });

  it('schedules cancellation without prematurely changing status', () => {
    const cancelledAt = new Date('2026-07-27T12:00:00.000Z');
    const scheduled = scheduleSubscriptionCancellation(
      activeSubscription,
      cancelledAt,
    );

    expect(scheduled).toMatchObject({
      status: 'active',
      cancelAtPeriodEnd: true,
      cancelledAt,
    });
  });

  it('requires a cancellation timestamp for cancelled subscriptions', () => {
    expect(() =>
      validateSubscriptionPeriod({
        ...activeSubscription,
        status: 'cancelled',
      }),
    ).toThrow('Cancelled subscriptions require a cancellation timestamp');
  });
});
