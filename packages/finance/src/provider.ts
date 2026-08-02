import { z } from 'zod';

import { currencyCodeSchema } from './currency';
import { paymentStatusSchema } from './payments';

export const createProviderPaymentSchema = z.object({
  paymentIntentId: z.string().min(1),
  customerId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  currency: currencyCodeSchema,
  idempotencyKey: z.string().min(8).max(255),
  returnUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.string()).default({}),
});

export type CreateProviderPayment = z.infer<typeof createProviderPaymentSchema>;

export const providerPaymentResultSchema = z.object({
  providerReference: z.string().min(1),
  status: paymentStatusSchema,
  clientSecret: z.string().min(1).optional(),
  redirectUrl: z.string().url().optional(),
});

export type ProviderPaymentResult = z.infer<typeof providerPaymentResultSchema>;

export const createProviderRefundSchema = z.object({
  refundId: z.string().min(1),
  providerPaymentReference: z.string().min(1),
  amountMinor: z.number().int().positive(),
  idempotencyKey: z.string().min(8).max(255),
  reason: z.string().min(1).max(500).optional(),
});

export type CreateProviderRefund = z.infer<typeof createProviderRefundSchema>;

export const providerRefundResultSchema = z.object({
  providerReference: z.string().min(1),
  status: z.enum(['pending', 'succeeded', 'failed']),
});

export type ProviderRefundResult = z.infer<typeof providerRefundResultSchema>;

export interface PaymentProviderAdapter {
  readonly name: string;
  createPayment(input: CreateProviderPayment): Promise<ProviderPaymentResult>;
  createRefund(input: CreateProviderRefund): Promise<ProviderRefundResult>;
  retrievePayment(providerReference: string): Promise<ProviderPaymentResult>;
}

export function parseProviderPaymentResult(input: unknown): ProviderPaymentResult {
  return providerPaymentResultSchema.parse(input);
}

export function parseProviderRefundResult(input: unknown): ProviderRefundResult {
  return providerRefundResultSchema.parse(input);
}
