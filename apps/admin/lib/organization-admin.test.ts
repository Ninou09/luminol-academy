import { describe, expect, test } from 'vitest';

import {
  assertOrganizationScope,
  getOrganizationSeatLifecycleUpdate,
  summarizeOrganizationProgress,
} from './organization-admin';

describe('organization administration invariants', () => {
  test('rejects cross-organization scope', () => {
    expect(() => assertOrganizationScope('org-a', 'org-b')).toThrow(
      'Organization scope mismatch',
    );
    expect(() => assertOrganizationScope('org-a', 'org-a')).not.toThrow();
  });

  test('enforces terminal seat lifecycle states', () => {
    const now = new Date('2026-08-14T13:00:00.000Z');

    expect(getOrganizationSeatLifecycleUpdate('INVITED', 'ACTIVE', now)).toEqual({
      status: 'ACTIVE',
      activatedAt: now,
      completedAt: null,
      revokedAt: null,
    });
    expect(() =>
      getOrganizationSeatLifecycleUpdate('COMPLETED', 'ACTIVE', now),
    ).toThrow('Invalid organization seat transition');
    expect(() =>
      getOrganizationSeatLifecycleUpdate('REVOKED', 'ACTIVE', now),
    ).toThrow('Invalid organization seat transition');
  });

  test('summarizes only bounded aggregate progress values', () => {
    expect(
      summarizeOrganizationProgress([
        { progressPercent: 40, completed: false },
        { progressPercent: 120, completed: true },
        { progressPercent: -5, completed: false },
      ]),
    ).toEqual({
      assignmentCount: 3,
      completedAssignments: 1,
      averageProgressPercent: 47,
    });
  });
});
