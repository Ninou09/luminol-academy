import { describe, expect, it } from 'vitest';

import { calculateInvoiceTotals, canTransitionInvoiceStatus, invoiceSchema } from './index';

describe('finance domain', () => {
  it('calculates subtotal, discount, tax, and total in minor units', () => {
    const invoice = invoiceSchema.parse({
      id: 'inv_1',
      customerId: 'customer_1',
      currency: 'usd',
      status: 'draft',
      lines: [
        { id: 'line_1', description: 'Course seat', quantity: 2, unitPriceMinor: 12_500 },
        { id: 'line_2', description: 'Assessment', quantity: 1, unitPriceMinor: 5_000 },
      ],
      discountMinor: 3_000,
      taxRateBasisPoints: 1_000,
    });

    expect(calculateInvoiceTotals(invoice)).toEqual({
      currency: 'USD',
      subtotalMinor: 30_000,
      discountMinor: 3_000,
      taxMinor: 2_700,
      totalMinor: 29_700,
    });
  });

  it('caps a discount at the subtotal', () => {
    const invoice = invoiceSchema.parse({
      id: 'inv_2',
      customerId: 'customer_2',
      currency: 'eur',
      status: 'open',
      lines: [{ id: 'line_1', description: 'Program', quantity: 1, unitPriceMinor: 10_000 }],
      discountMinor: 20_000,
    });

    expect(calculateInvoiceTotals(invoice).totalMinor).toBe(0);
  });

  it('enforces invoice lifecycle transitions', () => {
    expect(canTransitionInvoiceStatus('draft', 'open')).toBe(true);
    expect(canTransitionInvoiceStatus('open', 'paid')).toBe(true);
    expect(canTransitionInvoiceStatus('paid', 'open')).toBe(false);
    expect(canTransitionInvoiceStatus('void', 'paid')).toBe(false);
  });
});
