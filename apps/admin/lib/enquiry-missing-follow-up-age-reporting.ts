import type { Prisma } from '@luminol/database';

import {
  getActiveEnquiryAgeWhere,
  summarizeActiveEnquiryAge,
  type ActiveEnquiryAgeBucket,
  type ActiveEnquiryAgeSummary,
} from './enquiry-age-reporting';

const MISSING_FOLLOW_UP_PLAN_WHERE: Prisma.EnquiryWhereInput = {
  OR: [{ nextFollowUpAt: null }, { nextAction: null }],
};

export function getMissingFollowUpPlanAgeWhere(
  now: Date,
  bucket: ActiveEnquiryAgeBucket,
): Prisma.EnquiryWhereInput {
  return {
    AND: [
      getActiveEnquiryAgeWhere(now, bucket),
      MISSING_FOLLOW_UP_PLAN_WHERE,
    ],
  };
}

export function summarizeMissingFollowUpPlanAge(
  buckets: Record<ActiveEnquiryAgeBucket, number>,
): ActiveEnquiryAgeSummary {
  return summarizeActiveEnquiryAge(buckets);
}
