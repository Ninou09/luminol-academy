'use server';

import { requireUser } from '@luminol/auth';
import { CohortAttendanceStatus, db } from '@luminol/database';
import {
  assertAttendanceMutationAccess,
  attendanceStatusSchema,
} from '@luminol/professional';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const idSchema = z.string().trim().min(1).max(128);
const attendanceMutationSchema = z.object({
  cohortId: idSchema,
  sessionId: idSchema,
  cohortEnrollmentId: idSchema,
  status: attendanceStatusSchema,
});

type LockedAssignment = {
  cohortId: string;
  instructorUserId: string;
  role: 'LEAD' | 'ASSISTANT' | 'REVIEWER';
  active: boolean;
};

type LockedSession = {
  id: string;
  cohortId: string;
  title: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
};

type LockedEnrollment = {
  id: string;
  cohortId: string;
  learnerUserId: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
};

export async function recordInstructorAttendance(formData: FormData) {
  const user = await requireUser();
  const input = attendanceMutationSchema.parse({
    cohortId: formData.get('cohortId'),
    sessionId: formData.get('sessionId'),
    cohortEnrollmentId: formData.get('cohortEnrollmentId'),
    status: formData.get('status'),
  });
  const now = new Date();

  await db.$transaction(async (transaction) => {
    const assignments = await transaction.$queryRaw<LockedAssignment[]>`
      SELECT
        assignment."cohortId",
        assignment."instructorUserId",
        assignment."role",
        assignment."active"
      FROM "CohortInstructorAssignment" AS assignment
      JOIN "User" AS instructor ON instructor."id" = assignment."instructorUserId"
      JOIN "Cohort" AS cohort ON cohort."id" = assignment."cohortId"
      WHERE assignment."cohortId" = ${input.cohortId}
        AND assignment."instructorUserId" = ${user.id}
        AND assignment."active" = true
        AND instructor."deletedAt" IS NULL
        AND cohort."status" <> 'CANCELLED'::"CohortStatus"
      ORDER BY assignment."assignedAt" DESC, assignment."id" DESC
      LIMIT 1
      FOR UPDATE OF assignment
    `;

    const sessions = await transaction.$queryRaw<LockedSession[]>`
      SELECT
        "id",
        "cohortId",
        "title",
        "status",
        "startsAt",
        "endsAt",
        "timeZone"
      FROM "CohortSession"
      WHERE "id" = ${input.sessionId}
        AND "cohortId" = ${input.cohortId}
      LIMIT 1
      FOR UPDATE
    `;

    const enrollments = await transaction.$queryRaw<LockedEnrollment[]>`
      SELECT
        membership."id",
        membership."cohortId",
        enrollment."userId" AS "learnerUserId",
        enrollment."status"
      FROM "CohortEnrollment" AS membership
      JOIN "Enrollment" AS enrollment
        ON enrollment."id" = membership."enrollmentId"
      JOIN "User" AS learner ON learner."id" = enrollment."userId"
      WHERE membership."id" = ${input.cohortEnrollmentId}
        AND membership."cohortId" = ${input.cohortId}
        AND membership."active" = true
        AND learner."deletedAt" IS NULL
      LIMIT 1
      FOR UPDATE OF membership
    `;

    const assignment = assignments[0] ?? null;
    const session = sessions[0];
    const enrollment = enrollments[0];
    if (!session || !enrollment) {
      throw new Error('Attendance target unavailable');
    }

    assertAttendanceMutationAccess({
      actorUserId: user.id,
      session: {
        id: session.id,
        cohortId: session.cohortId,
        title: session.title,
        status: session.status,
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
        timeZone: session.timeZone,
      },
      enrollment,
      assignment,
    });

    if (session.startsAt > now) {
      throw new Error(
        'Attendance cannot be recorded before the session starts',
      );
    }

    const existing = await transaction.cohortSessionAttendance.findUnique({
      where: {
        sessionId_cohortEnrollmentId: {
          sessionId: session.id,
          cohortEnrollmentId: enrollment.id,
        },
      },
      select: { id: true },
    });

    const attendance = await transaction.cohortSessionAttendance.upsert({
      where: {
        sessionId_cohortEnrollmentId: {
          sessionId: session.id,
          cohortEnrollmentId: enrollment.id,
        },
      },
      create: {
        sessionId: session.id,
        cohortEnrollmentId: enrollment.id,
        status: CohortAttendanceStatus[input.status],
        recordedByUserId: user.id,
        recordedAt: now,
      },
      update: {
        status: CohortAttendanceStatus[input.status],
        recordedByUserId: user.id,
        recordedAt: now,
      },
      select: { id: true },
    });

    await transaction.cohortDeliveryAuditEvent.create({
      data: {
        id: randomUUID(),
        cohortId: input.cohortId,
        actorUserId: user.id,
        action: existing
          ? 'cohort_session.attendance_updated'
          : 'cohort_session.attendance_recorded',
        subjectType: 'cohortSessionAttendance',
        subjectId: attendance.id,
      },
    });
  });

  revalidatePath(
    `/instructor/cohorts/${input.cohortId}/sessions/${input.sessionId}`,
  );
}
