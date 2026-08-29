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

export const MAX_PROGRAMME_MIX_ITEMS = 8;

export type VerifiedProgrammeMixItem = {
  programmeSlug: string;
  programmeTitleSnapshot: string;
  count: number;
};

export function normalizeVerifiedProgrammeMix(
  groups: Array<{
    programmeSlug: string | null;
    programmeTitleSnapshot: string | null;
    _count: { _all: number };
  }>,
): VerifiedProgrammeMixItem[] {
  return groups
    .filter(
      (group) =>
        Boolean(group.programmeSlug) &&
        Boolean(group.programmeTitleSnapshot) &&
        group._count._all > 0,
    )
    .map((group) => ({
      programmeSlug: group.programmeSlug as string,
      programmeTitleSnapshot: group.programmeTitleSnapshot as string,
      count: group._count._all,
    }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.programmeTitleSnapshot.localeCompare(b.programmeTitleSnapshot) ||
        a.programmeSlug.localeCompare(b.programmeSlug),
    )
    .slice(0, MAX_PROGRAMME_MIX_ITEMS);
}
