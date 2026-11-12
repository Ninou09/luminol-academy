/** Median of a list of numbers, or null when empty. */
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
}

/** Share as a whole percentage (0–100), or null when the base is zero. */
export function percent(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return Math.round((part / whole) * 100);
}

export type GroupedCount = {
  key: string;
  total: number;
  converted: number;
  rate: number | null;
};

/** Groups leads by a key with conversion counts, largest groups first. */
export function groupConversion<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  isConverted: (item: T) => boolean,
): GroupedCount[] {
  const groups = new Map<string, { total: number; converted: number }>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key) ?? { total: 0, converted: 0 };
    group.total += 1;
    if (isConverted(item)) group.converted += 1;
    groups.set(key, group);
  }
  return [...groups.entries()]
    .map(([key, { total, converted }]) => ({
      key,
      total,
      converted,
      rate: percent(converted, total),
    }))
    .sort(
      (left, right) =>
        right.total - left.total || left.key.localeCompare(right.key),
    );
}

/** Normalizes a lead's acquisition source for grouping. */
export function leadSourceKey(lead: {
  utmSource: string | null;
  source: string | null;
}) {
  const value = (lead.utmSource ?? lead.source ?? '').trim().toLowerCase();
  return value.length > 0 ? value.slice(0, 40) : 'direct';
}

export const crmDashboardPeriods = [7, 30, 90] as const;
export type CrmDashboardPeriod = (typeof crmDashboardPeriods)[number];

export function parseCrmDashboardPeriod(value: unknown): CrmDashboardPeriod {
  const parsed = Number(value);
  return (crmDashboardPeriods as readonly number[]).includes(parsed)
    ? (parsed as CrmDashboardPeriod)
    : 30;
}
