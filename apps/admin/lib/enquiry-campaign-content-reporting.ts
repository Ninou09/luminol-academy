export const MAX_ENQUIRY_CAMPAIGN_CONTENT_ITEMS = 6;

export type EnquiryCampaignContentMixItem = {
  utmContent: string;
  count: number;
};

export type EnquiryCampaignContentMixSummary = {
  total: number;
  recorded: number;
  missing: number;
  items: EnquiryCampaignContentMixItem[];
};

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function normalizeEnquiryCampaignContentMix(
  groups: Array<{
    utmContent: string | null;
    _count: { _all: number };
  }>,
  total: number,
  recorded: number,
): EnquiryCampaignContentMixSummary {
  const items = groups
    .flatMap((group) => {
      if (group.utmContent === null) return [];
      const count = safeCount(group._count._all);
      if (count === 0) return [];
      return [{ utmContent: group.utmContent, count }];
    })
    .sort((left, right) => {
      const byCount = right.count - left.count;
      return byCount !== 0
        ? byCount
        : left.utmContent.localeCompare(right.utmContent, 'en');
    })
    .slice(0, MAX_ENQUIRY_CAMPAIGN_CONTENT_ITEMS);

  const safeTotal = safeCount(total);
  const safeRecorded = Math.min(safeTotal, safeCount(recorded));

  return {
    total: safeTotal,
    recorded: safeRecorded,
    missing: Math.max(0, safeTotal - safeRecorded),
    items,
  };
}
