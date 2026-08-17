import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  CohortAttendanceStatus,
  CohortSessionStatus,
  CohortStatus,
  EnrollmentStatus,
  db,
} from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;

const courseId = `m19-course-${suffix}`;
const cohortAId = `m19-cohort-a-${suffix}`;
const cohortBId = `m19-cohort-b-${suffix}`;
const completedCohortId = `m19-cohort-completed-${suffix}`;
const learnerAId = `m19-learner-a-${suffix}`;
const learnerBId = `m19-learner-b-${suffix}`;
const recorderId = `m19-recorder-${suffix}`;
const sessionAId = `m19-session-a-${suffix}`;
const cancelledSessionId = `m19-session-cancelled-${suffix}`;
let enrollmentAId = '';
let enrollmentBId = '';
let cohortEnrollmentAId = '';
let cohortEnrollmentBId = '';
let attendanceId = '';

suite('Milestone 19 session and attendance persistence', () => {
  beforeAll(async () => {
    await db.course.create({
      data: {
        id: courseId,
        sanityId: `sanity-m19-${suffix}`,
        slug: `m19-${suffix}`,
        title: `Milestone 19 ${suffix}`,
        published: true,
      },
    });

    await db.user.createMany({
      data: [
        {
          id: learnerAId,
          clerkId: `clerk-${learnerAId}`,
          email: `learner-a-${suffix}@example.test`,
        },
        {
          id: learnerBId,
          clerkId: `clerk-${learnerBId}`,
          email: `learner-b-${suffix}@example.test`,
        },
        {
          id: recorderId,
          clerkId: `clerk-${recorderId}`,
          email: `recorder-${suffix}@example.test`,
        },
      ],
    });

    const [enrollmentA, enrollmentB] = await Promise.all([
      db.enrollment.create({
        data: {
          userId: learnerAId,
          courseId,
          status: EnrollmentStatus.ACTIVE,
        },
      }),
      db.enrollment.create({
        data: {
          userId: learnerBId,
          courseId,
          status: EnrollmentStatus.ACTIVE,
        },
      }),
    ]);
    enrollmentAId = enrollmentA.id;
    enrollmentBId = enrollmentB.id;

    await db.cohort.createMany({
      data: [
        {
          id: cohortAId,
          courseId,
          name: `M19 A ${suffix}`,
          status: CohortStatus.ACTIVE,
        },
        {
          id: cohortBId,
          courseId,
          name: `M19 B ${suffix}`,
          status: CohortStatus.ACTIVE,
        },
        {
          id: completedCohortId,
          courseId,
          name: `M19 completed ${suffix}`,
          status: CohortStatus.COMPLETED,
        },
      ],
    });

    const [membershipA, membershipB] = await Promise.all([
      db.cohortEnrollment.create({
        data: { cohortId: cohortAId, enrollmentId: enrollmentAId },
      }),
      db.cohortEnrollment.create({
        data: { cohortId: cohortBId, enrollmentId: enrollmentBId },
      }),
    ]);
    cohortEnrollmentAId = membershipA.id;
    cohortEnrollmentBId = membershipB.id;

    await db.cohortSession.createMany({
      data: [
        {
          id: sessionAId,
          cohortId: cohortAId,
          title: 'Session A',
          status: CohortSessionStatus.SCHEDULED,
          startsAt: new Date('2026-09-01T09:00:00.000Z'),
          endsAt: new Date('2026-09-01T11:00:00.000Z'),
          timeZone: 'Africa/Algiers',
        },
        {
          id: cancelledSessionId,
          cohortId: cohortAId,
          title: 'Cancelled session',
          status: CohortSessionStatus.CANCELLED,
          startsAt: new Date('2026-09-02T09:00:00.000Z'),
          endsAt: new Date('2026-09-02T10:00:00.000Z'),
          timeZone: 'Africa/Algiers',
        },
      ],
    });
  });

  afterAll(async () => {
    await db.cohortSessionAttendance.deleteMany({
      where: { session: { cohortId: { in: [cohortAId, cohortBId] } } },
    });
    await db.cohortSession.deleteMany({
      where: { cohortId: { in: [cohortAId, cohortBId, completedCohortId] } },
    });
    await db.cohortEnrollment.deleteMany({
      where: { cohortId: { in: [cohortAId, cohortBId, completedCohortId] } },
    });
    await db.cohort.deleteMany({
      where: { id: { in: [cohortAId, cohortBId, completedCohortId] } },
    });
    await db.enrollment.deleteMany({
      where: { id: { in: [enrollmentAId, enrollmentBId].filter(Boolean) } },
    });
    await db.user.deleteMany({
      where: { id: { in: [learnerAId, learnerBId, recorderId] } },
    });
    await db.course.deleteMany({ where: { id: courseId } });
    await db.$disconnect();
  });

  test('persists one scoped attendance record per learner and session', async () => {
    const attendance = await db.cohortSessionAttendance.create({
      data: {
        sessionId: sessionAId,
        cohortEnrollmentId: cohortEnrollmentAId,
        status: CohortAttendanceStatus.PRESENT,
        recordedByUserId: recorderId,
      },
    });
    attendanceId = attendance.id;

    await expect(
      db.cohortSessionAttendance.create({
        data: {
          sessionId: sessionAId,
          cohortEnrollmentId: cohortEnrollmentAId,
          status: CohortAttendanceStatus.LATE,
          recordedByUserId: recorderId,
        },
      }),
    ).rejects.toThrow();

    await expect(
      db.cohortSessionAttendance.update({
        where: { id: attendance.id },
        data: { status: CohortAttendanceStatus.LATE },
      }),
    ).resolves.toMatchObject({
      id: attendance.id,
      status: CohortAttendanceStatus.LATE,
      recordedByUserId: recorderId,
    });
  });

  test('rejects attendance for a membership from another cohort', async () => {
    await expect(
      db.cohortSessionAttendance.create({
        data: {
          sessionId: sessionAId,
          cohortEnrollmentId: cohortEnrollmentBId,
          status: CohortAttendanceStatus.PRESENT,
          recordedByUserId: recorderId,
        },
      }),
    ).rejects.toThrow();
  });

  test('rejects attendance for cancelled sessions and inactive learner membership', async () => {
    await expect(
      db.cohortSessionAttendance.create({
        data: {
          sessionId: cancelledSessionId,
          cohortEnrollmentId: cohortEnrollmentAId,
          status: CohortAttendanceStatus.EXCUSED,
          recordedByUserId: recorderId,
        },
      }),
    ).rejects.toThrow();

    await db.cohortEnrollment.update({
      where: { id: cohortEnrollmentBId },
      data: {
        active: false,
        endedAt: new Date('2026-09-03T12:00:00.000Z'),
      },
    });

    const cohortBSession = await db.cohortSession.create({
      data: {
        cohortId: cohortBId,
        startsAt: new Date('2026-09-04T09:00:00.000Z'),
        endsAt: new Date('2026-09-04T10:00:00.000Z'),
        timeZone: 'Africa/Algiers',
      },
    });

    await expect(
      db.cohortSessionAttendance.create({
        data: {
          sessionId: cohortBSession.id,
          cohortEnrollmentId: cohortEnrollmentBId,
          status: CohortAttendanceStatus.ABSENT,
          recordedByUserId: recorderId,
        },
      }),
    ).rejects.toThrow();
  });

  test('prevents sessions on completed cohorts and invalid session windows', async () => {
    await expect(
      db.cohortSession.create({
        data: {
          cohortId: completedCohortId,
          startsAt: new Date('2026-09-05T09:00:00.000Z'),
          endsAt: new Date('2026-09-05T10:00:00.000Z'),
          timeZone: 'Africa/Algiers',
        },
      }),
    ).rejects.toThrow();

    await expect(
      db.cohortSession.create({
        data: {
          cohortId: cohortAId,
          startsAt: new Date('2026-09-05T09:00:00.000Z'),
          endsAt: new Date('2026-09-05T22:00:01.000Z'),
          timeZone: 'Africa/Algiers',
        },
      }),
    ).rejects.toThrow();

    await expect(
      db.cohortSession.create({
        data: {
          cohortId: cohortAId,
          startsAt: new Date('2026-09-06T10:00:00.000Z'),
          endsAt: new Date('2026-09-06T09:00:00.000Z'),
          timeZone: 'Africa/Algiers',
        },
      }),
    ).rejects.toThrow();
  });

  test('keeps session and attendance scope identities immutable', async () => {
    await expect(
      db.cohortSession.update({
        where: { id: sessionAId },
        data: { cohortId: cohortBId },
      }),
    ).rejects.toThrow();

    await expect(
      db.cohortSessionAttendance.update({
        where: { id: attendanceId },
        data: { cohortEnrollmentId: cohortEnrollmentBId },
      }),
    ).rejects.toThrow();
  });
});
