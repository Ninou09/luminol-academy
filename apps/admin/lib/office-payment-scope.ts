import type { PermissionKey } from '@luminol/types';

export type OfficePaymentScope = 'all' | 'own';

/** Owners (who can void) see the whole ledger; consultants who can only
 * record see payments for their own consultations. */
export function resolveOfficePaymentScope(
  can: (permission: PermissionKey) => boolean,
): OfficePaymentScope | null {
  if (can('office-payment:void')) return 'all';
  if (can('office-payment:record')) return 'own';
  return null;
}

export const officePaymentFeedbackCodes = [
  'not-found',
  'forbidden',
  'reference-required',
  'received-at',
  'already-voided',
  'mismatch',
  'invalid',
] as const;

export type OfficePaymentFeedbackCode =
  (typeof officePaymentFeedbackCodes)[number];

export function parseOfficePaymentFeedback(
  value: string | string[] | undefined,
): OfficePaymentFeedbackCode | null {
  return typeof value === 'string' &&
    (officePaymentFeedbackCodes as readonly string[]).includes(value)
    ? (value as OfficePaymentFeedbackCode)
    : null;
}

const monthPattern = /^(\d{4})-(0[1-9]|1[0-2])$/;

/** Parses `YYYY-MM`, falling back to `fallback`. */
export function parseLedgerMonth(value: unknown, fallback: string) {
  return typeof value === 'string' && monthPattern.test(value)
    ? value
    : fallback;
}

/** `YYYY-MM` shifted by whole months. */
export function shiftLedgerMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split('-').map(Number) as [number, number];
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}
