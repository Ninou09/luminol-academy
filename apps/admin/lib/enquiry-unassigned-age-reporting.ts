import type { Prisma } from '@luminol/database';

import {
  getActiveEnquiryAgeWhere,
  summarizeActiveEnquiryAge,
  type ActiveEnquiryAgeBucket,
  type ActiveEnquiryAgeSummary,
} from './enquiry-age-reporting';

export function getUnassignedActiveEnquiryAgeWhere(
  now: Date,
  bucket: ActiveEnquiryAgeBucket,
): Prisma.EnquiryWhereInput {
  return {
    ...getActiveEnquiryAgeWhere(now, bucket),
    ownerUserId: null,
  };
}

export function summarizeUnassignedActiveEnquiryAge(
  buckets: Record<ActiveEnquiryAgeBucket, number>,
): ActiveEnquiryAgeSummary {
  return summarizeActiveEnquiryAge(buckets);
}
