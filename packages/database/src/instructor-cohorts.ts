import {
  CohortInstructorRole,
  CohortStatus,
} from '../generated/prisma/client';

import { db } from './index';

export type PersistedInstructorCohortAssignment = {
  cohortId: string;
  instructorUserId: string;
  role: CohortInstructorRole;
  active: true;
};

export type InstructorAssignedCohort = {
  cohortId: string;
  name: string;
  status: CohortStatus;
  courseId: string;
  courseTitle: string;
  role: CohortInstructorRole;
  startsAt: Date | null;
  endsAt: Date | null;
};

function normalizeId(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${label} is required`);
  return normalized;
}

/**
 * Resolves the persisted authority used by the Milestone 18 pure authorization
 * contract. A browser-supplied cohort id is only a selector: access exists only
 * when the synchronized, non-deleted actor owns an active assignment to that
 * exact non-cancelled cohort.
 */
export async function getActiveInstructorCohortAssignment(
  instructorUserId: string,
  cohortId: string,
): Promise<PersistedInstructorCohortAssignment | null> {
  const normalizedInstructorUserId = normalizeId(
    instructorUserId,
    'instructorUserId',
  );
  const normalizedCohortId = normalizeId(cohortId, 'cohortId');

  const assignment = await db.cohortInstructorAssignment.findFirst({
    where: {
      instructorUserId: normalizedInstructorUserId,
      cohortId: normalizedCohortId,
      active: true,
      instructor: { deletedAt: null },
      cohort: { status: { not: CohortStatus.CANCELLED } },
    },
    select: {
      cohortId: true,
      instructorUserId: true,
      role: true,
      active: true,
    },
  });

  if (!assignment) return null;
  return { ...assignment, active: true };
}

/**
 * Lists only cohorts backed by an active persisted assignment for the exact
 * synchronized instructor. It deliberately returns no learner identities or
 * organization data; learner/cohort reads remain a separate authorized step.
 */
export async function getInstructorAssignedCohorts(
  instructorUserId: string,
): Promise<InstructorAssignedCohort[]> {
  const normalizedInstructorUserId = normalizeId(
    instructorUserId,
    'instructorUserId',
  );

  const assignments = await db.cohortInstructorAssignment.findMany({
    where: {
      instructorUserId: normalizedInstructorUserId,
      active: true,
      instructor: { deletedAt: null },
      cohort: { status: { not: CohortStatus.CANCELLED } },
    },
    orderBy: [
      { cohort: { startsAt: { sort: 'asc', nulls: 'last' } } },
      { cohort: { name: 'asc' } },
      { id: 'asc' },
    ],
    select: {
      role: true,
      cohort: {
        select: {
          id: true,
          name: true,
          status: true,
          startsAt: true,
          endsAt: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
  });

  return assignments.map(({ role, cohort }) => ({
    cohortId: cohort.id,
    name: cohort.name,
    status: cohort.status,
    courseId: cohort.course.id,
    courseTitle: cohort.course.title,
    role,
    startsAt: cohort.startsAt,
    endsAt: cohort.endsAt,
  }));
}
