import { z } from 'zod';

import { currencyCodeSchema } from './index';

export const paymentStatusSchema = z.enum([
  'requires_payment_method',
  'requires_confirmation',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded',
]);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentIntentSchema = z.object({
  id: z.string().min(1),
  invoiceId: z.string().min(1),
  customerId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  currency: currencyCodeSchema,
  status: paymentStatusSchema,
  provider: z.string().min(1),
  providerReference: z.string().min(1).optional(),
  idempotencyKey: z.string().min(1),
});

export type PaymentIntent = z.infer<typeof paymentIntentSchema>;

export const refundSchema = z.object({
  id: z.string().min(1),
  paymentIntentId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  reason: z.string().min(1).optional(),
});

export type Refund = z.infer<typeof refundSchema>;

const paymentTransitions: Record<PaymentStatus, readonly PaymentStatus[]> = {
  requires_payment_method: ['requires_confirmation', 'cancelled'],
  requires_confirmation: ['processing', 'cancelled'],
  processing: ['succeeded', 'failed'],
  succeeded: ['partially_refunded', 'refunded'],
  failed: ['requires_payment_method', 'cancelled'],
  cancelled: [],
  refunded: [],
  partially_refunded: ['partially_refunded', 'refunded'],
};

export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus) {
  return paymentTransitions[from].includes(to);
}

export function calculateRefundedAmount(refunds: readonly Refund[]) {
  return refunds.reduce((total, refund) => total + refundSchema.parse(refund).amountMinor, 0);
}

export function determineRefundStatus(payment: PaymentIntent, refunds: readonly Refund[]): PaymentStatus {
  const parsedPayment = paymentIntentSchema.parse(payment);
  const refundedMinor = calculateRefundedAmount(refunds);

  if (refundedMinor > parsedPayment.amountMinor) {
    throw new Error('Refund amount exceeds the original payment amount');
  }

  if (refundedMinor === 0) {
    return parsedPayment.status;
  }

  return refundedMinor === parsedPayment.amountMinor ? 'refunded' : 'partially_refunded';
}

export function isPaymentSettled(status: PaymentStatus) {
  return status === 'succeeded' || status === 'partially_refunded' || status === 'refunded';
}
