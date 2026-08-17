import { z } from 'zod';

import {
  decideInstructorCohortAccess,
  instructorCohortAssignmentSchema,
  type InstructorCohortAccessDecision,
} from './instructor-cohorts';

export const COHORT_SESSION_STATUSES = [
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
] as const;

export const cohortSessionStatusSchema = z.enum(COHORT_SESSION_STATUSES);
export type CohortSessionStatus = z.infer<typeof cohortSessionStatusSchema>;

export const ATTENDANCE_STATUSES = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
] as const;

export const attendanceStatusSchema = z.enum(ATTENDANCE_STATUSES);
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;

export const ATTENDANCE_ENROLLMENT_STATUSES = [
  'PENDING',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
] as const;

export const attendanceEnrollmentStatusSchema = z.enum(
  ATTENDANCE_ENROLLMENT_STATUSES,
);
export type AttendanceEnrollmentStatus = z.infer<
  typeof attendanceEnrollmentStatusSchema
>;

const explicitInstantSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      /(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
      Number.isFinite(Date.parse(value)),
    'A valid timestamp with an explicit UTC offset is required.',
  );

export const ianaTimeZoneSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: value }).format();
      return true;
    } catch {
      return false;
    }
  }, 'A valid IANA timezone is required.');

const MAX_SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

export const cohortSessionWindowSchema = z
  .object({
    startsAt: explicitInstantSchema,
    endsAt: explicitInstantSchema,
    timeZone: ianaTimeZoneSchema,
  })
  .superRefine((window, context) => {
    const startsAt = Date.parse(window.startsAt);
    const endsAt = Date.parse(window.endsAt);
    const duration = endsAt - startsAt;

    if (duration <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'Session end must be after session start.',
      });
      return;
    }

    if (duration > MAX_SESSION_DURATION_MS) {
      context.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'A cohort session cannot exceed 12 hours.',
      });
    }
  });

export const cohortSessionSchema = z
  .object({
    id: z.string().trim().min(1),
    cohortId: z.string().trim().min(1),
    title: z.string().trim().min(1).max(160).nullish(),
    status: cohortSessionStatusSchema,
    startsAt: explicitInstantSchema,
    endsAt: explicitInstantSchema,
    timeZone: ianaTimeZoneSchema,
  })
  .superRefine((session, context) => {
    const result = cohortSessionWindowSchema.safeParse(session);
    if (!result.success) {
      for (const issue of result.error.issues) {
        context.addIssue({
          code: 'custom',
          path: issue.path,
          message: issue.message,
        });
      }
    }
  });

export type CohortSession = z.infer<typeof cohortSessionSchema>;

export const attendanceEnrollmentSchema = z.object({
  id: z.string().trim().min(1),
  cohortId: z.string().trim().min(1),
  learnerUserId: z.string().trim().min(1),
  status: attendanceEnrollmentStatusSchema,
});

export type AttendanceEnrollment = z.infer<typeof attendanceEnrollmentSchema>;

export const cohortSessionAttendanceSchema = z.object({
  sessionId: z.string().trim().min(1),
  cohortId: z.string().trim().min(1),
  enrollmentId: z.string().trim().min(1),
  learnerUserId: z.string().trim().min(1),
  status: attendanceStatusSchema,
  recordedAt: explicitInstantSchema,
});

export type CohortSessionAttendance = z.infer<
  typeof cohortSessionAttendanceSchema
>;

const SESSION_TRANSITIONS: Record<
  CohortSessionStatus,
  readonly CohortSessionStatus[]
> = {
  SCHEDULED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionCohortSession(
  from: CohortSessionStatus,
  to: CohortSessionStatus,
): boolean {
  return SESSION_TRANSITIONS[from].includes(to);
}

export function canScheduleSessionForCohort(
  cohortStatus: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
): boolean {
  return cohortStatus === 'PLANNED' || cohortStatus === 'ACTIVE';
}

export type AttendanceMutationInput = {
  actorUserId: string;
  session: CohortSession;
  enrollment: AttendanceEnrollment;
  assignment: z.input<typeof instructorCohortAssignmentSchema> | null;
  academyOverride?: boolean;
};

type InstructorDenialReason = Extract<
  InstructorCohortAccessDecision,
  { allowed: false }
>['reason'];

export type AttendanceMutationDecision =
  | {
      allowed: true;
      authority: 'academy-override' | 'instructor-assignment';
    }
  | {
      allowed: false;
      reason:
        | InstructorDenialReason
        | 'cancelled-session'
        | 'wrong-enrollment-cohort'
        | 'inactive-enrollment'
        | 'reviewer-read-only';
    };

export function decideAttendanceMutationAccess(
  input: AttendanceMutationInput,
): AttendanceMutationDecision {
  const session = cohortSessionSchema.parse(input.session);
  const enrollment = attendanceEnrollmentSchema.parse(input.enrollment);

  if (session.status === 'CANCELLED') {
    return { allowed: false, reason: 'cancelled-session' };
  }

  if (enrollment.cohortId !== session.cohortId) {
    return { allowed: false, reason: 'wrong-enrollment-cohort' };
  }

  if (enrollment.status !== 'ACTIVE') {
    return { allowed: false, reason: 'inactive-enrollment' };
  }

  const assignment = input.assignment
    ? instructorCohortAssignmentSchema.parse(input.assignment)
    : null;
  const instructorDecision = decideInstructorCohortAccess({
    actorUserId: input.actorUserId,
    cohortId: session.cohortId,
    assignment,
    academyOverride: input.academyOverride,
  });

  if (!instructorDecision.allowed) return instructorDecision;

  if (
    instructorDecision.authority === 'instructor-assignment' &&
    assignment?.role === 'REVIEWER'
  ) {
    return { allowed: false, reason: 'reviewer-read-only' };
  }

  return instructorDecision;
}

export function assertAttendanceMutationAccess(input: AttendanceMutationInput) {
  const decision = decideAttendanceMutationAccess(input);
  if (!decision.allowed) {
    throw new Error(`Attendance mutation access denied: ${decision.reason}`);
  }
  return decision;
}
