import {
  canCorporateManagerViewData,
  type CorporateMembershipRole,
} from '@luminol/professional';
import { z } from 'zod';

export const ORGANIZATION_MANAGER_ORG_PAGE_SIZE = 10;
export const ORGANIZATION_MANAGER_ROSTER_PAGE_SIZE = 25;
export const ORGANIZATION_MANAGER_TEAM_PAGE_SIZE = 25;
export const ORGANIZATION_MANAGER_COURSE_PAGE_SIZE = 25;

const idSchema = z.string().min(1).max(128);

export const organizationManagerQuerySchema = z.object({
  organizationId: idSchema.optional(),
  organizationPage: z.coerce.number().int().positive().max(10_000).default(1),
  teamId: idSchema.optional(),
  rosterPage: z.coerce.number().int().positive().max(10_000).default(1),
  teamPage: z.coerce.number().int().positive().max(10_000).default(1),
  coursePage: z.coerce.number().int().positive().max(10_000).default(1),
});

export type OrganizationManagerQuery = z.input<
  typeof organizationManagerQuerySchema
>;

export function assertOrganizationManagerAggregatePolicy(
  role: CorporateMembershipRole,
) {
  const allowed = [
    'SEAT_UTILIZATION',
    'ASSIGNMENT_PROGRESS',
    'COMPLETION_TOTALS',
  ] as const;
  const protectedKinds = [
    'ASSESSMENT_ANSWERS',
    'PSYCHOLOGY_CONTENT',
    'ENQUIRY_MESSAGES',
    'PERSONAL_FINANCE',
    'PRIVATE_CERTIFICATE_METADATA',
  ] as const;

  if (!allowed.every((kind) => canCorporateManagerViewData(role, kind))) {
    throw new Error('Organization manager aggregate policy is unavailable');
  }

  if (protectedKinds.some((kind) => canCorporateManagerViewData(role, kind))) {
    throw new Error('Organization manager protected data policy violated');
  }
}

export function summarizeOrganizationManagerSeats(
  seatLimit: number,
  counts: Partial<Record<'INVITED' | 'ACTIVE' | 'COMPLETED' | 'REVOKED', number>>,
) {
  const safeSeatLimit = z.number().int().positive().parse(seatLimit);
  const invited = counts.INVITED ?? 0;
  const active = counts.ACTIVE ?? 0;
  const completed = counts.COMPLETED ?? 0;
  const revoked = counts.REVOKED ?? 0;
  const allocatedSeats = invited + active + completed;

  return {
    seatLimit: safeSeatLimit,
    allocatedSeats,
    invitedSeats: invited,
    activeSeats: active,
    completedSeats: completed,
    revokedSeats: revoked,
    availableSeats: Math.max(0, safeSeatLimit - allocatedSeats),
    utilizationPercent: Math.round((allocatedSeats / safeSeatLimit) * 100),
  };
}

export function summarizeOrganizationManagerProgress(
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
