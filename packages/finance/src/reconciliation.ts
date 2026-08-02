import { z } from 'zod';

import { currencyCodeSchema } from './currency';

export const settlementRecordSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  providerReference: z.string().min(1),
  paymentIntentId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  feeMinor: z.number().int().nonnegative().default(0),
  currency: currencyCodeSchema,
  settledAt: z.coerce.date(),
});

export type SettlementRecord = z.infer<typeof settlementRecordSchema>;

export const ledgerEntrySchema = z.object({
  id: z.string().min(1),
  paymentIntentId: z.string().min(1),
  amountMinor: z.number().int(),
  currency: currencyCodeSchema,
  recordedAt: z.coerce.date(),
});

export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;

export interface ReconciliationResult {
  currency: string;
  settlementGrossMinor: number;
  settlementFeesMinor: number;
  settlementNetMinor: number;
  ledgerMinor: number;
  differenceMinor: number;
  matched: boolean;
}

export function reconcileSettlement(
  settlementInput: SettlementRecord,
  ledgerEntriesInput: readonly LedgerEntry[],
): ReconciliationResult {
  const settlement = settlementRecordSchema.parse(settlementInput);
  const ledgerEntries = ledgerEntriesInput.map((entry) => ledgerEntrySchema.parse(entry));

  for (const entry of ledgerEntries) {
    if (entry.currency !== settlement.currency) {
      throw new Error('Settlement and ledger currencies must match');
    }
    if (entry.paymentIntentId !== settlement.paymentIntentId) {
      throw new Error('Ledger entry belongs to a different payment intent');
    }
  }

  const ledgerMinor = ledgerEntries.reduce((total, entry) => total + entry.amountMinor, 0);
  const settlementNetMinor = settlement.amountMinor - settlement.feeMinor;
  const differenceMinor = ledgerMinor - settlementNetMinor;

  return {
    currency: settlement.currency,
    settlementGrossMinor: settlement.amountMinor,
    settlementFeesMinor: settlement.feeMinor,
    settlementNetMinor,
    ledgerMinor,
    differenceMinor,
    matched: differenceMinor === 0,
  };
}

export function findDuplicateProviderReferences(
  settlementsInput: readonly SettlementRecord[],
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const settlementInput of settlementsInput) {
    const settlement = settlementRecordSchema.parse(settlementInput);
    const key = `${settlement.provider}:${settlement.providerReference}`;
    if (seen.has(key)) {
      duplicates.add(key);
    }
    seen.add(key);
  }

  return [...duplicates].sort();
}
