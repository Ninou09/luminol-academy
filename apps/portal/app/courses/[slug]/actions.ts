'use server';

import { AuthorizationError, requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { localizeHref } from '@luminol/localization';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { getPortalRequestLocale } from '../../../lib/request-locale';

const completionSchema = z.object({
  lessonId: z.string().min(1).max(128),
  redirectTo: z
    .string()
    .max(500)
    .refine((value) => value.startsWith('/courses/'), 'Invalid redirect')
    .optional(),
});

export async function completeLesson(formData: FormData) {
  const user = await requireUser();
  const { lessonId, redirectTo } = completionSchema.parse({
    lessonId: formData.get('lessonId'),
    redirectTo: formData.get('redirectTo') || undefined,
  });

  const lesson = await db.lesson.findFirst({
    where: {
      id: lessonId,
      published: true,
      module: {
        published: true,
        course: {
          enrollments: {
            some: { userId: user.id, status: 'ACTIVE' },
          },
        },
      },
    },
    select: {
      id: true,
      module: {
        select: {
          course: { select: { id: true, slug: true } },
        },
      },
    },
  });

  if (!lesson) throw new AuthorizationError();

  const course = lesson.module.course;
  const now = new Date();

  await db.learningRecord.upsert({
    where: {
      userId_courseId_lessonId: {
        userId: user.id,
        courseId: course.id,
        lessonId: lesson.id,
      },
    },
    create: {
      userId: user.id,
      courseId: course.id,
      lessonId: lesson.id,
      status: 'COMPLETED',
      progress: 100,
      startedAt: now,
      completedAt: now,
      lastActivityAt: now,
    },
    update: {
      status: 'COMPLETED',
      progress: 100,
      completedAt: now,
      lastActivityAt: now,
    },
  });

  const publishedLessons = await db.lesson.findMany({
    where: {
      published: true,
      module: { published: true, courseId: course.id },
    },
    select: { id: true },
  });
  const lessonCount = publishedLessons.length;
  const completedCount = await db.learningRecord.count({
    where: {
      userId: user.id,
      courseId: course.id,
      status: 'COMPLETED',
      lessonId: { in: publishedLessons.map(({ id }) => id) },
    },
  });

  if (lessonCount > 0 && completedCount >= lessonCount) {
    await db.$transaction(async (transaction) => {
      const updated = await transaction.enrollment.updateMany({
        where: {
          userId: user.id,
          courseId: course.id,
          status: 'ACTIVE',
        },
        data: { status: 'COMPLETED', completedAt: now },
      });

      if (updated.count === 1) {
        const enrollment = await transaction.enrollment.findUniqueOrThrow({
          where: {
            userId_courseId: { userId: user.id, courseId: course.id },
          },
          select: { id: true },
        });
        await transaction.enrollmentStatusEvent.create({
          data: {
            enrollmentId: enrollment.id,
            actorUserId: user.id,
            fromStatus: 'ACTIVE',
            toStatus: 'COMPLETED',
          },
        });
      }
    });
  }

  revalidatePath('/');
  revalidatePath(`/courses/${course.slug}`);

  if (redirectTo) {
    const locale = await getPortalRequestLocale();
    redirect(localizeHref(locale, redirectTo));
  }
}
