import { z } from 'zod';

export const ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE = 5;

export type ProtectedOrganizationAnalytics<T> =
  | {
      state: 'visible';
      minimumGroupSize: number;
      value: T;
    }
  | {
      state: 'suppressed';
      minimumGroupSize: number;
      reason: 'minimum-group-size';
    };

export function protectOrganizationAnalytics<T>(
  groupSize: number,
  value: T,
): ProtectedOrganizationAnalytics<T> {
  const validatedGroupSize = z.number().int().nonnegative().parse(groupSize);

  if (validatedGroupSize < ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE) {
    return {
      state: 'suppressed',
      minimumGroupSize: ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE,
      reason: 'minimum-group-size',
    };
  }

  return {
    state: 'visible',
    minimumGroupSize: ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE,
    value,
  };
}

export function summarizeOrganizationAssignments(
  assignmentCount: number,
  completedAssignments: number,
) {
  const assignments = z.number().int().nonnegative().parse(assignmentCount);
  const completed = z
    .number()
    .int()
    .nonnegative()
    .max(assignments)
    .parse(completedAssignments);

  return {
    assignmentCount: assignments,
    completedAssignments: completed,
    activeAssignments: assignments - completed,
    completionPercent:
      assignments === 0 ? 0 : Math.round((completed / assignments) * 100),
  };
}

export function summarizeOrganizationSeatAnalytics(
  seatLimit: number,
  counts: Partial<
    Record<'INVITED' | 'ACTIVE' | 'COMPLETED' | 'REVOKED', number>
  >,
) {
  const limit = z.number().int().positive().parse(seatLimit);
  const invited = z
    .number()
    .int()
    .nonnegative()
    .parse(counts.INVITED ?? 0);
  const active = z
    .number()
    .int()
    .nonnegative()
    .parse(counts.ACTIVE ?? 0);
  const completed = z
    .number()
    .int()
    .nonnegative()
    .parse(counts.COMPLETED ?? 0);
  const revoked = z
    .number()
    .int()
    .nonnegative()
    .parse(counts.REVOKED ?? 0);
  const allocated = invited + active + completed;

  return {
    seatLimit: limit,
    allocatedSeats: allocated,
    invitedSeats: invited,
    activeSeats: active,
    completedSeats: completed,
    revokedSeats: revoked,
    availableSeats: Math.max(0, limit - allocated),
    utilizationPercent: Math.round((allocated / limit) * 100),
  };
}
