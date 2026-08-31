import type { Prisma } from '@luminol/database';

import {
  ENQUIRY_TIMING_PREFERENCES,
  type EnquiryTimingPreference,
} from './enquiry-timing-preference-reporting';

export type { EnquiryTimingPreference };

export function parseEnquiryTimingPreferenceFilter(
  value: string | string[] | undefined,
): EnquiryTimingPreference | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_TIMING_PREFERENCES as readonly string[]).includes(value)
    ? (value as EnquiryTimingPreference)
    : null;
}

export function getEnquiryTimingPreferenceWhere(
  timingPreference: EnquiryTimingPreference | null,
): Prisma.EnquiryWhereInput | null {
  return timingPreference ? { timingPreference } : null;
}

export function buildEnquiryTimingPreferenceQuery(
  timingPreference: EnquiryTimingPreference,
): string {
  const query = new URLSearchParams();
  query.set('timingPreference', timingPreference);
  return query.toString();
}
