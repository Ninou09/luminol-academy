import type { Prisma } from '@luminol/database';

import {
  getActiveEnquiryFollowUpTimingWhere,
  type FollowUpTimingBucket,
} from './enquiry-follow-up-timing-reporting';

export const ENQUIRY_FOLLOW_UP_TIMING_BUCKETS = [
  'missingPlan',
  'pastDue',
  'next24Hours',
  'oneToThreeDays',
  'later',
] as const satisfies readonly FollowUpTimingBucket[];

export type EnquiryFollowUpTimingBucket =
  (typeof ENQUIRY_FOLLOW_UP_TIMING_BUCKETS)[number];

export function parseEnquiryFollowUpTimingFilter(
  value: string | string[] | undefined,
): EnquiryFollowUpTimingBucket | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_FOLLOW_UP_TIMING_BUCKETS as readonly string[]).includes(value)
    ? (value as EnquiryFollowUpTimingBucket)
    : null;
}

export function getEnquiryFollowUpTimingWhere(
  now: Date,
  bucket: EnquiryFollowUpTimingBucket | null,
): Prisma.EnquiryWhereInput | null {
  return bucket ? getActiveEnquiryFollowUpTimingWhere(now, bucket) : null;
}

export function buildEnquiryFollowUpTimingQuery(
  bucket: EnquiryFollowUpTimingBucket,
): string {
  const query = new URLSearchParams();
  query.set('followUpTiming', bucket);
  return query.toString();
}
