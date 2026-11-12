import { describe, expect, it } from 'vitest';

import {
  getStaffDestinations,
  resolveStaffLanding,
  staffDestinations,
} from './staff-navigation';
import { getStaffNavigationCopy } from './staff-navigation-localization';

describe('staff navigation', () => {
  it('shows consultation workspaces to owners and consultants alike', () => {
    for (const permission of [
      'consultation:manage',
      'consultation:deliver',
    ] as const) {
      expect(
        getStaffDestinations((granted) => granted === permission).map(
          ({ key }) => key,
        ),
      ).toEqual(['consultations', 'clients']);
    }
    expect(
      getStaffDestinations((granted) =>
        ['consultation:deliver', 'office-payment:record'].includes(granted),
      ).map(({ key }) => key),
    ).toEqual(['consultations', 'clients', 'payments']);
  });

  it('shows only destinations the persisted permissions allow', () => {
    const enquiryAgent = getStaffDestinations(
      (permission) => permission === 'enquiry:work',
    );
    expect(enquiryAgent.map(({ key }) => key)).toEqual(['enquiries']);
  });

  it('keeps the owner on the overview and lands staff on their first workspace', () => {
    expect(resolveStaffLanding(() => true)).toBe('/consultations');
    expect(
      resolveStaffLanding(
        (permission) => permission === 'consultation:deliver',
      ),
    ).toBe('/consultations');
    expect(
      resolveStaffLanding((permission) => permission === 'enquiry:work'),
    ).toBe('/enquiries');
    expect(
      resolveStaffLanding((permission) => permission === 'team:manage'),
    ).toBe('/team');
  });

  it('fails closed for accounts without administration capability', () => {
    expect(resolveStaffLanding(() => false)).toBeNull();
    expect(
      resolveStaffLanding((permission) => permission === 'academy:manage'),
    ).toBeNull();
  });

  it.each(['en', 'fr', 'ar'] as const)(
    'labels every destination in %s',
    (locale) => {
      const copy = getStaffNavigationCopy(locale);
      expect(copy.aria).toBeTruthy();
      for (const { key } of staffDestinations) {
        expect(copy.destination[key]).toBeTruthy();
      }
    },
  );
});
