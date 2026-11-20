import { z } from 'zod';

export const crmActivityTypes = [
  'CALL',
  'WHATSAPP',
  'EMAIL',
  'MEETING',
  'NOTE',
] as const;
export const crmActivityDirections = ['INBOUND', 'OUTBOUND'] as const;
export const crmActivityOutcomes = [
  'REACHED',
  'NO_ANSWER',
  'LEFT_MESSAGE',
  'BOOKED',
  'NOT_INTERESTED',
  'OTHER',
] as const;

export type CrmActivityTypeValue = (typeof crmActivityTypes)[number];
export type CrmActivityDirectionValue = (typeof crmActivityDirections)[number];
export type CrmActivityOutcomeValue = (typeof crmActivityOutcomes)[number];

export const crmActivityTypeSchema = z.enum(crmActivityTypes);
export const crmActivityDirectionSchema = z.enum(crmActivityDirections);
export const crmActivityOutcomeSchema = z.enum(crmActivityOutcomes);
export const crmActivitySummarySchema = z.string().trim().min(2).max(1000);

/** Types that are conversations with the person (direction applies). */
export function crmActivityHasDirection(type: CrmActivityTypeValue) {
  return type !== 'NOTE';
}

export type CrmActivityViolation = 'direction-required' | 'consent-required';

/**
 * Luminol only contacts people who agreed to it. Inbound conversations and
 * internal notes are always recordable; outbound contact needs consent.
 */
export function checkCrmActivity(input: {
  type: CrmActivityTypeValue;
  direction: CrmActivityDirectionValue | null;
  contactConsent: boolean;
}): CrmActivityViolation | null {
  if (!crmActivityHasDirection(input.type)) return null;
  if (!input.direction) return 'direction-required';
  if (input.direction === 'OUTBOUND' && !input.contactConsent) {
    return 'consent-required';
  }
  return null;
}
