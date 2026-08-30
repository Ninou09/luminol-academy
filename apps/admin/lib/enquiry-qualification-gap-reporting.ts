import type { Prisma } from '@luminol/database';

import { getRecentActiveEnquiryWhere } from './enquiry-pipeline-reporting';

export const ENQUIRY_QUALIFICATION_GAP_FIELDS = [
  'city',
  'preferredContact',
  'deliveryPreference',
  'timingPreference',
] as const;

export type EnquiryQualificationGapField =
  (typeof ENQUIRY_QUALIFICATION_GAP_FIELDS)[number];

export type EnquiryQualificationGapSummary = {
  activeTotal: number;
  cityMissing: number;
  preferredContactMissing: number;
  deliveryPreferenceMissing: number;
  timingPreferenceMissing: number;
};

export function getRecentActiveQualificationGapWhere(
  now: Date,
  field: EnquiryQualificationGapField,
): Prisma.EnquiryWhereInput {
  return {
    ...getRecentActiveEnquiryWhere(now),
    [field]: null,
  };
}

function safeBoundedCount(value: number, total: number): number {
  if (!Number.isFinite(value) || value <= 0 || total <= 0) return 0;
  return Math.min(Math.floor(value), total);
}

export function summarizeRecentActiveQualificationGaps(input: {
  activeTotal: number;
  cityMissing: number;
  preferredContactMissing: number;
  deliveryPreferenceMissing: number;
  timingPreferenceMissing: number;
}): EnquiryQualificationGapSummary {
  const activeTotal =
    Number.isFinite(input.activeTotal) && input.activeTotal > 0
      ? Math.floor(input.activeTotal)
      : 0;

  return {
    activeTotal,
    cityMissing: safeBoundedCount(input.cityMissing, activeTotal),
    preferredContactMissing: safeBoundedCount(
      input.preferredContactMissing,
      activeTotal,
    ),
    deliveryPreferenceMissing: safeBoundedCount(
      input.deliveryPreferenceMissing,
      activeTotal,
    ),
    timingPreferenceMissing: safeBoundedCount(
      input.timingPreferenceMissing,
      activeTotal,
    ),
  };
}
