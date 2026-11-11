import { describe, expect, it } from 'vitest';

import {
  formatOfficeReceiptNumber,
  officePaymentNeedsReference,
  officePaymentReferenceSchema,
  summarizeOfficePayments,
} from './office-payments';

describe('office payments', () => {
  it('formats sequential receipt numbers', () => {
    expect(formatOfficeReceiptNumber(2026, 42)).toBe('LUM-2026-000042');
    expect(() => formatOfficeReceiptNumber(2026, 0)).toThrow();
  });

  it('requires a trace reference for electronic methods only', () => {
    expect(officePaymentNeedsReference('CASH')).toBe(false);
    expect(officePaymentNeedsReference('BARIDIMOB')).toBe(true);
    expect(officePaymentNeedsReference('CCP')).toBe(true);
  });

  it('accepts ordinary references and rejects markup', () => {
    expect(officePaymentReferenceSchema.parse(' CCP-12/34 ')).toBe('CCP-12/34');
    expect(officePaymentReferenceSchema.parse('')).toBeNull();
    expect(() => officePaymentReferenceSchema.parse('<b>')).toThrow();
  });

  it('totals only recorded payments', () => {
    const totals = summarizeOfficePayments([
      {
        amountMinor: 300000,
        method: 'CASH',
        purpose: 'CONSULTATION',
        status: 'RECORDED',
      },
      {
        amountMinor: 1600000,
        method: 'CCP',
        purpose: 'PROGRAMME',
        status: 'RECORDED',
      },
      {
        amountMinor: 300000,
        method: 'CASH',
        purpose: 'CONSULTATION',
        status: 'VOIDED',
      },
    ]);
    expect(totals.totalMinor).toBe(1900000);
    expect(totals.count).toBe(2);
    expect(totals.byMethod.CASH).toBe(300000);
    expect(totals.byPurpose.PROGRAMME).toBe(1600000);
  });
});
