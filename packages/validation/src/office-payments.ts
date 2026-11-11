import { z } from 'zod';

export const officePaymentMethods = [
  'CASH',
  'BARIDIMOB',
  'CCP',
  'BANK_TRANSFER',
] as const;
export const officePaymentPurposes = [
  'CONSULTATION',
  'PROGRAMME',
  'OTHER',
] as const;

export type OfficePaymentMethodValue = (typeof officePaymentMethods)[number];
export type OfficePaymentPurposeValue = (typeof officePaymentPurposes)[number];

export const officePaymentMethodSchema = z.enum(officePaymentMethods);
export const officePaymentPurposeSchema = z.enum(officePaymentPurposes);

/** Whole Algerian dinars as typed by staff. */
export const officePaymentDinarsSchema = z
  .number()
  .int()
  .min(1)
  .max(10_000_000);
export const officePaymentPayerSchema = z.string().trim().min(2).max(120);
export const officePaymentDescriptionSchema = z.string().trim().min(2).max(160);
export const officePaymentReferenceSchema = z
  .string()
  .trim()
  .max(80)
  .regex(/^[\p{L}\p{N} ._:/#-]*$/u, 'Reference contains unsupported characters')
  .transform((value) => (value.length > 0 ? value : null));
export const officePaymentVoidReasonSchema = z.string().trim().min(5).max(240);

/** Electronic methods need a transfer reference so the payment can be traced. */
export function officePaymentNeedsReference(method: OfficePaymentMethodValue) {
  return method !== 'CASH';
}

/** `LUM-2026-000042`: calendar year in Blida time plus a global sequence. */
export function formatOfficeReceiptNumber(year: number, sequence: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new Error('Receipt year is invalid');
  }
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new Error('Receipt sequence is invalid');
  }
  return `LUM-${year}-${String(sequence).padStart(6, '0')}`;
}

export type OfficePaymentTotals = {
  totalMinor: number;
  count: number;
  byMethod: Record<OfficePaymentMethodValue, number>;
  byPurpose: Record<OfficePaymentPurposeValue, number>;
};

/** Sums recorded (non-voided) payments. */
export function summarizeOfficePayments(
  payments: readonly {
    amountMinor: number;
    method: OfficePaymentMethodValue;
    purpose: OfficePaymentPurposeValue;
    status: 'RECORDED' | 'VOIDED';
  }[],
): OfficePaymentTotals {
  const totals: OfficePaymentTotals = {
    totalMinor: 0,
    count: 0,
    byMethod: { CASH: 0, BARIDIMOB: 0, CCP: 0, BANK_TRANSFER: 0 },
    byPurpose: { CONSULTATION: 0, PROGRAMME: 0, OTHER: 0 },
  };
  for (const payment of payments) {
    if (payment.status !== 'RECORDED') continue;
    totals.totalMinor += payment.amountMinor;
    totals.count += 1;
    totals.byMethod[payment.method] += payment.amountMinor;
    totals.byPurpose[payment.purpose] += payment.amountMinor;
  }
  return totals;
}
