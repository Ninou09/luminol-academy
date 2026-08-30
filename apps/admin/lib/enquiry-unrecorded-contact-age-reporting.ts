import type { Prisma } from '@luminol/database';

import { ACTIVE_WITHOUT_RECORDED_CONTACT_WHERE } from './enquiry-attention';
import {
  getActiveEnquiryAgeWhere,
  summarizeActiveEnquiryAge,
  type ActiveEnquiryAgeBucket,
  type ActiveEnquiryAgeSummary,
} from './enquiry-age-reporting';

export function getUnrecordedContactAgeWhere(
  now: Date,
  bucket: ActiveEnquiryAgeBucket,
): Prisma.EnquiryWhereInput {
  return {
    ...getActiveEnquiryAgeWhere(now, bucket),
    ...ACTIVE_WITHOUT_RECORDED_CONTACT_WHERE,
  };
}

export function summarizeUnrecordedContactAge(
  buckets: Record<ActiveEnquiryAgeBucket, number>,
): ActiveEnquiryAgeSummary {
  return summarizeActiveEnquiryAge(buckets);
}
