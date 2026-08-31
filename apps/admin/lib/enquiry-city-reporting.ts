export const MAX_ENQUIRY_CITY_ITEMS = 6;

export type EnquiryCityMixItem = {
  city: string;
  count: number;
};

export type EnquiryCityMixSummary = {
  total: number;
  recorded: number;
  missing: number;
  items: EnquiryCityMixItem[];
};

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function normalizeEnquiryCityMix(
  groups: Array<{
    city: string | null;
    _count: { _all: number };
  }>,
  total: number,
  recorded: number,
): EnquiryCityMixSummary {
  const items = groups
    .flatMap((group) => {
      if (group.city === null) return [];
      const count = safeCount(group._count._all);
      if (count === 0) return [];
      return [{ city: group.city, count }];
    })
    .sort((left, right) => {
      const byCount = right.count - left.count;
      return byCount !== 0 ? byCount : left.city.localeCompare(right.city);
    })
    .slice(0, MAX_ENQUIRY_CITY_ITEMS);

  const safeTotal = safeCount(total);
  const safeRecorded = Math.min(safeTotal, safeCount(recorded));

  return {
    total: safeTotal,
    recorded: safeRecorded,
    missing: Math.max(0, safeTotal - safeRecorded),
    items,
  };
}
