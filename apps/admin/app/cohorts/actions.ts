'use server';

import { requirePlatformPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import type { Prisma } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  COHORT_INSTRUCTOR_ROLES,
  COHORT_STATUSES,
  isCohortStatusTransitionAllowed,
  parseOptionalLocalDateTime,
} from '../../lib/cohort-operations';

const idSchema = z.string().min(1).max(128);
const cohortCreateSchema = z.object({
  courseId: idSchema,
  name: z.string().trim().min(2).max(160),
});
const cohortTransitionSchema = z.object({
  cohortId: idSchema,
  toStatus: z.enum(COHORT_STATUSES),
});
const assignmentSchema = z.object({
  cohortId: idSchema,
  instructorUserId: idSchema,
  role: z.enum(COHORT_INSTRUCTOR_ROLES),
});
const assignmentMutationSchema = z.object({
  cohortId: idSchema,
  assignmentId: idSchema,
});
const reassignSchema = assignmentMutationSchema.extend({
  instructorUserId: idSchema,
  role: z.enum(COHORT_INSTRUCTOR_ROLES),
});
const cohortEnrollmentSchema = z.object({
  cohortId: idSchema,
  enrollmentId: idSchema,
});
const cohortEnrollmentMutationSchema = cohortEnrollmentSchema.extend({
  cohortEnrollmentId: idSchema,
});

type Transaction = Prisma.TransactionClient;

function revalidateCohortSurfaces(cohortId?: string) {
  revalidatePath('/cohorts');
  revalidatePath('/instructor');
  if (cohortId) revalidatePath(`/instructor/cohorts/${cohortId}`);
}

async function requireAssignableInstructor(
  transaction: Transaction,
  instructorUserId: string,
) {
  const instructor = await transaction.user.findFirst({
    where: {
      id: instructorUserId,
      deletedAt: null,
      roles: { some: { role: { key: { in: ['staff', 'admin'] } } } },
    },
    select: { id: true },
  });
  if (!instructor) throw new Error('Assignable instructor not found');
  return instructor;
}

async function requireMutableCohort(transaction: Transaction, cohortId: string) {
  const cohort = await transaction.cohort.findUnique({
    where: { id: cohortId },
    select: { id: true, courseId: true, status: true },
  });
  if (!cohort || cohort.status === 'COMPLETED' || cohort.status === 'CANCELLED') {
    throw new Error('Mutable cohort not found');
  }
  return cohort;
}

export async function createCohort(formData: FormData) {
  await requirePlatformPermission('academy:manage');
  const input = cohortCreateSchema.parse({
    courseId: formData.get('courseId'),
    name: formData.get('name'),
  });
  const startsAt = parseOptionalLocalDateTime(formData.get('startsAt'));
  const endsAt = parseOptionalLocalDateTime(formData.get('endsAt'));
  if (startsAt && endsAt && endsAt < startsAt) {
    throw new Error('Cohort end must not precede start');
  }

  await db.$transaction(async (transaction: Transaction) => {
    const course = await transaction.course.findFirst({
      where: { id: input.courseId, published: true },
      select: { id: true },
    });
    if (!course) throw new Error('Published course not found');

    await transaction.cohort.create({
      data: {
        courseId: course.id,
        name: input.name,
        startsAt,
        endsAt,
        status: 'PLANNED',
      },
    });
  });

  revalidateCohortSurfaces();
}

