import { describe, expect, it } from 'vitest';

import {
  ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE,
  protectOrganizationAnalytics,
  summarizeOrganizationAssignments,
  summarizeOrganizationSeatAnalytics,
} from './organization-analytics';

describe('organization analytics privacy helpers', () => {
  it('suppresses groups below the privacy threshold without returning the exact size', () => {
    const protectedValue = protectOrganizationAnalytics(4, {
      completionPercent: 75,
    });

    expect(protectedValue).toEqual({
      state: 'suppressed',
      minimumGroupSize: ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE,
      reason: 'minimum-group-size',
    });
    expect(Object.keys(protectedValue)).not.toContain('groupSize');
  });

  it('returns aggregate values once the minimum group is met', () => {
    expect(protectOrganizationAnalytics(5, { completionPercent: 60 })).toEqual({
      state: 'visible',
      minimumGroupSize: ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE,
      value: { completionPercent: 60 },
    });
  });

  it('summarizes assignments without learner identity', () => {
    const summary = summarizeOrganizationAssignments(8, 3);

    expect(summary).toEqual({
      assignmentCount: 8,
      completedAssignments: 3,
      activeAssignments: 5,
      completionPercent: 38,
    });
    expect(Object.keys(summary)).not.toContain('userId');
  });

  it('summarizes seat utilization without learner identity', () => {
    const summary = summarizeOrganizationSeatAnalytics(12, {
      INVITED: 2,
      ACTIVE: 4,
      COMPLETED: 2,
      REVOKED: 1,
    });

    expect(summary).toEqual({
      seatLimit: 12,
      allocatedSeats: 8,
      invitedSeats: 2,
      activeSeats: 4,
      completedSeats: 2,
      revokedSeats: 1,
      availableSeats: 4,
      utilizationPercent: 67,
    });
  });

  it('rejects impossible assignment totals', () => {
    expect(() => summarizeOrganizationAssignments(2, 3)).toThrow();
  });
});
