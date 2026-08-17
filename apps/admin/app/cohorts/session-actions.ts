'use server';

import { requirePlatformPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import type { Prisma } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auditCohortDelivery } from '../../lib/cohort-delivery-audit.server';
import { parseSessionWindow } from '../../lib/cohort-session-operations';

const idSchema = z.string().trim().min(1).max(128);
const titleSchema = z.string().trim().max(160);
const createSessionSchema = z.object({
  cohortId: idSchema,
  title: titleSchema,
});
const sessionMutationSchema = z.object({
  cohortId: idSchema,
  sessionId: idSchema,
});
const rescheduleSessionSchema = sessionMutationSchema.extend({
  title: titleSchema,
});

type Transaction = Prisma.TransactionClient;

type MutableCohort = {
  id: string;
  startsAt: Date | null;
  endsAt: Date | null;
};

type ScheduledSession = {
  id: string;
  status: 'SCHEDULED';
};

function normalizeTitle(value: string) {
  return value === '' ? null : value;
}

function revalidateSessionSurfaces(cohortId: string) {
  revalidatePath('/cohorts');
  revalidatePath('/instructor');
  revalidatePath(`/instructor/cohorts/${cohortId}`);
}

async function requireMutableCohort(
  transaction: Transaction,
  cohortId: string,
): Promise<MutableCohort> {
  const cohorts = await transaction.$queryRaw<MutableCohort[]>`
    SELECT "id", "startsAt", "endsAt"
    FROM "Cohort"
    WHERE "id" = ${cohortId}
      AND "status" IN ('PLANNED'::"CohortStatus", 'ACTIVE'::"CohortStatus")
    FOR UPDATE
  `;
  if (cohorts.length !== 1) throw new Error('Mutable cohort not found');
  return cohorts[0]!;
}

async function requireScheduledSession(
  transaction: Transaction,
  cohortId: string,
  sessionId: string,
): Promise<ScheduledSession> {
  const sessions = await transaction.$queryRaw<ScheduledSession[]>`
    SELECT "id", "status"
    FROM "CohortSession"
    WHERE "id" = ${sessionId}
      AND "cohortId" = ${cohortId}
      AND "status" = 'SCHEDULED'::"CohortSessionStatus"
    FOR UPDATE
  `;
  if (sessions.length !== 1) throw new Error('Scheduled cohort session not found');
  return sessions[0]!;
}

function assertWindowWithinCohort(
  cohort: MutableCohort,
  startsAt: Date,
  endsAt: Date,
) {
  if (cohort.startsAt && startsAt < cohort.startsAt) {
    throw new Error('Session cannot start before the cohort schedule');
  }
  if (cohort.endsAt && endsAt > cohort.endsAt) {
    throw new Error('Session cannot end after the cohort schedule');
  }
}

export async function createCohortSession(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = createSessionSchema.parse({
    cohortId: formData.get('cohortId'),
    title: formData.get('title') ?? '',
  });
  const window = parseSessionWindow({
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt'),
    timeZone: formData.get('timeZone'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    const cohort = await requireMutableCohort(transaction, input.cohortId);
    assertWindowWithinCohort(cohort, window.startsAt, window.endsAt);

    const session = await transaction.cohortSession.create({
      data: {
        cohortId: cohort.id,
        title: normalizeTitle(input.title),
        startsAt: window.startsAt,
        endsAt: window.endsAt,
        timeZone: window.timeZone,
        status: 'SCHEDULED',
      },
      select: { id: true },
    });

    await auditCohortDelivery(
      transaction,
      administrator.id,
      cohort.id,
      'cohort_session.created',
      'cohortSession',
      session.id,
    );
  });

  revalidateSessionSurfaces(input.cohortId);
}

export async function rescheduleCohortSession(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = rescheduleSessionSchema.parse({
    cohortId: formData.get('cohortId'),
    sessionId: formData.get('sessionId'),
    title: formData.get('title') ?? '',
  });
  const window = parseSessionWindow({
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt'),
    timeZone: formData.get('timeZone'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    const cohort = await requireMutableCohort(transaction, input.cohortId);
    await requireScheduledSession(transaction, cohort.id, input.sessionId);
    assertWindowWithinCohort(cohort, window.startsAt, window.endsAt);

    const updated = await transaction.cohortSession.updateMany({
      where: {
        id: input.sessionId,
        cohortId: cohort.id,
        status: 'SCHEDULED',
      },
      data: {
        title: normalizeTitle(input.title),
        startsAt: window.startsAt,
        endsAt: window.endsAt,
        timeZone: window.timeZone,
      },
    });
    if (updated.count !== 1) {
      throw new Error('Cohort session was updated concurrently');
    }

    await auditCohortDelivery(
      transaction,
      administrator.id,
      cohort.id,
      'cohort_session.rescheduled',
      'cohortSession',
      input.sessionId,
    );
  });

  revalidateSessionSurfaces(input.cohortId);
}

export async function cancelCohortSession(formData: FormData) {
  const administrator = await requirePlatformPermission('academy:manage');
  const input = sessionMutationSchema.parse({
    cohortId: formData.get('cohortId'),
    sessionId: formData.get('sessionId'),
  });

  await db.$transaction(async (transaction: Transaction) => {
    const cohort = await requireMutableCohort(transaction, input.cohortId);
    await requireScheduledSession(transaction, cohort.id, input.sessionId);

    const attendanceCount = await transaction.cohortSessionAttendance.count({
      where: { sessionId: input.sessionId },
    });
    if (attendanceCount > 0) {
      throw new Error('A session with attendance records cannot be cancelled');
    }

    const updated = await transaction.cohortSession.updateMany({
      where: {
        id: input.sessionId,
        cohortId: cohort.id,
        status: 'SCHEDULED',
      },
      data: { status: 'CANCELLED' },
    });
    if (updated.count !== 1) {
      throw new Error('Cohort session was updated concurrently');
    }

    await auditCohortDelivery(
      transaction,
      administrator.id,
      cohort.id,
      'cohort_session.cancelled',
      'cohortSession',
      input.sessionId,
    );
  });

  revalidateSessionSurfaces(input.cohortId);
}