export async function transitionCohortStatus(formData: FormData) {
  await requirePlatformPermission('academy:manage');
  const input = cohortTransitionSchema.parse({
    cohortId: formData.get('cohortId'),
    toStatus: formData.get('toStatus'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    const cohort = await transaction.cohort.findUnique({
      where: { id: input.cohortId },
      select: { id: true, status: true },
    });
    if (!cohort) throw new Error('Cohort not found');
    if (!isCohortStatusTransitionAllowed(cohort.status, input.toStatus)) {
      throw new Error('Invalid cohort status transition');
    }

    if (input.toStatus === 'ACTIVE') {
      const leadCount = await transaction.cohortInstructorAssignment.count({
        where: { cohortId: cohort.id, active: true, role: 'LEAD' },
      });
      if (leadCount === 0) {
        throw new Error('An active cohort requires a lead instructor');
      }
    }

    const updated = await transaction.cohort.updateMany({
      where: { id: cohort.id, status: cohort.status },
      data: { status: input.toStatus },
    });
    if (updated.count !== 1) {
      throw new Error('Cohort was updated concurrently');
    }
  });

  revalidateCohortSurfaces(input.cohortId);
}

export async function assignCohortInstructor(formData: FormData) {
  await requirePlatformPermission('academy:manage');
  const input = assignmentSchema.parse({
    cohortId: formData.get('cohortId'),
    instructorUserId: formData.get('instructorUserId'),
    role: formData.get('role'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    await requireMutableCohort(transaction, input.cohortId);
    await requireAssignableInstructor(transaction, input.instructorUserId);

    const existing = await transaction.cohortInstructorAssignment.findFirst({
      where: {
        cohortId: input.cohortId,
        instructorUserId: input.instructorUserId,
        active: true,
      },
      select: { id: true },
    });
    if (existing) throw new Error('Instructor already assigned to cohort');

    await transaction.cohortInstructorAssignment.create({
      data: input,
    });
  });

  revalidateCohortSurfaces(input.cohortId);
}

export async function reassignCohortInstructor(formData: FormData) {
  await requirePlatformPermission('academy:manage');
  const input = reassignSchema.parse({
    cohortId: formData.get('cohortId'),
    assignmentId: formData.get('assignmentId'),
    instructorUserId: formData.get('instructorUserId'),
    role: formData.get('role'),
  });
  const now = new Date();

  await db.$transaction(async (transaction: Transaction) => {
    await requireMutableCohort(transaction, input.cohortId);
    await requireAssignableInstructor(transaction, input.instructorUserId);

    const current = await transaction.cohortInstructorAssignment.findFirst({
      where: {
        id: input.assignmentId,
        cohortId: input.cohortId,
        active: true,
      },
      select: { id: true, instructorUserId: true },
    });
    if (!current) throw new Error('Active instructor assignment not found');
    if (current.instructorUserId === input.instructorUserId) {
      throw new Error('Replacement instructor must be different');
    }

    const duplicate = await transaction.cohortInstructorAssignment.findFirst({
      where: {
        cohortId: input.cohortId,
        instructorUserId: input.instructorUserId,
        active: true,
      },
      select: { id: true },
    });
    if (duplicate) throw new Error('Replacement instructor already assigned');

    const ended = await transaction.cohortInstructorAssignment.updateMany({
      where: { id: current.id, active: true },
      data: { active: false, endedAt: now },
    });
    if (ended.count !== 1) {
      throw new Error('Instructor assignment was updated concurrently');
    }

    await transaction.cohortInstructorAssignment.create({
      data: {
        cohortId: input.cohortId,
        instructorUserId: input.instructorUserId,
        role: input.role,
      },
    });
  });

  revalidateCohortSurfaces(input.cohortId);
}

export async function endCohortInstructorAssignment(formData: FormData) {
  await requirePlatformPermission('academy:manage');
  const input = assignmentMutationSchema.parse({
    cohortId: formData.get('cohortId'),
    assignmentId: formData.get('assignmentId'),
  });
  const now = new Date();

  await db.$transaction(async (transaction: Transaction) => {
    const cohort = await requireMutableCohort(transaction, input.cohortId);
    const assignment = await transaction.cohortInstructorAssignment.findFirst({
      where: { id: input.assignmentId, cohortId: cohort.id, active: true },
      select: { id: true, role: true },
    });
    if (!assignment) throw new Error('Active instructor assignment not found');

    if (cohort.status === 'ACTIVE' && assignment.role === 'LEAD') {
      const otherLeadCount = await transaction.cohortInstructorAssignment.count({
        where: {
          cohortId: cohort.id,
          active: true,
          role: 'LEAD',
          id: { not: assignment.id },
        },
      });
      if (otherLeadCount === 0) {
        throw new Error('Active cohort must retain a lead instructor');
      }
    }

    const ended = await transaction.cohortInstructorAssignment.updateMany({
      where: { id: assignment.id, active: true },
      data: { active: false, endedAt: now },
    });
    if (ended.count !== 1) {
      throw new Error('Instructor assignment was updated concurrently');
    }
  });

  revalidateCohortSurfaces(input.cohortId);
}

export async function placeEnrollmentInCohort(formData: FormData) {
  await requirePlatformPermission('academy:manage');
  const input = cohortEnrollmentSchema.parse({
    cohortId: formData.get('cohortId'),
    enrollmentId: formData.get('enrollmentId'),
  });
  const now = new Date();

  await db.$transaction(async (transaction: Transaction) => {
    const cohort = await requireMutableCohort(transaction, input.cohortId);
    const enrollment = await transaction.enrollment.findFirst({
      where: {
        id: input.enrollmentId,
        courseId: cohort.courseId,
        status: { in: ['PENDING', 'ACTIVE'] },
        user: { deletedAt: null },
      },
      select: { id: true },
    });
    if (!enrollment) throw new Error('Eligible enrollment not found');

    const current = await transaction.cohortEnrollment.findFirst({
      where: { enrollmentId: enrollment.id, active: true },
      select: { id: true, cohortId: true },
    });
    if (current?.cohortId === cohort.id) {
      throw new Error('Enrollment already belongs to this cohort');
    }

    if (current) {
      const ended = await transaction.cohortEnrollment.updateMany({
        where: { id: current.id, active: true },
        data: { active: false, endedAt: now },
      });
      if (ended.count !== 1) {
        throw new Error('Cohort enrollment was updated concurrently');
      }
    }

    await transaction.cohortEnrollment.create({
      data: { cohortId: cohort.id, enrollmentId: enrollment.id },
    });
  });

  revalidateCohortSurfaces(input.cohortId);
}

export async function removeEnrollmentFromCohort(formData: FormData) {
  await requirePlatformPermission('academy:manage');
  const input = cohortEnrollmentMutationSchema.parse({
    cohortId: formData.get('cohortId'),
    enrollmentId: formData.get('enrollmentId'),
    cohortEnrollmentId: formData.get('cohortEnrollmentId'),
  });

  const updated = await db.cohortEnrollment.updateMany({
    where: {
      id: input.cohortEnrollmentId,
      cohortId: input.cohortId,
      enrollmentId: input.enrollmentId,
      active: true,
    },
    data: { active: false, endedAt: new Date() },
  });
  if (updated.count !== 1) throw new Error('Active cohort enrollment not found');

  revalidateCohortSurfaces(input.cohortId);
}
