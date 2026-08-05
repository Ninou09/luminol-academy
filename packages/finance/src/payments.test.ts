import { describe, expect, it } from 'vitest';

import {
  canTransitionPaymentStatus,
  determineRefundStatus,
  isPaymentSettled,
  paymentIntentSchema,
  refundSchema,
} from './payments';

const payment = paymentIntentSchema.parse({
  id: 'pi_1',
  invoiceId: 'inv_1',
  customerId: 'customer_1',
  amountMinor: 20_000,
  currency: 'usd',
  status: 'succeeded',
  provider: 'test-provider',
  providerReference: 'provider_1',
  idempotencyKey: 'invoice-inv_1-attempt-1',
});

describe('payment lifecycle', () => {
  it('normalizes payment currencies and validates intent data', () => {
    expect(payment.currency).toBe('USD');
    expect(payment.amountMinor).toBe(20_000);
  });

  it('allows only guarded payment status transitions', () => {
    expect(
      canTransitionPaymentStatus(
        'requires_payment_method',
        'requires_confirmation',
      ),
    ).toBe(true);
    expect(canTransitionPaymentStatus('processing', 'succeeded')).toBe(true);
    expect(canTransitionPaymentStatus('succeeded', 'failed')).toBe(false);
    expect(canTransitionPaymentStatus('cancelled', 'processing')).toBe(false);
  });

  it('derives partial and full refund states', () => {
    const partialRefund = refundSchema.parse({
      id: 're_1',
      paymentIntentId: payment.id,
      amountMinor: 5_000,
    });
    const finalRefund = refundSchema.parse({
      id: 're_2',
      paymentIntentId: payment.id,
      amountMinor: 15_000,
    });

    expect(determineRefundStatus(payment, [partialRefund])).toBe(
      'partially_refunded',
    );
    expect(determineRefundStatus(payment, [partialRefund, finalRefund])).toBe(
      'refunded',
    );
  });

  it('rejects refunds beyond the original payment', () => {
    const excessiveRefund = refundSchema.parse({
      id: 're_3',
      paymentIntentId: payment.id,
      amountMinor: 20_001,
    });

    expect(() => determineRefundStatus(payment, [excessiveRefund])).toThrow(
      'Refund amount exceeds the original payment amount',
    );
  });

  it('identifies settled payment states', () => {
    expect(isPaymentSettled('succeeded')).toBe(true);
    expect(isPaymentSettled('partially_refunded')).toBe(true);
    expect(isPaymentSettled('processing')).toBe(false);
  });
});
