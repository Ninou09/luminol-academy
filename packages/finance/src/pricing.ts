import { z } from 'zod';

import { currencyCodeSchema } from './currency';

export const billingIntervalSchema = z.enum([
  'one_time',
  'monthly',
  'quarterly',
  'yearly',
]);
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

export const priceSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  amountMinor: z.number().int().nonnegative(),
  currency: currencyCodeSchema,
  billingInterval: billingIntervalSchema,
  active: z.boolean().default(true),
});
export type Price = z.infer<typeof priceSchema>;

export const couponSchema = z
  .object({
    id: z.string().min(1),
    code: z
      .string()
      .trim()
      .min(1)
      .transform((value) => value.toUpperCase()),
    percentOff: z.number().int().min(1).max(100).optional(),
    amountOffMinor: z.number().int().positive().optional(),
    currency: currencyCodeSchema.optional(),
    maxRedemptions: z.number().int().positive().optional(),
    redeemedCount: z.number().int().nonnegative().default(0),
    active: z.boolean().default(true),
  })
  .superRefine((coupon, context) => {
    const discountKinds =
      Number(coupon.percentOff !== undefined) +
      Number(coupon.amountOffMinor !== undefined);
    if (discountKinds !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'Coupon must define exactly one discount type',
      });
    }

    if (coupon.amountOffMinor !== undefined && coupon.currency === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Fixed-amount coupons require a currency',
        path: ['currency'],
      });
    }
  });
export type Coupon = z.infer<typeof couponSchema>;

export function isCouponRedeemable(input: Coupon): boolean {
  const coupon = couponSchema.parse(input);
  return (
    coupon.active &&
    (coupon.maxRedemptions === undefined ||
      coupon.redeemedCount < coupon.maxRedemptions)
  );
}

export function applyCoupon(
  amountMinor: number,
  currency: string,
  input: Coupon,
): number {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new Error('Amount must be a non-negative integer in minor units');
  }

  const coupon = couponSchema.parse(input);
  const normalizedCurrency = currencyCodeSchema.parse(currency);

  if (!isCouponRedeemable(coupon)) {
    throw new Error('Coupon is not redeemable');
  }

  const discountMinor =
    coupon.percentOff !== undefined
      ? Math.round((amountMinor * coupon.percentOff) / 100)
      : coupon.currency === normalizedCurrency
        ? (coupon.amountOffMinor ?? 0)
        : (() => {
            throw new Error('Coupon currency does not match price currency');
          })();

  return Math.max(0, amountMinor - discountMinor);
}

export interface Installment {
  sequence: number;
  amountMinor: number;
}

export function buildInstallmentSchedule(
  totalMinor: number,
  installments: number,
): Installment[] {
  if (!Number.isInteger(totalMinor) || totalMinor < 0) {
    throw new Error('Total must be a non-negative integer in minor units');
  }
  if (!Number.isInteger(installments) || installments <= 0) {
    throw new Error('Installment count must be a positive integer');
  }

  const baseAmount = Math.floor(totalMinor / installments);
  const remainder = totalMinor % installments;

  return Array.from({ length: installments }, (_, index) => ({
    sequence: index + 1,
    amountMinor: baseAmount + (index < remainder ? 1 : 0),
  }));
}
