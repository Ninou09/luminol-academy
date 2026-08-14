export const ORGANIZATION_MEMBERSHIP_ROLES = [
  'OWNER',
  'MANAGER',
  'LEARNER',
] as const;

export const ORGANIZATION_SEAT_STATUSES = [
  'INVITED',
  'ACTIVE',
  'COMPLETED',
  'REVOKED',
] as const;

export type OrganizationMembershipRole =
  (typeof ORGANIZATION_MEMBERSHIP_ROLES)[number];
export type OrganizationSeatStatus = (typeof ORGANIZATION_SEAT_STATUSES)[number];

const SEAT_TRANSITIONS: Record<
  OrganizationSeatStatus,
  readonly OrganizationSeatStatus[]
> = {
  INVITED: ['ACTIVE', 'REVOKED'],
  ACTIVE: ['COMPLETED', 'REVOKED'],
  COMPLETED: [],
  REVOKED: [],
};

export function assertOrganizationScope(
  expectedOrganizationId: string,
  actualOrganizationId: string,
) {
  if (!expectedOrganizationId || expectedOrganizationId !== actualOrganizationId) {
    throw new Error('Organization scope mismatch');
  }
}

export function getOrganizationSeatLifecycleUpdate(
  current: OrganizationSeatStatus,
  next: OrganizationSeatStatus,
  now: Date,
) {
  if (!SEAT_TRANSITIONS[current].includes(next)) {
    throw new Error(`Invalid organization seat transition: ${current} -> ${next}`);
  }

  if (next === 'ACTIVE') {
    return {
      status: next,
      activatedAt: now,
      completedAt: null,
      revokedAt: null,
    } as const;
  }

  if (next === 'COMPLETED') {
    return {
      status: next,
      completedAt: now,
      revokedAt: null,
    } as const;
  }

  return {
    status: next,
    revokedAt: now,
  } as const;
}

export type AggregateProgressRecord = {
  progressPercent: number;
  completed: boolean;
};

export function summarizeOrganizationProgress(
  records: readonly AggregateProgressRecord[],
) {
  if (records.length === 0) {
    return {
      assignmentCount: 0,
      completedAssignments: 0,
      averageProgressPercent: 0,
    };
  }

  const completedAssignments = records.filter((record) => record.completed).length;
  const progressTotal = records.reduce((total, record) => {
    const progress = Math.min(100, Math.max(0, record.progressPercent));
    return total + progress;
  }, 0);

  return {
    assignmentCount: records.length,
    completedAssignments,
    averageProgressPercent: Math.round(progressTotal / records.length),
  };
}
