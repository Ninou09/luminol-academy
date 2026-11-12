import type { PermissionKey } from '@luminol/types';

export type ConsultationScope = 'all' | 'own';

/** Owners (`consultation:manage`) see every appointment; consultants
 * (`consultation:deliver`) only their own. */
export function resolveConsultationScope(
  can: (permission: PermissionKey) => boolean,
): ConsultationScope | null {
  if (can('consultation:manage')) return 'all';
  if (can('consultation:deliver')) return 'own';
  return null;
}

export const consultationDurations = [30, 45, 60, 75, 90, 120] as const;

/** 15-minute start times that can fit at least a 30-minute session. */
export function consultationStartTimes(): string[] {
  const times: string[] = [];
  for (let minute = 8 * 60; minute <= 16 * 60 + 30; minute += 15) {
    const hour = String(Math.floor(minute / 60)).padStart(2, '0');
    times.push(`${hour}:${String(minute % 60).padStart(2, '0')}`);
  }
  return times;
}

const errorCodes = [
  'not-found',
  'forbidden',
  'ineligible-consultant',
  'stale',
  'transition',
  'not-started',
  'overlap',
  'already-converted',
  'invalid-duration',
  'misaligned',
  'closed-day',
  'outside-hours',
  'invalid',
] as const;

export type ConsultationFeedbackCode = (typeof errorCodes)[number];

export function parseConsultationFeedback(
  value: string | string[] | undefined,
): ConsultationFeedbackCode | null {
  return typeof value === 'string' &&
    (errorCodes as readonly string[]).includes(value)
    ? (value as ConsultationFeedbackCode)
    : null;
}

export const consultationFeedbackCodes = errorCodes;

/** Adds `days` to a `YYYY-MM-DD` calendar date. */
export function shiftLocalDate(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

const operationsWorkspaces = [
  'consultations',
  'clients',
  'office-payments',
  'tasks',
  'today',
] as const;
export type OperationsWorkspace = (typeof operationsWorkspaces)[number];

const returnPathPattern = new RegExp(
  `^/(?:(?:ar|fr|en)/)?(?:${operationsWorkspaces.join('|')})(?:\\?[A-Za-z0-9=&%._:+-]*)?$`,
);

/** Accepts only internal operations workspace paths for redirects. */
export function safeOperationsReturnPath(
  value: unknown,
  fallback: `/${OperationsWorkspace}`,
) {
  return typeof value === 'string' && returnPathPattern.test(value)
    ? value
    : fallback;
}
