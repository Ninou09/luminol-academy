export const ENQUIRY_TIMING_PREFERENCES = [
  'SOON',
  'WITHIN_MONTH',
  'LATER',
  'NOT_SURE',
] as const;

export type EnquiryTimingPreference =
  (typeof ENQUIRY_TIMING_PREFERENCES)[number];

export type EnquiryTimingPreferenceMixItem = {
  timingPreference: EnquiryTimingPreference;
  count: number;
};

export type EnquiryTimingPreferenceMixSummary = {
  total: number;
  missing: number;
  items: EnquiryTimingPreferenceMixItem[];
};

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function normalizeEnquiryTimingPreferenceMix(
  groups: Array<{
    timingPreference: string | null;
    _count: { _all: number };
  }>,
  total: number,
): EnquiryTimingPreferenceMixSummary {
  const allowed = new Set<string>(ENQUIRY_TIMING_PREFERENCES);
  const counts = new Map<EnquiryTimingPreference, number>();

  for (const group of groups) {
    if (!allowed.has(group.timingPreference ?? '')) continue;
    const count = safeCount(group._count._all);
    if (count === 0) continue;

    const preference = group.timingPreference as EnquiryTimingPreference;
    counts.set(preference, (counts.get(preference) ?? 0) + count);
  }

  const items = ENQUIRY_TIMING_PREFERENCES.flatMap((timingPreference) => {
    const count = counts.get(timingPreference) ?? 0;
    return count > 0 ? [{ timingPreference, count }] : [];
  });
  const safeTotal = safeCount(total);
  const structuredTotal = items.reduce((sum, item) => sum + item.count, 0);

  return {
    total: safeTotal,
    missing: Math.max(0, safeTotal - structuredTotal),
    items,
  };
}
