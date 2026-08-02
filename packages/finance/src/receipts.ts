import { z } from 'zod';

import { currencyCodeSchema } from './currency';

export const receiptLineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().positive(),
  unitAmountMinor: z.number().int().nonnegative(),
});

export type ReceiptLine = z.infer<typeof receiptLineSchema>;

export const receiptSchema = z.object({
  id: z.string().min(1),
  receiptNumber: z.string().trim().min(1).max(100),
  invoiceId: z.string().min(1),
  paymentIntentId: z.string().min(1),
  customerId: z.string().min(1),
  currency: currencyCodeSchema,
  lines: z.array(receiptLineSchema).min(1),
  discountMinor: z.number().int().nonnegative().default(0),
  taxMinor: z.number().int().nonnegative().default(0),
  paidAt: z.coerce.date(),
  providerReference: z.string().min(1).optional(),
});

export type Receipt = z.infer<typeof receiptSchema>;

export interface ReceiptTotals {
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
}

export function calculateReceiptTotals(input: Receipt): ReceiptTotals {
  const receipt = receiptSchema.parse(input);
  const subtotalMinor = receipt.lines.reduce(
    (total, line) => total + line.quantity * line.unitAmountMinor,
    0,
  );
  const discountMinor = Math.min(receipt.discountMinor, subtotalMinor);
  const totalMinor = subtotalMinor - discountMinor + receipt.taxMinor;

  return {
    subtotalMinor,
    discountMinor,
    taxMinor: receipt.taxMinor,
    totalMinor,
  };
}

export function formatReceiptNumber(prefix: string, sequence: number, issuedAt: Date): string {
  const normalizedPrefix = prefix.trim().toUpperCase();
  if (!/^[A-Z0-9-]{1,20}$/.test(normalizedPrefix)) {
    throw new Error('Receipt prefix must contain only letters, numbers, or hyphens');
  }
  if (!Number.isInteger(sequence) || sequence <= 0) {
    throw new Error('Receipt sequence must be a positive integer');
  }
  if (Number.isNaN(issuedAt.getTime())) {
    throw new Error('Receipt issue date must be valid');
  }

  const year = issuedAt.getUTCFullYear();
  return `${normalizedPrefix}-${year}-${String(sequence).padStart(6, '0')}`;
}
