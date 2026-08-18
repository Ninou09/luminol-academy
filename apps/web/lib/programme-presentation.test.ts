import { describe, expect, it } from 'vitest';

import {
  localizeProgrammeDelivery,
  localizeProgrammeViewAction,
} from './programme-presentation';

describe('localizeProgrammeDelivery', () => {
  it.each([
    ['en', 'In person', 'In person'],
    ['en', 'Online', 'Online'],
    ['en', 'Hybrid', 'Hybrid'],
    ['en', 'Flexible', 'Flexible'],
    ['fr', 'In person', 'En présentiel'],
    ['fr', 'Online', 'En ligne'],
    ['fr', 'Hybrid', 'Hybride'],
    ['fr', 'Flexible', 'Flexible'],
    ['ar', 'In person', 'حضوري'],
    ['ar', 'Online', 'عن بُعد'],
    ['ar', 'Hybrid', 'هجين'],
    ['ar', 'Flexible', 'مرن'],
  ] as const)('localizes %s %s', (locale, delivery, expected) => {
    expect(localizeProgrammeDelivery(locale, delivery)).toBe(expected);
  });

  it('preserves unknown governed CMS values', () => {
    expect(localizeProgrammeDelivery('ar', 'Workshop blend')).toBe(
      'Workshop blend',
    );
  });

  it('returns null for empty delivery values', () => {
    expect(localizeProgrammeDelivery('fr', null)).toBeNull();
    expect(localizeProgrammeDelivery('fr', '   ')).toBeNull();
  });
});

describe('localizeProgrammeViewAction', () => {
  it.each([
    ['en', 'View programme'],
    ['fr', 'Voir le programme'],
    ['ar', 'عرض البرنامج'],
  ] as const)(
    'localizes the %s programme detail action',
    (locale, expected) => {
      expect(localizeProgrammeViewAction(locale)).toBe(expected);
    },
  );
});
