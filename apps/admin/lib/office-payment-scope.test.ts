import { describe, expect, it } from 'vitest';

import {
  parseLedgerMonth,
  parseOfficePaymentFeedback,
  resolveOfficePaymentScope,
  shiftLedgerMonth,
} from './office-payment-scope';

describe('office payment scope', () => {
  it('gives voiding owners the full ledger and recorders their own', () => {
    expect(resolveOfficePaymentScope(() => true)).toBe('all');
    expect(
      resolveOfficePaymentScope(
        (permission) => permission === 'office-payment:record',
      ),
    ).toBe('own');
    expect(
      resolveOfficePaymentScope((permission) => permission === 'enquiry:work'),
    ).toBeNull();
  });

  it('parses and shifts ledger months', () => {
    expect(parseLedgerMonth('2026-11', '2000-01')).toBe('2026-11');
    expect(parseLedgerMonth('2026-13', '2000-01')).toBe('2000-01');
    expect(shiftLedgerMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftLedgerMonth('2026-01', -1)).toBe('2025-12');
  });

  it('accepts only known feedback codes', () => {
    expect(parseOfficePaymentFeedback('reference-required')).toBe(
      'reference-required',
    );
    expect(parseOfficePaymentFeedback('nope')).toBeNull();
  });
});
