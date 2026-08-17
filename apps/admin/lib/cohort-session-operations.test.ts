import { describe, expect, it } from 'vitest';

import {
  formatSessionDateTimeInput,
  parseSessionWindow,
  parseZonedSessionDateTime,
} from './cohort-session-operations';

describe('cohort session timezone operations', () => {
  it('converts a local cohort session time through its IANA timezone', () => {
    expect(
      parseZonedSessionDateTime('2026-09-01T10:30', 'Africa/Algiers'),
    ).toEqual(new Date('2026-09-01T09:30:00.000Z'));

    expect(
      formatSessionDateTimeInput(
        new Date('2026-09-01T09:30:00.000Z'),
        'Africa/Algiers',
      ),
    ).toBe('2026-09-01T10:30');
  });

  it('respects daylight-saving offsets without storing local wall time as UTC', () => {
    expect(
      parseZonedSessionDateTime('2026-07-15T10:30', 'Europe/Paris'),
    ).toEqual(new Date('2026-07-15T08:30:00.000Z'));
  });

  it('rejects nonexistent local times during a DST jump', () => {
    expect(() =>
      parseZonedSessionDateTime('2026-03-29T02:30', 'Europe/Paris'),
    ).toThrow('Session local time does not exist');
  });

  it('validates the bounded session window through the domain contract', () => {
    expect(
      parseSessionWindow({
        startsAt: '2026-09-01T10:00',
        endsAt: '2026-09-01T12:00',
        timeZone: 'Africa/Algiers',
      }),
    ).toEqual({
      startsAt: new Date('2026-09-01T09:00:00.000Z'),
      endsAt: new Date('2026-09-01T11:00:00.000Z'),
      timeZone: 'Africa/Algiers',
    });

    expect(() =>
      parseSessionWindow({
        startsAt: '2026-09-01T10:00',
        endsAt: '2026-09-01T23:00',
        timeZone: 'Africa/Algiers',
      }),
    ).toThrow();
  });
});
