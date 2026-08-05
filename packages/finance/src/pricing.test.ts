import { describe, expect, it } from 'vitest';

import {
  applyCoupon,
  buildInstallmentSchedule,
  couponSchema,
  isCouponRedeemable,
} from './pricing';

describe('finance pricing', () => {
  it('applies percentage coupons', () => {
    const coupon = couponSchema.parse({
      id: 'coupon_1',
      code: 'save20',
      percentOff: 20,
    });
    expect(applyCoupon(10_000, 'usd', coupon)).toBe(8_000);
  });

  it('applies fixed coupons only to the matching currency', () => {
    const coupon = couponSchema.parse({
      id: 'coupon_2',
      code: 'fixed',
      amountOffMinor: 2_500,
      currency: 'usd',
    });

    expect(applyCoupon(10_000, 'USD', coupon)).toBe(7_500);
    expect(() => applyCoupon(10_000, 'EUR', coupon)).toThrow(/currency/i);
  });

  it('rejects coupons that exceeded their redemption limit', () => {
    const coupon = couponSchema.parse({
      id: 'coupon_3',
      code: 'limited',
      percentOff: 10,
      maxRedemptions: 5,
      redeemedCount: 5,
    });

    expect(isCouponRedeemable(coupon)).toBe(false);
    expect(() => applyCoupon(10_000, 'USD', coupon)).toThrow(/not redeemable/i);
  });

  it('creates installments that preserve the exact total', () => {
    const schedule = buildInstallmentSchedule(10_000, 3);
    expect(schedule).toEqual([
      { sequence: 1, amountMinor: 3_334 },
      { sequence: 2, amountMinor: 3_333 },
      { sequence: 3, amountMinor: 3_333 },
    ]);
    expect(
      schedule.reduce(
        (total, installment) => total + installment.amountMinor,
        0,
      ),
    ).toBe(10_000);
  });
});
