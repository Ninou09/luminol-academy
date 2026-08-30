import type { Prisma } from '@luminol/database';

import { ACTIVE_INCOMPLETE_QUALIFICATION_WHERE } from './enquiry-attention';
import {
  getActiveEnquiryAgeWhere,
  summarizeActiveEnquiryAge,
  type ActiveEnquiryAgeBucket,
  type ActiveEnquiryAgeSummary,
} from './enquiry-age-reporting';

export function getIncompleteQualificationAgeWhere(
  now: Date,
  bucket: ActiveEnquiryAgeBucket,
): Prisma.EnquiryWhereInput {
  return {
    ...getActiveEnquiryAgeWhere(now, bucket),
    ...ACTIVE_INCOMPLETE_QUALIFICATION_WHERE,
  };
}

export function summarizeIncompleteQualificationAge(
  buckets: Record<ActiveEnquiryAgeBucket, number>,
): ActiveEnquiryAgeSummary {
  return summarizeActiveEnquiryAge(buckets);
}
