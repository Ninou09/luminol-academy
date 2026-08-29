import type { Prisma } from '@luminol/database';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1_000;
const ACTIVE_ENQUIRY_STATUSES_EXCLUDED = ['CLOSED', 'SPAM'] as const;
export const MAX_PROGRAMME_ENQUIRY_MIX_ITEMS = 6;

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

export function getRecentActiveEnquiryWhere(
  now: Date,
): Prisma.EnquiryWhereInput {
  return {
    createdAt: { gte: getThirtyDayEnquiryStart(now) },
    status: { notIn: [...ACTIVE_ENQUIRY_STATUSES_EXCLUDED] },
  };
}

export function getRecentActiveOwnedEnquiryWhere(
  now: Date,
): Prisma.EnquiryWhereInput {
  return {
    ...getRecentActiveEnquiryWhere(now),
    ownerUserId: { not: null },
  };
}

export function getRecentActiveFollowUpPlannedEnquiryWhere(
  now: Date,
): Prisma.EnquiryWhereInput {
  return {
    ...getRecentActiveEnquiryWhere(now),
    nextFollowUpAt: { not: null },
    nextAction: { not: null },
  };
}

export function getRecentActiveQualifiedEnquiryWhere(
  now: Date,
): Prisma.EnquiryWhereInput {
  return {
    ...getRecentActiveEnquiryWhere(now),
    city: { not: null },
    preferredContact: { not: null },
    deliveryPreference: { not: null },
    timingPreference: { not: null },
  };
}

export function calculateEnquiryCoveragePercent(
  covered: number,
  total: number,
): number {
  if (!Number.isFinite(covered) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  const boundedCovered = Math.min(Math.max(covered, 0), total);
  return Math.round((boundedCovered / total) * 1_000) / 10;
}

export const ENQUIRY_SCHOOLS = [
  'PSYCHOLOGY',
  'LANGUAGES',
  'TRAINING',
  'GENERAL',
] as const;

export type EnquirySchoolValue = (typeof ENQUIRY_SCHOOLS)[number];

export function normalizeEnquirySchoolMix(
  groups: Array<{ school: string; _count: { _all: number } }>,
): Array<{ school: EnquirySchoolValue; count: number }> {
  const allowed = new Set<string>(ENQUIRY_SCHOOLS);
  return groups
    .filter((group) => allowed.has(group.school) && group._count._all > 0)
    .map((group) => ({
      school: group.school as EnquirySchoolValue,
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count || a.school.localeCompare(b.school));
}

export type ProgrammeEnquiryMixItem = {
  programmeSlug: string;
  programmeTitleSnapshot: string;
  count: number;
};

function compareStableText(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function normalizeProgrammeEnquiryMix(
  groups: Array<{
    programmeSlug: string | null;
    programmeTitleSnapshot: string | null;
    _count: { _all: number };
  }>,
  limit = MAX_PROGRAMME_ENQUIRY_MIX_ITEMS,
): ProgrammeEnquiryMixItem[] {
  const boundedLimit = Math.max(0, Math.floor(limit));

  return groups
    .filter(
      (group): group is {
        programmeSlug: string;
        programmeTitleSnapshot: string;
        _count: { _all: number };
      } =>
        group.programmeSlug !== null &&
        group.programmeTitleSnapshot !== null &&
        group._count._all > 0,
    )
    .map((group) => ({
      programmeSlug: group.programmeSlug,
      programmeTitleSnapshot: group.programmeTitleSnapshot,
      count: group._count._all,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        compareStableText(a.programmeTitleSnapshot, b.programmeTitleSnapshot) ||
        compareStableText(a.programmeSlug, b.programmeSlug),
    )
    .slice(0, boundedLimit);
}
