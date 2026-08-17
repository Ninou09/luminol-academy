import { z } from 'zod';

export const INSTRUCTOR_COHORT_STATUSES = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
] as const;

export const instructorCohortStatusSchema = z.enum(INSTRUCTOR_COHORT_STATUSES);
export type InstructorCohortStatus = z.infer<typeof instructorCohortStatusSchema>;

export const INSTRUCTOR_ASSIGNMENT_ROLES = [
  'LEAD',
  'ASSISTANT',
  'REVIEWER',
] as const;

export const instructorAssignmentRoleSchema = z.enum(
  INSTRUCTOR_ASSIGNMENT_ROLES,
);
export type InstructorAssignmentRole = z.infer<
  typeof instructorAssignmentRoleSchema
>;

export const instructorCohortAssignmentSchema = z.object({
  cohortId: z.string().min(1),
  instructorUserId: z.string().min(1),
  role: instructorAssignmentRoleSchema,
  active: z.boolean(),
});

export type InstructorCohortAssignment = z.infer<
  typeof instructorCohortAssignmentSchema
>;

export const INSTRUCTOR_COHORT_DATA_KINDS = [
  'cohort-summary',
  'learner-roster',
  'learning-progress',
  'review-workload',
  'delivery-schedule',
  'attendance-state',
  'cohort-aggregate-analytics',
] as const;

export type InstructorCohortDataKind =
  (typeof INSTRUCTOR_COHORT_DATA_KINDS)[number];

export const FORBIDDEN_INSTRUCTOR_DATA_KINDS = [
  'psychology-content',
  'psychology-note',
  'enquiry-message',
  'personal-finance',
  'payment-detail',
  'private-certificate-metadata',
  'raw-learner-authored-text',
  'raw-search-query',
  'session-identifier',
  'ip-address',
  'unrelated-organization-data',
] as const;

export type ForbiddenInstructorDataKind =
  (typeof FORBIDDEN_INSTRUCTOR_DATA_KINDS)[number];

export type InstructorCohortAccessInput = {
  actorUserId: string;
  cohortId: string;
  assignment: InstructorCohortAssignment | null;
  academyOverride?: boolean;
};

export type InstructorCohortAccessDecision =
  | { allowed: true; authority: 'academy-override' | 'instructor-assignment' }
  | {
      allowed: false;
      reason:
        | 'missing-assignment'
        | 'inactive-assignment'
        | 'wrong-instructor'
        | 'wrong-cohort';
    };

function nonEmpty(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${label} is required`);
  return normalized;
}

export function decideInstructorCohortAccess(
  input: InstructorCohortAccessInput,
): InstructorCohortAccessDecision {
  const actorUserId = nonEmpty(input.actorUserId, 'actorUserId');
  const cohortId = nonEmpty(input.cohortId, 'cohortId');

  if (input.academyOverride === true) {
    return { allowed: true, authority: 'academy-override' };
  }

  if (!input.assignment) {
    return { allowed: false, reason: 'missing-assignment' };
  }

  const assignment = instructorCohortAssignmentSchema.parse(input.assignment);
  if (!assignment.active) {
    return { allowed: false, reason: 'inactive-assignment' };
  }
  if (assignment.instructorUserId !== actorUserId) {
    return { allowed: false, reason: 'wrong-instructor' };
  }
  if (assignment.cohortId !== cohortId) {
    return { allowed: false, reason: 'wrong-cohort' };
  }

  return { allowed: true, authority: 'instructor-assignment' };
}

export function assertInstructorCohortAccess(input: InstructorCohortAccessInput) {
  const decision = decideInstructorCohortAccess(input);
  if (!decision.allowed) {
    throw new Error(`Instructor cohort access denied: ${decision.reason}`);
  }
  return decision;
}

export function isInstructorCohortDataKind(
  value: string,
): value is InstructorCohortDataKind {
  return (INSTRUCTOR_COHORT_DATA_KINDS as readonly string[]).includes(value);
}

export function isForbiddenInstructorDataKind(
  value: string,
): value is ForbiddenInstructorDataKind {
  return (FORBIDDEN_INSTRUCTOR_DATA_KINDS as readonly string[]).includes(value);
}
