import type { Prisma } from '@luminol/database';

import type { EnquiryAttentionFilter } from './enquiry-attention';
import {
  getActiveEnquiryAgeWhere,
  type ActiveEnquiryAgeBucket,
} from './enquiry-age-reporting';

export const ENQUIRY_ACTIVE_AGE_BUCKETS = [
  'under24Hours',
  'oneToThreeDays',
  'fourToSevenDays',
  'overSevenDays',
] as const satisfies readonly ActiveEnquiryAgeBucket[];

export type EnquiryActiveAgeBucket =
  (typeof ENQUIRY_ACTIVE_AGE_BUCKETS)[number];

export function parseEnquiryActiveAgeFilter(
  value: string | string[] | undefined,
): EnquiryActiveAgeBucket | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_ACTIVE_AGE_BUCKETS as readonly string[]).includes(value)
    ? (value as EnquiryActiveAgeBucket)
    : null;
}

export function getEnquiryActiveAgeWhere(
  now: Date,
  activeAge: EnquiryActiveAgeBucket | null,
): Prisma.EnquiryWhereInput | null {
  return activeAge ? getActiveEnquiryAgeWhere(now, activeAge) : null;
}

export function buildEnquiryActiveAgeQuery(
  activeAge: EnquiryActiveAgeBucket,
): string {
  const query = new URLSearchParams();
  query.set('activeAge', activeAge);
  return query.toString();
}

export function buildEnquiryAttentionActiveAgeQuery(
  attention: EnquiryAttentionFilter,
  activeAge: EnquiryActiveAgeBucket,
): string {
  const query = new URLSearchParams();
  query.set('attention', attention);
  query.set('activeAge', activeAge);
  return query.toString();
}
