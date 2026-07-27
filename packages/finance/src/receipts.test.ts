import { describe, expect, it } from 'vitest';

import { calculateReceiptTotals, formatReceiptNumber } from './receipts';

describe('finance receipts', () => {
  it('calculates immutable receipt totals in minor units', () => {
    const totals = calculateReceiptTotals({
      id: 'receipt_1',
      receiptNumber: 'REC-2026-000001',
      invoiceId: 'invoice_1',
      paymentIntentId: 'payment_1',
      customerId: 'customer_1',
      currency: 'usd',
      lines: [
        { description: 'Course fee', quantity: 1, unitAmountMinor: 25_000 },
        { description: 'Materials', quantity: 2, unitAmountMinor: 1_500 },
      ],
      discountMinor: 2_000,
      taxMinor: 2_600,
      paidAt: new Date('2026-07-27T12:00:00.000Z'),
    });

    expect(totals).toEqual({
      subtotalMinor: 28_000,
      discountMinor: 2_000,
      taxMinor: 2_600,
      totalMinor: 28_600,
    });
  });

  it('caps discounts at the subtotal', () => {
    const totals = calculateReceiptTotals({
      id: 'receipt_2',
      receiptNumber: 'REC-2026-000002',
      invoiceId: 'invoice_2',
      paymentIntentId: 'payment_2',
      customerId: 'customer_2',
      currency: 'EUR',
      lines: [{ description: 'Workshop', quantity: 1, unitAmountMinor: 5_000 }],
      discountMinor: 9_000,
      taxMinor: 0,
      paidAt: new Date('2026-07-27T12:00:00.000Z'),
    });

    expect(totals.totalMinor).toBe(0);
  });

  it('formats deterministic yearly receipt numbers', () => {
    expect(formatReceiptNumber('rec', 42, new Date('2026-07-27T12:00:00.000Z'))).toBe(
      'REC-2026-000042',
    );
  });

  it('rejects unsafe prefixes and invalid sequences', () => {
    expect(() => formatReceiptNumber('receipt!', 1, new Date())).toThrow();
    expect(() => formatReceiptNumber('REC', 0, new Date())).toThrow();
  });
});
