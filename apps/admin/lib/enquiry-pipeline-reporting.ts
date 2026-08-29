import type { Prisma } from '@luminol/database';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1_000;

export function getThirtyDayEnquiryStart(now: Date): Date {
  return new Date(now.getTime() - THIRTY_DAYS_MS);
}

export function getRecentEnquiryWhere(now: Date): Prisma.EnquiryWhereInput {
  return { createdAt: { gte: getThirtyDayEnquiryStart(now) } };
}

export function getProgrammeAttributedRecentEnquiryWhere(
  now: Date,
): Prisma.EnquiryWhereInput {
  return {
    createdAt: { gte: getThirtyDayEnquiryStart(now) },
    programmeSlug: { not: null },
    programmeTitleSnapshot: { not: null },
  };
}
