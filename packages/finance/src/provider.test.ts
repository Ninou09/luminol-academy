import { describe, expect, it } from 'vitest';

import {
  createProviderPaymentSchema,
  createProviderRefundSchema,
  parseProviderPaymentResult,
  parseProviderRefundResult,
} from './provider';

describe('payment provider contracts', () => {
  it('normalizes currency and preserves safe provider metadata', () => {
    const request = createProviderPaymentSchema.parse({
      paymentIntentId: 'pi_1',
      customerId: 'customer_1',
      amountMinor: 25_000,
      currency: 'usd',
      idempotencyKey: 'invoice-1-attempt-1',
      metadata: { invoiceId: 'inv_1', courseId: 'course_1' },
    });

    expect(request.currency).toBe('USD');
    expect(request.metadata).toEqual({
      invoiceId: 'inv_1',
      courseId: 'course_1',
    });
  });

  it('rejects short idempotency keys and invalid redirect URLs', () => {
    expect(() =>
      createProviderPaymentSchema.parse({
        paymentIntentId: 'pi_1',
        customerId: 'customer_1',
        amountMinor: 25_000,
        currency: 'USD',
        idempotencyKey: 'short',
        returnUrl: 'javascript:alert(1)',
      }),
    ).toThrow();
  });

  it('validates refund requests independently from provider responses', () => {
    const refund = createProviderRefundSchema.parse({
      refundId: 'refund_1',
      providerPaymentReference: 'provider_payment_1',
      amountMinor: 5_000,
      idempotencyKey: 'refund-1-attempt-1',
      reason: 'Course cancellation',
    });

    expect(refund.amountMinor).toBe(5_000);
    expect(
      parseProviderRefundResult({
        providerReference: 'provider_refund_1',
        status: 'pending',
      }),
    ).toEqual({ providerReference: 'provider_refund_1', status: 'pending' });
  });

  it('rejects malformed payment-provider responses', () => {
    expect(
      parseProviderPaymentResult({
        providerReference: 'provider_payment_1',
        status: 'succeeded',
      }),
    ).toEqual({ providerReference: 'provider_payment_1', status: 'succeeded' });

    expect(() =>
      parseProviderPaymentResult({
        providerReference: '',
        status: 'unknown',
      }),
    ).toThrow();
  });
});
