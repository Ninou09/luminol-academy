import { describe, expect, it } from 'vitest';

import {
  getStaffDestinations,
  getStaffSidebar,
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
      ).toEqual(['consultations', 'clients', 'sections']);
    }
    expect(
      getStaffDestinations((granted) =>
        ['consultation:deliver', 'office-payment:record'].includes(granted),
      ).map(({ key }) => key),
    ).toEqual(['consultations', 'clients', 'sections', 'payments']);
  });

  it('shows only destinations the persisted permissions allow', () => {
    const enquiryAgent = getStaffDestinations(
      (permission) => permission === 'enquiry:work',
    );
    expect(enquiryAgent.map(({ key }) => key)).toEqual([
      'pipeline',
      'sections',
      'enquiries',
    ]);
  });

  it('keeps the owner on the overview and lands staff on their first workspace', () => {
    expect(resolveStaffLanding(() => true)).toBe('/today');
    expect(
      resolveStaffLanding((permission) =>
        ['task:work', 'enquiry:work'].includes(permission),
      ),
    ).toBe('/today');
    expect(
      resolveStaffLanding(
        (permission) => permission === 'consultation:deliver',
      ),
    ).toBe('/consultations');
    expect(
      resolveStaffLanding((permission) => permission === 'enquiry:work'),
    ).toBe('/crm/pipeline');
    expect(
      resolveStaffLanding((permission) => permission === 'team:manage'),
    ).toBe('/team');
  });

  it('lists the sidebar in the operations order with owner views last', () => {
    expect(getStaffSidebar(() => true).map(({ key }) => key)).toEqual([
      'today',
      'pipeline',
      'clients',
      'consultations',
      'sections',
      'payments',
      'calendar',
      'approvals',
      'tasks',
      'activity',
      'enquiries',
      'dashboard',
      'team',
      'overview',
    ]);
    expect(
      getStaffSidebar((permission) => permission === 'task:work').map(
        ({ key }) => key,
      ),
    ).toEqual(['today', 'approvals', 'tasks']);
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
