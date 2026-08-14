import { describe, expect, it } from 'vitest';

import {
  assertOrganizationManagerAggregatePolicy,
  ORGANIZATION_MANAGER_COURSE_PAGE_SIZE,
  ORGANIZATION_MANAGER_ORG_PAGE_SIZE,
  ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE,
  ORGANIZATION_MANAGER_TEAM_PAGE_SIZE,
  organizationManagerQuerySchema,
  summarizeOrganizationManagerProgress,
  summarizeOrganizationManagerSeats,
} from './organization-manager';

describe('organization manager workspace', () => {
  it('bounds every pageable manager collection', () => {
    expect(ORGANIZATION_MANAGER_ORG_PAGE_SIZE).toBe(10);
    expect(ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE).toBe(25);
    expect(ORGANIZATION_MANAGER_TEAM_PAGE_SIZE).toBe(25);
    expect(ORGANIZATION_MANAGER_COURSE_PAGE_SIZE).toBe(25);
  });

  it('validates only bounded organization and team identifiers', () => {
    expect(
      organizationManagerQuerySchema.parse({
        organizationId: 'org-1',
        organizationPage: '2',
        teamId: 'team-1',
        rosterPage: '3',
        teamPage: '4',
        coursePage: '5',
      }),
    ).toEqual({
      organizationId: 'org-1',
      organizationPage: 2,
      teamId: 'team-1',
      rosterPage: 3,
      teamPage: 4,
      coursePage: 5,
    });

    expect(() =>
      organizationManagerQuerySchema.parse({ organizationId: '' }),
    ).toThrow();
    expect(() =>
      organizationManagerQuerySchema.parse({ rosterPage: 0 }),
    ).toThrow();
    expect(() =>
      organizationManagerQuerySchema.parse({ coursePage: 10_001 }),
    ).toThrow();
  });

  it('enforces the shared aggregate-only manager policy', () => {
    expect(() => assertOrganizationManagerAggregatePolicy('MANAGER')).not.toThrow();
    expect(() => assertOrganizationManagerAggregatePolicy('OWNER')).not.toThrow();
    expect(() => assertOrganizationManagerAggregatePolicy('LEARNER')).toThrow(
      'Organization manager aggregate policy is unavailable',
    );
  });

  it('summarizes seat utilization without learner identity', () => {
    const summary = summarizeOrganizationManagerSeats(10, {
      INVITED: 2,
      ACTIVE: 3,
      COMPLETED: 1,
      REVOKED: 4,
    });

    expect(summary).toEqual({
      seatLimit: 10,
      allocatedSeats: 6,
      invitedSeats: 2,
      activeSeats: 3,
      completedSeats: 1,
      revokedSeats: 4,
      availableSeats: 4,
      utilizationPercent: 60,
    });
    expect(Object.keys(summary)).not.toContain('userId');
    expect(Object.keys(summary)).not.toContain('learnerId');
  });

  it('summarizes aggregate completion and rejects impossible totals', () => {
    expect(summarizeOrganizationManagerProgress(8, 3)).toEqual({
      assignmentCount: 8,
      completedAssignments: 3,
      activeAssignments: 5,
      completionPercent: 38,
    });
    expect(() => summarizeOrganizationManagerProgress(2, 3)).toThrow();
  });
});
