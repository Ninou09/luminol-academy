import { z } from 'zod';

/** Luminol consultations run on Blida time. Algeria observes no DST. */
export const CONSULTATION_TIMEZONE = 'Africa/Algiers';
export const CONSULTATION_OPENS_AT_MINUTE = 8 * 60;
export const CONSULTATION_CLOSES_AT_MINUTE = 17 * 60;
/** JavaScript weekday numbers (0 = Sunday). Friday is closed. */
export const CONSULTATION_CLOSED_WEEKDAYS: readonly number[] = [5];
export const CONSULTATION_SLOT_MINUTES = 15;

export const consultationModes = ['ONSITE', 'ONLINE'] as const;
export const consultationStatuses = [
  'REQUESTED',
  'CONFIRMED',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
] as const;

export type ConsultationModeValue = (typeof consultationModes)[number];
export type ConsultationStatusValue = (typeof consultationStatuses)[number];

export const consultationModeSchema = z.enum(consultationModes);
export const consultationStatusSchema = z.enum(consultationStatuses);
export const consultationInitialStatusSchema = z.enum([
  'REQUESTED',
  'CONFIRMED',
]);

export const consultationTransitions: Record<
  ConsultationStatusValue,
  readonly ConsultationStatusValue[]
> = {
  REQUESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
};

/** Statuses that occupy the consultant's calendar. */
export const consultationBlockingStatuses: readonly ConsultationStatusValue[] =
  ['REQUESTED', 'CONFIRMED', 'COMPLETED'];

/** Outcomes that can only be recorded once the session has started. */
export const consultationOutcomeStatuses: readonly ConsultationStatusValue[] = [
  'COMPLETED',
  'NO_SHOW',
];

export function isConsultationTransitionAllowed(
  from: ConsultationStatusValue,
  to: ConsultationStatusValue,
) {
  return consultationTransitions[from].includes(to);
}

export const consultationDurationSchema = z
  .number()
  .int()
  .min(30)
  .max(120)
  .refine((value) => value % CONSULTATION_SLOT_MINUTES === 0, {
    message: 'Duration must be a multiple of 15 minutes',
  });

/** Whole Algerian dinars as typed by staff; stored as minor units (×100). */
export const consultationPriceDinarsSchema = z
  .number()
  .int()
  .min(0)
  .max(1_000_000);

export const operationalNoteSchema = z
  .string()
  .trim()
  .max(500)
  .transform((value) => (value.length > 0 ? value : null));

export const clientDisplayNameSchema = z.string().trim().min(2).max(120);
export const clientPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9 ().-]{5,23}$/, 'Phone number is invalid');
export const clientEmailSchema = z.email().max(254);
export const clientLocaleSchema = z.enum(['ar', 'fr', 'en']);

export const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');
export const localDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Time must be YYYY-MM-DDTHH:mm');

export function dinarsToMinor(dinars: number) {
  return consultationPriceDinarsSchema.parse(dinars) * 100;
}

export function minorToDinars(minor: number) {
  return Math.round(minor) / 100;
}

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
};

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getZonedParts(
  date: Date,
  timeZone = CONSULTATION_TIMEZONE,
): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    year: Number(value('year')),
    month: Number(value('month')),
    day: Number(value('day')),
    weekday: weekdayIndex[value('weekday')] ?? -1,
    hour: Number(value('hour')),
    minute: Number(value('minute')),
  };
}

function offsetMinutes(instant: Date, timeZone: string) {
  const parts = getZonedParts(instant, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );
  const truncated = Math.floor(instant.getTime() / 60_000) * 60_000;
  return (asUtc - truncated) / 60_000;
}

/** Converts a wall-clock `YYYY-MM-DDTHH:mm` in the zone to a UTC instant. */
export function zonedLocalToUtc(
  local: string,
  timeZone = CONSULTATION_TIMEZONE,
): Date {
  const normalized = localDateTimeSchema.parse(local);
  const [datePart, timePart] = normalized.split('T') as [string, string];
  const [year, month, day] = datePart.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const [hour, minute] = timePart.split(':').map(Number) as [number, number];
  const wallClock = Date.UTC(year, month - 1, day, hour, minute);
  let instant = new Date(
    wallClock - offsetMinutes(new Date(wallClock), timeZone) * 60_000,
  );
  instant = new Date(wallClock - offsetMinutes(instant, timeZone) * 60_000);

  const check = getZonedParts(instant, timeZone);
  if (
    check.year !== year ||
    check.month !== month ||
    check.day !== day ||
    check.hour !== hour ||
    check.minute !== minute
  ) {
    throw new Error('Local time does not exist in the consultation timezone');
  }
  return instant;
}

/** Formats an instant as the zone's `YYYY-MM-DDTHH:mm` wall clock. */
export function utcToZonedLocal(
  instant: Date,
  timeZone = CONSULTATION_TIMEZONE,
) {
  const parts = getZonedParts(instant, timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

/** UTC bounds of the zone's calendar day(s) starting at `localDate`. */
export function zonedDayRange(
  localDate: string,
  days = 1,
  timeZone = CONSULTATION_TIMEZONE,
) {
  const date = localDateSchema.parse(localDate);
  const start = zonedLocalToUtc(`${date}T00:00`, timeZone);
  const [year, month, day] = date.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const next = new Date(Date.UTC(year, month - 1, day + days));
  const nextLocal = next.toISOString().slice(0, 10);
  const end = zonedLocalToUtc(`${nextLocal}T00:00`, timeZone);
  return { start, end };
}

export type ConsultationSlotViolation =
  'invalid-duration' | 'misaligned' | 'closed-day' | 'outside-hours';

/**
 * Checks a proposed appointment against Luminol consultation hours:
 * 08:00–17:00 Blida time, 15-minute alignment, closed on Friday.
 */
export function checkConsultationSlot(
  startsAt: Date,
  durationMinutes: number,
): ConsultationSlotViolation | null {
  if (!consultationDurationSchema.safeParse(durationMinutes).success) {
    return 'invalid-duration';
  }
  const parts = getZonedParts(startsAt);
  if (
    startsAt.getUTCSeconds() !== 0 ||
    startsAt.getUTCMilliseconds() !== 0 ||
    parts.minute % CONSULTATION_SLOT_MINUTES !== 0
  ) {
    return 'misaligned';
  }
  if (CONSULTATION_CLOSED_WEEKDAYS.includes(parts.weekday)) {
    return 'closed-day';
  }
  const startMinute = parts.hour * 60 + parts.minute;
  if (
    startMinute < CONSULTATION_OPENS_AT_MINUTE ||
    startMinute + durationMinutes > CONSULTATION_CLOSES_AT_MINUTE
  ) {
    return 'outside-hours';
  }
  return null;
}

export function consultationEndsAt(startsAt: Date, durationMinutes: number) {
  return new Date(startsAt.getTime() + durationMinutes * 60_000);
}
