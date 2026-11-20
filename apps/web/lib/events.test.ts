import { describe, expect, it } from 'vitest';
import { familyAfterTrauma, hasEventEnded } from './events';

describe('public meeting dates in Algiers', () => {
  it('ends timed registration at the end shown in the calendar', () => {
    expect(
      hasEventEnded(familyAfterTrauma, new Date('2026-09-25T20:59:59Z')),
    ).toBe(false);
    expect(
      hasEventEnded(familyAfterTrauma, new Date('2026-09-25T21:00:00Z')),
    ).toBe(true);
  });
  it('keeps both session days and undated programmes available', () => {
    const event = {
      ...familyAfterTrauma,
      date: '2026-11-14',
      secondDate: '2026-11-21',
    };
    delete event.endsAt;
    expect(hasEventEnded(event, new Date('2026-11-20T12:00Z'))).toBe(false);
    expect(hasEventEnded(event, new Date('2026-11-21T22:59Z'))).toBe(false);
    expect(hasEventEnded(event, new Date('2026-11-21T23:00Z'))).toBe(true);
    expect(
      hasEventEnded(
        { ...event, date: null, secondDate: '2027-01-15' },
        new Date('2026-11-21T23:00Z'),
      ),
    ).toBe(false);
    expect(
      hasEventEnded({
        id: 'unscheduled',
        date: null,
        title: event.title,
        free: false,
        kind: 'programme',
        presenters: [],
        audience: event.audience,
      }),
    ).toBe(false);
  });
});
