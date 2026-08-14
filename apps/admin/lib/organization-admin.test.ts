import { describe, expect, test } from 'vitest';

import {
  assertOrganizationScope,
  getOrganizationSeatLifecycleUpdate,
  ORGANIZATION_ADMIN_COLLECTION_LIMIT,
  ORGANIZATION_MEMBERSHIP_ROLES,
  ORGANIZATION_SEAT_STATUSES,
  ORGANIZATION_SEAT_TRANSITIONS,
} from './organization-admin';

describe('organization administration invariants', () => {
  test('bounds each organization administration collection', () => {
    expect(ORGANIZATION_ADMIN_COLLECTION_LIMIT).toBe(25);
  });

  test('reuses the shared organization domain contract', () => {
    expect(ORGANIZATION_MEMBERSHIP_ROLES).toEqual([
      'OWNER',
      'MANAGER',
      'LEARNER',
    ]);
    expect(ORGANIZATION_SEAT_STATUSES).toEqual([
      'INVITED',
      'ACTIVE',
      'COMPLETED',
      'REVOKED',
    ]);
    expect(ORGANIZATION_SEAT_TRANSITIONS.ACTIVE).toEqual([
      'COMPLETED',
      'REVOKED',
    ]);
  });

  test('rejects cross-organization scope', () => {
    expect(() => assertOrganizationScope('org-a', 'org-b')).toThrow(
      'Corporate organization scope mismatch',
    );
    expect(() => assertOrganizationScope('org-a', 'org-a')).not.toThrow();
  });

  test('enforces terminal seat lifecycle states', () => {
    const now = new Date('2026-08-14T13:00:00.000Z');

    expect(
      getOrganizationSeatLifecycleUpdate('INVITED', 'ACTIVE', now),
    ).toEqual({
      status: 'ACTIVE',
      activatedAt: now,
      completedAt: null,
      revokedAt: null,
    });
    expect(() =>
      getOrganizationSeatLifecycleUpdate('COMPLETED', 'ACTIVE', now),
    ).toThrow('Invalid corporate seat transition');
    expect(() =>
      getOrganizationSeatLifecycleUpdate('REVOKED', 'ACTIVE', now),
    ).toThrow('Invalid corporate seat transition');
  });
});
