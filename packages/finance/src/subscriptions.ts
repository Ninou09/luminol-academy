import { z } from 'zod';

import { billingIntervalSchema } from './pricing';

export const subscriptionStatusSchema = z.enum([
  'trialing',
  'active',
  'past_due',
  'paused',
  'cancelled',
  'expired',
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const subscriptionSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  priceId: z.string().min(1),
  billingInterval: billingIntervalSchema.exclude(['one_time']),
  status: subscriptionStatusSchema,
  currentPeriodStart: z.coerce.date(),
  currentPeriodEnd: z.coerce.date(),
  cancelAtPeriodEnd: z.boolean().default(false),
  cancelledAt: z.coerce.date().optional(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

const allowedSubscriptionTransitions: Record<
  SubscriptionStatus,
  readonly SubscriptionStatus[]
> = {
  trialing: ['active', 'cancelled', 'expired'],
  active: ['past_due', 'paused', 'cancelled', 'expired'],
  past_due: ['active', 'paused', 'cancelled', 'expired'],
  paused: ['active', 'cancelled', 'expired'],
  cancelled: [],
  expired: [],
};

export function canTransitionSubscriptionStatus(
  from: SubscriptionStatus,
  to: SubscriptionStatus,
): boolean {
  return allowedSubscriptionTransitions[from].includes(to);
}

export function validateSubscriptionPeriod(input: Subscription): Subscription {
  const subscription = subscriptionSchema.parse(input);
  if (subscription.currentPeriodEnd <= subscription.currentPeriodStart) {
    throw new Error('Subscription period end must be after its start');
  }
  if (
    subscription.status === 'cancelled' &&
    subscription.cancelledAt === undefined
  ) {
    throw new Error('Cancelled subscriptions require a cancellation timestamp');
  }
  return subscription;
}

export function scheduleSubscriptionCancellation(
  input: Subscription,
  cancelledAt: Date = new Date(),
): Subscription {
  const subscription = validateSubscriptionPeriod(input);
  if (
    subscription.status === 'cancelled' ||
    subscription.status === 'expired'
  ) {
    throw new Error(
      'Terminal subscriptions cannot be scheduled for cancellation',
    );
  }

  return subscriptionSchema.parse({
    ...subscription,
    cancelAtPeriodEnd: true,
    cancelledAt,
  });
}
