import { describe, expect, it } from 'vitest';

import {
  assertCorporateManagerAccess,
  assertCorporateSeatMutationScope,
  assertCorporateSeatTransition,
  canAllocateCorporateSeat,
  canCorporateManagerViewData,
  corporateMembershipSchema,
  corporateOrganizationGovernanceSchema,
  corporateTeamSchema,
  summarizeCorporateProgress,
  summarizeSeatAllocation,
} from './corporate-training';

const organization = {
  organizationId: 'org-1',
  name: 'Luminol Partner Company',
  seatLimit: 3,
};

const seats = [
  {
    seatId: 'seat-1',
    organizationId: 'org-1',
    learnerId: 'learner-1',
    status: 'ACTIVE' as const,
  },
  {
    seatId: 'seat-2',
    organizationId: 'org-1',
    learnerId: 'learner-2',
    status: 'COMPLETED' as const,
  },
  {
    seatId: 'seat-3',
    organizationId: 'org-1',
    learnerId: 'learner-3',
    status: 'REVOKED' as const,
  },
  {
    seatId: 'seat-other',
    organizationId: 'org-2',
    learnerId: 'learner-4',
    status: 'ACTIVE' as const,
  },
];

describe('corporate training seat allocation', () => {
  it('summarizes only seats belonging to the organization', () => {
    expect(summarizeSeatAllocation(organization, seats)).toEqual({
      seatLimit: 3,
      allocatedSeats: 2,
      activeSeats: 1,
      completedSeats: 1,
      availableSeats: 1,
      utilizationPercent: 67,
      isAtCapacity: false,
    });
  });

  it('blocks allocation once the organization reaches capacity', () => {
    const fullSeats = [
      ...seats,
      {
        seatId: 'seat-4',
        organizationId: 'org-1',
        learnerId: 'learner-5',
        status: 'INVITED' as const,
      },
    ];

    expect(canAllocateCorporateSeat(organization, fullSeats)).toBe(false);
  });

  it('allows valid seat lifecycle transitions', () => {
    expect(() =>
      assertCorporateSeatTransition('INVITED', 'ACTIVE'),
    ).not.toThrow();
    expect(() =>
      assertCorporateSeatTransition('ACTIVE', 'COMPLETED'),
    ).not.toThrow();
  });

  it('rejects reopening terminal seat states', () => {
    expect(() => assertCorporateSeatTransition('COMPLETED', 'ACTIVE')).toThrow(
      'Invalid corporate seat transition',
    );
    expect(() => assertCorporateSeatTransition('REVOKED', 'INVITED')).toThrow(
      'Invalid corporate seat transition',
    );
  });

  it('fails closed when a seat mutation targets another organization', () => {
    expect(() =>
      assertCorporateSeatMutationScope('org-1', seats[0]!),
    ).not.toThrow();
    expect(() => assertCorporateSeatMutationScope('org-1', seats[3]!)).toThrow(
      'Corporate seat organization scope mismatch',
    );
  });
});

describe('corporate organization governance', () => {
  it('validates organization lifecycle, memberships and teams', () => {
    expect(
      corporateOrganizationGovernanceSchema.parse({
        organizationId: 'org-1',
        status: 'ACTIVE',
      }),
    ).toEqual({ organizationId: 'org-1', status: 'ACTIVE' });

    expect(
      corporateMembershipSchema.parse({
        membershipId: 'membership-1',
        organizationId: 'org-1',
        userId: 'user-1',
        role: 'MANAGER',
      }),
    ).toEqual({
      membershipId: 'membership-1',
      organizationId: 'org-1',
      userId: 'user-1',
      role: 'MANAGER',
      active: true,
    });

    expect(
      corporateTeamSchema.parse({
        teamId: 'team-1',
        organizationId: 'org-1',
        name: ' Leadership ',
      }),
    ).toEqual({
      teamId: 'team-1',
      organizationId: 'org-1',
      name: 'Leadership',
      archived: false,
    });
  });

  it('requires an active manager or owner in the same organization', () => {
    const manager = {
      membershipId: 'membership-1',
      organizationId: 'org-1',
      userId: 'user-1',
      role: 'MANAGER' as const,
      active: true,
    };

    expect(() => assertCorporateManagerAccess(manager, 'org-1')).not.toThrow();
    expect(() => assertCorporateManagerAccess(manager, 'org-2')).toThrow(
      'Corporate organization scope mismatch',
    );
    expect(() =>
      assertCorporateManagerAccess({ ...manager, active: false }, 'org-1'),
    ).toThrow('Corporate membership is inactive');
    expect(() =>
      assertCorporateManagerAccess({ ...manager, role: 'LEARNER' }, 'org-1'),
    ).toThrow('Corporate manager access required');
  });

  it(
    'allows only aggregate manager data and rejects protected learner data',
    () => {
      expect(
        canCorporateManagerViewData('MANAGER', 'SEAT_UTILIZATION'),
      ).toBe(true);
      expect(canCorporateManagerViewData('OWNER', 'COMPLETION_TOTALS')).toBe(
        true,
      );
      expect(
        canCorporateManagerViewData('MANAGER', 'ASSESSMENT_ANSWERS'),
      ).toBe(false);
      expect(
        canCorporateManagerViewData('MANAGER', 'PSYCHOLOGY_CONTENT'),
      ).toBe(false);
      expect(
        canCorporateManagerViewData('LEARNER', 'ASSIGNMENT_PROGRESS'),
      ).toBe(false);
    },
  );

  it(
    'returns organization-scoped progress aggregates without learner identity',
    () => {
      const summary = summarizeCorporateProgress('org-1', [
        { organizationId: 'org-1', progressPercent: 25, completed: false },
        { organizationId: 'org-1', progressPercent: 100, completed: true },
        { organizationId: 'org-2', progressPercent: 100, completed: true },
      ]);

      expect(summary).toEqual({
        assignmentCount: 2,
        completedAssignments: 1,
        activeAssignments: 1,
        averageProgressPercent: 63,
      });
      expect(Object.keys(summary)).not.toContain('learnerId');
      expect(Object.keys(summary)).not.toContain('userId');
    },
  );
});
