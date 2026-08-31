import type { Prisma } from '@luminol/database';

import {
  ENQUIRY_CONTACT_PREFERENCES,
  type EnquiryContactPreference,
} from './enquiry-contact-preference-reporting';

export type { EnquiryContactPreference };

export function parseEnquiryContactPreferenceFilter(
  value: string | string[] | undefined,
): EnquiryContactPreference | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_CONTACT_PREFERENCES as readonly string[]).includes(value)
    ? (value as EnquiryContactPreference)
    : null;
}

export function getEnquiryContactPreferenceWhere(
  preferredContact: EnquiryContactPreference | null,
): Prisma.EnquiryWhereInput | null {
  return preferredContact ? { preferredContact } : null;
}

export function buildEnquiryContactPreferenceQuery(
  preferredContact: EnquiryContactPreference,
): string {
  const query = new URLSearchParams();
  query.set('preferredContact', preferredContact);
  return query.toString();
}
