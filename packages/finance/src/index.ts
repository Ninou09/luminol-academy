import { z } from 'zod';

import { currencyCodeSchema } from './currency';

export { currencyCodeSchema } from './currency';
export type { CurrencyCode } from './currency';

export const moneySchema = z.object({
  amountMinor: z.number().int().nonnegative(),
  currency: currencyCodeSchema,
});

export type Money = z.infer<typeof moneySchema>;

export const invoiceStatusSchema = z.enum([
  'draft',
  'open',
  'paid',
  'void',
  'past_due',
  'refunded',
]);

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceLineSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
});

export type InvoiceLine = z.infer<typeof invoiceLineSchema>;

export const invoiceSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  currency: currencyCodeSchema,
  status: invoiceStatusSchema,
  lines: z.array(invoiceLineSchema).min(1),
  discountMinor: z.number().int().nonnegative().default(0),
  taxRateBasisPoints: z.number().int().min(0).max(10_000).default(0),
});

export type Invoice = z.infer<typeof invoiceSchema>;

export interface InvoiceTotals {
  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
}

export function calculateInvoiceTotals(input: Invoice): InvoiceTotals {
  const invoice = invoiceSchema.parse(input);
  const subtotalMinor = invoice.lines.reduce(
    (total, line) => total + line.quantity * line.unitPriceMinor,
    0,
  );
  const discountMinor = Math.min(invoice.discountMinor, subtotalMinor);
  const taxableMinor = subtotalMinor - discountMinor;
  const taxMinor = Math.round((taxableMinor * invoice.taxRateBasisPoints) / 10_000);

  return {
    currency: invoice.currency,
    subtotalMinor,
    discountMinor,
    taxMinor,
    totalMinor: taxableMinor + taxMinor,
  };
}

const allowedTransitions: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ['open', 'void'],
  open: ['paid', 'past_due', 'void'],
  paid: ['refunded'],
  past_due: ['paid', 'void'],
  void: [],
  refunded: [],
};

export function canTransitionInvoiceStatus(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export * from './audit';
export * from './corporate';
export * from './payments';
export * from './pricing';
export * from './provider';
export * from './receipts';
export * from './reconciliation';
export * from './subscriptions';
