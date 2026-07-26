import { describe, expect, it } from 'vitest';

import {
  assertCorporateSeatTransition,
  canAllocateCorporateSeat,
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
    expect(() => assertCorporateSeatTransition('INVITED', 'ACTIVE')).not.toThrow();
    expect(() => assertCorporateSeatTransition('ACTIVE', 'COMPLETED')).not.toThrow();
  });

  it('rejects reopening terminal seat states', () => {
    expect(() => assertCorporateSeatTransition('COMPLETED', 'ACTIVE')).toThrow(
      'Invalid corporate seat transition',
    );
    expect(() => assertCorporateSeatTransition('REVOKED', 'INVITED')).toThrow(
      'Invalid corporate seat transition',
    );
  });
});
