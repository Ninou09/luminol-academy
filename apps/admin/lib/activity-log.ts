export const activityAreas = [
  'leads',
  'opportunities',
  'consultations',
  'payments',
  'tasks',
  'calendar',
  'team',
] as const;
export type ActivityArea = (typeof activityAreas)[number];

export const activityPeriods = [1, 7, 30] as const;
export type ActivityPeriod = (typeof activityPeriods)[number];

export type ActivityEntry = {
  id: string;
  area: ActivityArea;
  at: Date;
  title: string;
  subject: string | null;
  href: string | null;
  actor: string | null;
  tone?: 'default' | 'success' | 'warning';
};

export const ACTIVITY_LOG_LIMIT = 200;

export function parseActivityPeriod(value: unknown): ActivityPeriod {
  const parsed = Number(value);
  return (activityPeriods as readonly number[]).includes(parsed)
    ? (parsed as ActivityPeriod)
    : 7;
}

export function parseActivityArea(value: unknown): ActivityArea | null {
  return typeof value === 'string' &&
    (activityAreas as readonly string[]).includes(value)
    ? (value as ActivityArea)
    : null;
}

/** Merges sources newest first and keeps the most recent `limit` entries. */
export function mergeActivityLog(
  sources: readonly (readonly ActivityEntry[])[],
  limit = ACTIVITY_LOG_LIMIT,
): ActivityEntry[] {
  return sources
    .flat()
    .sort(
      (left, right) =>
        right.at.getTime() - left.at.getTime() ||
        left.id.localeCompare(right.id),
    )
    .slice(0, limit);
}
