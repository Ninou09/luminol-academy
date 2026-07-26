import { describe, expect, it } from 'vitest';

import {
  calculateCorporateBalance,
  calculateCorporateInvoice,
  corporateInvoiceRequestSchema,
} from './corporate';

describe('corporate invoicing', () => {
  it('calculates seat billing, credits, tax, and payment terms', () => {
    const request = corporateInvoiceRequestSchema.parse({
      organizationId: 'org_1',
      cohortId: 'cohort_1',
      billingContact: {
        name: 'Finance Team',
        email: 'finance@example.com',
        purchaseOrderReference: 'PO-1001',
      },
      seatCount: 20,
      pricePerSeatMinor: 15_000,
      currency: 'usd',
      creditMinor: 25_000,
      taxRateBasisPoints: 800,
      paymentTermsDays: 45,
    });

    expect(calculateCorporateInvoice(request)).toEqual({
      currency: 'USD',
      seatCount: 20,
      subtotalMinor: 300_000,
      creditMinor: 25_000,
      taxableMinor: 275_000,
      taxMinor: 22_000,
      totalMinor: 297_000,
      paymentTermsDays: 45,
    });
  });

  it('caps credits at the corporate invoice subtotal', () => {
    const request = corporateInvoiceRequestSchema.parse({
      organizationId: 'org_2',
      cohortId: 'cohort_2',
      billingContact: { name: 'Billing', email: 'billing@example.com' },
      seatCount: 2,
      pricePerSeatMinor: 10_000,
      currency: 'eur',
      creditMinor: 30_000,
    });

    expect(calculateCorporateInvoice(request).totalMinor).toBe(0);
  });

  it('calculates an outstanding corporate balance without going negative', () => {
    expect(
      calculateCorporateBalance({
        invoicedMinor: 100_000,
        paidMinor: 70_000,
        creditedMinor: 10_000,
      }),
    ).toBe(20_000);

    expect(
      calculateCorporateBalance({
        invoicedMinor: 100_000,
        paidMinor: 100_000,
        creditedMinor: 5_000,
      }),
    ).toBe(0);
  });
});
