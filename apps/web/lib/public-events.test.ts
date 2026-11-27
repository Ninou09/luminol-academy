import { afterEach, describe, expect, it, vi } from 'vitest';
import { getEventSchedule, selectEventSchedule } from './public-events';
import { GET } from '../app/api/events/[id]/calendar/route';

const title = {
  en: 'Clinical workshop',
  fr: 'Atelier clinique',
  ar: 'ورشة عيادية',
};
const event = { id: 'new-clinical-workshop', title, presenters: [] };

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('the home event schedule', () => {
  it('moves a completed event into the archive at its stated end time', () => {
    const confirmed = {
      ...event,
      date: '2026-11-28',
      endsAt: '2026-11-28T14:00:00+01:00',
    };
    const before = selectEventSchedule(
      [confirmed],
      new Date('2026-11-28T12:59:00Z'),
    );
    expect(before.next?.id).toBe(event.id);
    expect(before.daysUntil).toBe(0);
    const after = selectEventSchedule(
      [confirmed],
      new Date('2026-11-28T13:00:00Z'),
    );
    expect(after.next?.id).not.toBe(event.id);
    expect(after.recent[0]?.id).toBe(event.id);
  });

  it('keeps undated courses out of the calendar and uses the next session date', () => {
    const multi = { ...event, date: '2026-11-28', secondDate: '2026-11-30' };
    const undated = { ...event, id: 'course', date: null };
    const before = selectEventSchedule(
      [multi, undated],
      new Date('2026-11-27T22:00:00Z'),
    );
    expect(before.confirmed.map((item) => item.nextDate)).toEqual([
      '2026-11-28',
    ]);
    const during = selectEventSchedule(
      [multi, undated],
      new Date('2026-11-28T23:00:00Z'),
    );
    expect(during.confirmed.map((item) => item.nextDate)).toEqual([
      '2026-11-30',
    ]);
  });

  it('includes new published CMS events and ignores invalid records', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'eventfixture');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'fixtures');
    const fetch = vi.fn().mockResolvedValue(
      Response.json({
        result: [
          { id: event.id, date: '2026-11-28', title, venue: 'blida' },
          { id: 'invalid', date: '2026-11-99', title, venue: 'blida' },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetch);
    const schedule = await getEventSchedule(new Date('2026-11-27T18:00:00Z'));
    expect(schedule.next).toMatchObject({ id: event.id, venue: 'blida' });
    expect(schedule.confirmed.some((item) => item.id === 'invalid')).toBe(
      false,
    );
    expect(
      (fetch.mock.calls[0]?.[0] as URL).searchParams.get('query'),
    ).toContain('active == true');
  });
});

describe('published schedule and calendar consistency', () => {
  const confirmed = {
    ...event,
    date: '2026-11-28',
    venue: 'blida',
    startsAt: '2026-11-28T10:00:00+01:00',
    endsAt: '2026-11-28T14:00:00+01:00',
  } as const;

  it('keeps cancellations and postponements visible without offering them as entries to book', () => {
    const schedule = selectEventSchedule(
      [
        { ...confirmed, id: 'cancelled-event', scheduleStatus: 'cancelled' },
        { ...confirmed, id: 'postponed-event', scheduleStatus: 'postponed' },
      ],
      new Date('2026-11-27T12:00:00Z'),
    );
    expect(schedule.confirmed).toHaveLength(0);
    expect(schedule.recent).toHaveLength(0);
    expect(schedule.updates.map(({ id }) => id)).toEqual([
      'cancelled-event',
      'postponed-event',
    ]);
  });

  it('uses the same CMS time and venue for calendar downloads and stops offering completed events', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-27T12:00:00Z'));
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'eventfixture');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'fixtures');
    const fetch = vi.fn(async () => Response.json({ result: [confirmed] }));
    vi.stubGlobal('fetch', fetch);
    const args = () =>
      [
        new Request(
          'https://example.com/api/events/new-clinical-workshop/calendar?lang=fr',
        ),
        { params: Promise.resolve({ id: event.id }) },
      ] as const;
    const response = await GET(...args());
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const ics = await response.text();
    expect(ics).toContain('DTSTART:20261128T090000Z');
    expect(ics).toContain('DTEND:20261128T130000Z');
    expect(ics).toContain('LOCATION:Blida');
    vi.setSystemTime(new Date('2026-11-28T13:00:00Z'));
    expect((await GET(...args())).status).toBe(410);
  });
});
