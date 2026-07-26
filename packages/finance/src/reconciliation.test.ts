import { describe, expect, it } from 'vitest';

import {
  findDuplicateProviderReferences,
  ledgerEntrySchema,
  reconcileSettlement,
  settlementRecordSchema,
} from './reconciliation';

describe('payment reconciliation', () => {
  it('matches provider net settlement against ledger entries', () => {
    const settlement = settlementRecordSchema.parse({
      id: 'settlement_1',
      provider: 'stripe',
      providerReference: 'po_1',
      paymentIntentId: 'payment_1',
      amountMinor: 10_000,
      feeMinor: 300,
      currency: 'usd',
      settledAt: '2026-07-26T00:00:00.000Z',
    });
    const entries = [
      ledgerEntrySchema.parse({
        id: 'ledger_1',
        paymentIntentId: 'payment_1',
        amountMinor: 9_700,
        currency: 'usd',
        recordedAt: '2026-07-26T00:00:00.000Z',
      }),
    ];

    expect(reconcileSettlement(settlement, entries)).toEqual({
      currency: 'USD',
      settlementGrossMinor: 10_000,
      settlementFeesMinor: 300,
      settlementNetMinor: 9_700,
      ledgerMinor: 9_700,
      differenceMinor: 0,
      matched: true,
    });
  });

  it('reports reconciliation differences', () => {
    const settlement = settlementRecordSchema.parse({
      id: 'settlement_2',
      provider: 'stripe',
      providerReference: 'po_2',
      paymentIntentId: 'payment_2',
      amountMinor: 20_000,
      currency: 'eur',
      settledAt: new Date(),
    });
    const entries = [
      ledgerEntrySchema.parse({
        id: 'ledger_2',
        paymentIntentId: 'payment_2',
        amountMinor: 19_500,
        currency: 'eur',
        recordedAt: new Date(),
      }),
    ];

    const result = reconcileSettlement(settlement, entries);
    expect(result.matched).toBe(false);
    expect(result.differenceMinor).toBe(-500);
  });

  it('rejects currency mismatches', () => {
    const settlement = settlementRecordSchema.parse({
      id: 'settlement_3',
      provider: 'stripe',
      providerReference: 'po_3',
      paymentIntentId: 'payment_3',
      amountMinor: 5_000,
      currency: 'usd',
      settledAt: new Date(),
    });
    const entry = ledgerEntrySchema.parse({
      id: 'ledger_3',
      paymentIntentId: 'payment_3',
      amountMinor: 5_000,
      currency: 'eur',
      recordedAt: new Date(),
    });

    expect(() => reconcileSettlement(settlement, [entry])).toThrow(/currencies must match/);
  });

  it('detects duplicate provider references', () => {
    const base = {
      provider: 'stripe',
      providerReference: 'po_duplicate',
      paymentIntentId: 'payment_4',
      amountMinor: 5_000,
      currency: 'usd',
      settledAt: new Date(),
    };
    const settlements = [
      settlementRecordSchema.parse({ id: 'settlement_4', ...base }),
      settlementRecordSchema.parse({ id: 'settlement_5', ...base }),
    ];

    expect(findDuplicateProviderReferences(settlements)).toEqual(['stripe:po_duplicate']);
  });
});
