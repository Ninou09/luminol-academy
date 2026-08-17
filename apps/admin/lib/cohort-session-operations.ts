import {
  cohortSessionWindowSchema,
  ianaTimeZoneSchema,
} from '@luminol/professional';

const localDateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getOffsetMilliseconds(date: Date, timeZone: string) {
  const zoned = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second,
  );
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

export function parseZonedSessionDateTime(
  value: FormDataEntryValue | null,
  timeZone: string,
) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Session date and time are required');
  }
  ianaTimeZoneSchema.parse(timeZone);

  const match = localDateTimePattern.exec(value.trim());
  if (!match) throw new Error('Invalid session date and time');

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText ?? '0');

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const firstGuess = new Date(naiveUtc);
  const firstOffset = getOffsetMilliseconds(firstGuess, timeZone);
  let instant = new Date(naiveUtc - firstOffset);
  const resolvedOffset = getOffsetMilliseconds(instant, timeZone);
  if (resolvedOffset !== firstOffset) {
    instant = new Date(naiveUtc - resolvedOffset);
  }

  const resolved = getZonedParts(instant, timeZone);
  if (
    resolved.year !== year ||
    resolved.month !== month ||
    resolved.day !== day ||
    resolved.hour !== hour ||
    resolved.minute !== minute ||
    resolved.second !== second
  ) {
    throw new Error(
      'Session local time does not exist in the selected timezone',
    );
  }

  return instant;
}

export function parseSessionWindow(input: {
  startsAt: FormDataEntryValue | null;
  endsAt: FormDataEntryValue | null;
  timeZone: FormDataEntryValue | null;
}) {
  if (typeof input.timeZone !== 'string') {
    throw new Error('Session timezone is required');
  }
  const timeZone = ianaTimeZoneSchema.parse(input.timeZone.trim());
  const startsAt = parseZonedSessionDateTime(input.startsAt, timeZone);
  const endsAt = parseZonedSessionDateTime(input.endsAt, timeZone);

  cohortSessionWindowSchema.parse({
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    timeZone,
  });

  return { startsAt, endsAt, timeZone };
}

export function formatSessionDateTimeInput(date: Date, timeZone: string) {
  ianaTimeZoneSchema.parse(timeZone);
  const parts = getZonedParts(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}
