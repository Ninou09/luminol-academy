export const MAX_ENQUIRY_CAMPAIGN_MEDIUM_ITEMS = 6;

export type EnquiryCampaignMediumMixItem = {
  utmMedium: string;
  count: number;
};

export type EnquiryCampaignMediumMixSummary = {
  total: number;
  recorded: number;
  missing: number;
  items: EnquiryCampaignMediumMixItem[];
};

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function normalizeEnquiryCampaignMediumMix(
  groups: Array<{
    utmMedium: string | null;
    _count: { _all: number };
  }>,
  total: number,
  recorded: number,
): EnquiryCampaignMediumMixSummary {
  const items = groups
    .flatMap((group) => {
      if (group.utmMedium === null) return [];
      const count = safeCount(group._count._all);
      if (count === 0) return [];
      return [{ utmMedium: group.utmMedium, count }];
    })
    .sort((left, right) => {
      const byCount = right.count - left.count;
      return byCount !== 0
        ? byCount
        : left.utmMedium.localeCompare(right.utmMedium, 'en');
    })
    .slice(0, MAX_ENQUIRY_CAMPAIGN_MEDIUM_ITEMS);

  const safeTotal = safeCount(total);
  const safeRecorded = Math.min(safeTotal, safeCount(recorded));

  return {
    total: safeTotal,
    recorded: safeRecorded,
    missing: Math.max(0, safeTotal - safeRecorded),
    items,
  };
}
