import { describe, expect, it } from 'vitest';

import {
  activityAreas,
  mergeActivityLog,
  parseActivityArea,
  parseActivityPeriod,
  type ActivityEntry,
} from './activity-log';
import { getActivityLogCopy } from './activity-log-localization';

const entry = (id: string, minutes: number): ActivityEntry => ({
  id,
  area: 'leads',
  at: new Date(Date.UTC(2026, 10, 13, 9, minutes)),
  title: id,
  subject: null,
  href: null,
  actor: null,
});

describe('activity log', () => {
  it('merges newest first and caps the list', () => {
    const merged = mergeActivityLog(
      [[entry('a', 1), entry('c', 3)], [entry('b', 2)]],
      2,
    );
    expect(merged.map(({ id }) => id)).toEqual(['c', 'b']);
  });

  it('parses only known periods and areas', () => {
    expect(parseActivityPeriod('30')).toBe(30);
    expect(parseActivityPeriod('365')).toBe(7);
    expect(parseActivityArea('payments')).toBe('payments');
    expect(parseActivityArea('secrets')).toBeNull();
  });

  it.each(['en', 'fr', 'ar'] as const)('is localized in %s', (locale) => {
    const copy = getActivityLogCopy(locale);
    for (const area of activityAreas) expect(copy.area[area]).toBeTruthy();
    expect(copy.period('7')).toContain('7');
    expect(copy.paymentRecorded('LUM-1')).toContain('LUM-1');
    expect(copy.roleGranted('consultant')).toContain('consultant');
    expect(copy.limited('200')).toContain('200');
  });
});
