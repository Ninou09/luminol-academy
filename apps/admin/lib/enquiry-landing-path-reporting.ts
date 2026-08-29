export const MAX_ENQUIRY_LANDING_PATH_ITEMS = 6;

export type EnquiryLandingPathMixItem = {
  landingPath: string;
  count: number;
};

export type EnquiryLandingPathMixSummary = {
  total: number;
  recorded: number;
  missing: number;
  items: EnquiryLandingPathMixItem[];
};

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function normalizeEnquiryLandingPathMix(
  groups: Array<{
    landingPath: string | null;
    _count: { _all: number };
  }>,
  total: number,
  recorded: number,
): EnquiryLandingPathMixSummary {
  const items = groups
    .flatMap((group) => {
      if (group.landingPath === null) return [];
      const count = safeCount(group._count._all);
      if (count === 0) return [];
      return [{ landingPath: group.landingPath, count }];
    })
    .sort((left, right) => {
      const byCount = right.count - left.count;
      return byCount !== 0
        ? byCount
        : left.landingPath.localeCompare(right.landingPath, 'en');
    })
    .slice(0, MAX_ENQUIRY_LANDING_PATH_ITEMS);

  const safeTotal = safeCount(total);
  const safeRecorded = Math.min(safeTotal, safeCount(recorded));

  return {
    total: safeTotal,
    recorded: safeRecorded,
    missing: Math.max(0, safeTotal - safeRecorded),
    items,
  };
}
