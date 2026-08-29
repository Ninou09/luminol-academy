import type { Prisma } from '@luminol/database';

const HOUR_MS = 60 * 60 * 1_000;
const DAY_MS = 24 * HOUR_MS;
const ACTIVE_STATUSES_EXCLUDED = ['CLOSED', 'SPAM'] as const;

export type ActiveEnquiryAgeBucket =
  | 'under24Hours'
  | 'oneToThreeDays'
  | 'fourToSevenDays'
  | 'overSevenDays';

export type ActiveEnquiryAgeSummary = {
  activeTotal: number;
  buckets: Record<ActiveEnquiryAgeBucket, number>;
};

function activeWhere(): Prisma.EnquiryWhereInput {
  return { status: { notIn: [...ACTIVE_STATUSES_EXCLUDED] } };
}

export function getActiveEnquiryAgeWhere(
  now: Date,
  bucket: ActiveEnquiryAgeBucket,
): Prisma.EnquiryWhereInput {
  const oneDayAgo = new Date(now.getTime() - DAY_MS);
  const fourDaysAgo = new Date(now.getTime() - 4 * DAY_MS);
  const eightDaysAgo = new Date(now.getTime() - 8 * DAY_MS);

  if (bucket === 'under24Hours') {
    return {
      ...activeWhere(),
      createdAt: { gte: oneDayAgo },
    };
  }

  if (bucket === 'oneToThreeDays') {
    return {
      ...activeWhere(),
      createdAt: { gte: fourDaysAgo, lt: oneDayAgo },
    };
  }

  if (bucket === 'fourToSevenDays') {
    return {
      ...activeWhere(),
      createdAt: { gte: eightDaysAgo, lt: fourDaysAgo },
    };
  }

  return {
    ...activeWhere(),
    createdAt: { lt: eightDaysAgo },
  };
}

export function summarizeActiveEnquiryAge(
  buckets: Record<ActiveEnquiryAgeBucket, number>,
): ActiveEnquiryAgeSummary {
  const safe = {
    under24Hours: Math.max(0, Math.floor(buckets.under24Hours || 0)),
    oneToThreeDays: Math.max(0, Math.floor(buckets.oneToThreeDays || 0)),
    fourToSevenDays: Math.max(0, Math.floor(buckets.fourToSevenDays || 0)),
    overSevenDays: Math.max(0, Math.floor(buckets.overSevenDays || 0)),
  };

  return {
    activeTotal:
      safe.under24Hours +
      safe.oneToThreeDays +
      safe.fourToSevenDays +
      safe.overSevenDays,
    buckets: safe,
  };
}
