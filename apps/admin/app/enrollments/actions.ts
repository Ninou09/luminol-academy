'use server';

import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import type { Prisma } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  enrollmentStatuses,
  isEnrollmentTransitionAllowed,
} from '../../lib/operations';

const createSchema = z.object({
  userId: z.string().min(1).max(128),
  courseId: z.string().min(1).max(128),
});

const transitionSchema = z.object({
  enrollmentId: z.string().min(1).max(128),
  toStatus: z.enum(enrollmentStatuses),
});

export async function createEnrollment(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const input = createSchema.parse({
    userId: formData.get('userId'),
    courseId: formData.get('courseId'),
  });
  const now = new Date();

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const [learner, course, existing] = await Promise.all([
      transaction.user.findFirst({
        where: {
          id: input.userId,
          deletedAt: null,
          roles: {
            some: { role: { key: { in: ['student', 'client'] } } },
          },
        },
        select: { id: true },
      }),
      transaction.course.findFirst({
        where: { id: input.courseId, published: true },
        select: { id: true },
      }),
      transaction.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: input.userId,
            courseId: input.courseId,
          },
        },
        select: { id: true },
      }),
    ]);

    if (!learner || !course) {
      throw new Error('Learner or published course not found');
    }
    if (existing) throw new Error('Learner is already enrolled in this course');

    const enrollment = await transaction.enrollment.create({
      data: {
        userId: learner.id,
        courseId: course.id,
        status: 'ACTIVE',
        startedAt: now,
      },
      select: { id: true },
    });

    await transaction.enrollmentStatusEvent.create({
      data: {
        enrollmentId: enrollment.id,
        actorUserId: administrator.id,
        fromStatus: null,
        toStatus: 'ACTIVE',
      },
    });
  });

  revalidatePath('/');
}

export async function transitionEnrollmentStatus(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const input = transitionSchema.parse({
    enrollmentId: formData.get('enrollmentId'),
    toStatus: formData.get('toStatus'),
  });
  const now = new Date();

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const enrollment = await transaction.enrollment.findUnique({
      where: { id: input.enrollmentId },
      select: {
        id: true,
        status: true,
        startedAt: true,
      },
    });

    if (!enrollment) throw new Error('Enrollment not found');
    if (!isEnrollmentTransitionAllowed(enrollment.status, input.toStatus)) {
      throw new Error('Invalid enrollment status transition');
    }

    const lifecycleDates =
      input.toStatus === 'ACTIVE'
        ? { startedAt: enrollment.startedAt ?? now, completedAt: null }
        : input.toStatus === 'COMPLETED'
          ? { completedAt: now }
          : input.toStatus === 'PENDING'
            ? { startedAt: null, completedAt: null }
            : {};
    const updated = await transaction.enrollment.updateMany({
      where: { id: enrollment.id, status: enrollment.status },
      data: { status: input.toStatus, ...lifecycleDates },
    });

    if (updated.count !== 1) {
      throw new Error('Enrollment was updated by another administrator');
    }

    await transaction.enrollmentStatusEvent.create({
      data: {
        enrollmentId: enrollment.id,
        actorUserId: administrator.id,
        fromStatus: enrollment.status,
        toStatus: input.toStatus,
      },
    });
  });

  revalidatePath('/');
}
