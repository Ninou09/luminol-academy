import { z } from 'zod';

import { currencyCodeSchema } from './currency';

export const corporateBillingContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  purchaseOrderReference: z.string().min(1).optional(),
});

export type CorporateBillingContact = z.infer<typeof corporateBillingContactSchema>;

export const corporateInvoiceRequestSchema = z.object({
  organizationId: z.string().min(1),
  cohortId: z.string().min(1),
  billingContact: corporateBillingContactSchema,
  seatCount: z.number().int().positive(),
  pricePerSeatMinor: z.number().int().nonnegative(),
  currency: currencyCodeSchema,
  taxRateBasisPoints: z.number().int().min(0).max(10_000).default(0),
  creditMinor: z.number().int().nonnegative().default(0),
  paymentTermsDays: z.number().int().min(0).max(365).default(30),
});

export type CorporateInvoiceRequest = z.infer<typeof corporateInvoiceRequestSchema>;

export interface CorporateInvoiceSummary {
  currency: string;
  seatCount: number;
  subtotalMinor: number;
  creditMinor: number;
  taxableMinor: number;
  taxMinor: number;
  totalMinor: number;
  paymentTermsDays: number;
}

export function calculateCorporateInvoice(
  input: CorporateInvoiceRequest,
): CorporateInvoiceSummary {
  const request = corporateInvoiceRequestSchema.parse(input);
  const subtotalMinor = request.seatCount * request.pricePerSeatMinor;
  const creditMinor = Math.min(request.creditMinor, subtotalMinor);
  const taxableMinor = subtotalMinor - creditMinor;
  const taxMinor = Math.round((taxableMinor * request.taxRateBasisPoints) / 10_000);

  return {
    currency: request.currency,
    seatCount: request.seatCount,
    subtotalMinor,
    creditMinor,
    taxableMinor,
    taxMinor,
    totalMinor: taxableMinor + taxMinor,
    paymentTermsDays: request.paymentTermsDays,
  };
}

export interface CorporateAccountBalance {
  invoicedMinor: number;
  paidMinor: number;
  creditedMinor: number;
}

export function calculateCorporateBalance(balance: CorporateAccountBalance): number {
  const invoicedMinor = z.number().int().nonnegative().parse(balance.invoicedMinor);
  const paidMinor = z.number().int().nonnegative().parse(balance.paidMinor);
  const creditedMinor = z.number().int().nonnegative().parse(balance.creditedMinor);

  return Math.max(0, invoicedMinor - paidMinor - creditedMinor);
}
