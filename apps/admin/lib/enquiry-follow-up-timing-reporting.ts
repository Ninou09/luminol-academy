import type { Prisma } from '@luminol/database';

const DAY_MS = 24 * 60 * 60 * 1_000;
const ACTIVE_STATUSES_EXCLUDED = ['CLOSED', 'SPAM'] as const;

export type FollowUpTimingBucket =
  | 'missingPlan'
  | 'pastDue'
  | 'next24Hours'
  | 'oneToThreeDays'
  | 'later';

export type FollowUpTimingSummary = {
  activeTotal: number;
  buckets: Record<FollowUpTimingBucket, number>;
};

function activeWhere(): Prisma.EnquiryWhereInput {
  return { status: { notIn: [...ACTIVE_STATUSES_EXCLUDED] } };
}

function completePlanWhere(): Prisma.EnquiryWhereInput {
  return {
    nextFollowUpAt: { not: null },
    nextAction: { not: null },
  };
}

export function getActiveEnquiryFollowUpTimingWhere(
  now: Date,
  bucket: FollowUpTimingBucket,
): Prisma.EnquiryWhereInput {
  const nextDay = new Date(now.getTime() + DAY_MS);
  const nextThreeDays = new Date(now.getTime() + 3 * DAY_MS);

  if (bucket === 'missingPlan') {
    return {
      ...activeWhere(),
      OR: [{ nextFollowUpAt: null }, { nextAction: null }],
    };
  }

  const completePlan = completePlanWhere();

  if (bucket === 'pastDue') {
    return {
      ...activeWhere(),
      ...completePlan,
      nextFollowUpAt: { not: null, lt: now },
    };
  }

  if (bucket === 'next24Hours') {
    return {
      ...activeWhere(),
      ...completePlan,
      nextFollowUpAt: { not: null, gte: now, lt: nextDay },
    };
  }

  if (bucket === 'oneToThreeDays') {
    return {
      ...activeWhere(),
      ...completePlan,
      nextFollowUpAt: { not: null, gte: nextDay, lt: nextThreeDays },
    };
  }

  return {
    ...activeWhere(),
    ...completePlan,
    nextFollowUpAt: { not: null, gte: nextThreeDays },
  };
}

export function summarizeFollowUpTiming(
  buckets: Record<FollowUpTimingBucket, number>,
): FollowUpTimingSummary {
  const safe = {
    missingPlan: Math.max(0, Math.floor(buckets.missingPlan || 0)),
    pastDue: Math.max(0, Math.floor(buckets.pastDue || 0)),
    next24Hours: Math.max(0, Math.floor(buckets.next24Hours || 0)),
    oneToThreeDays: Math.max(0, Math.floor(buckets.oneToThreeDays || 0)),
    later: Math.max(0, Math.floor(buckets.later || 0)),
  };

  return {
    activeTotal:
      safe.missingPlan +
      safe.pastDue +
      safe.next24Hours +
      safe.oneToThreeDays +
      safe.later,
    buckets: safe,
  };
}
