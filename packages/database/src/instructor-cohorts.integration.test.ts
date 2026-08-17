import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  CohortInstructorRole,
  CohortStatus,
  EnrollmentStatus,
  db,
} from './index';
import {
  getActiveInstructorCohortAssignment,
  getInstructorAssignedCohorts,
} from './instructor-cohorts';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;

const courseAId = `m18-course-a-${suffix}`;
const courseBId = `m18-course-b-${suffix}`;
const cohortAId = `m18-cohort-a-${suffix}`;
const cohortA2Id = `m18-cohort-a2-${suffix}`;
const cohortBId = `m18-cohort-b-${suffix}`;
const instructorId = `m18-instructor-${suffix}`;
const learnerAId = `m18-learner-a-${suffix}`;
const learnerBId = `m18-learner-b-${suffix}`;
let enrollmentAId = '';
let enrollmentBId = '';
let activeAssignmentId = '';
let activeCohortEnrollmentId = '';

suite('Milestone 18 cohort persistence', () => {
  beforeAll(async () => {
    await db.course.createMany({
      data: [
        {
          id: courseAId,
          sanityId: `sanity-m18-a-${suffix}`,
          slug: `m18-a-${suffix}`,
          title: `Milestone 18 A ${suffix}`,
          published: true,
        },
        {
          id: courseBId,
          sanityId: `sanity-m18-b-${suffix}`,
          slug: `m18-b-${suffix}`,
          title: `Milestone 18 B ${suffix}`,
          published: true,
        },
      ],
    });

    await db.user.createMany({
      data: [
        {
          id: instructorId,
          clerkId: `clerk-${instructorId}`,
          email: `instructor-${suffix}@example.test`,
        },
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
      ],
    });

    const enrollmentA = await db.enrollment.create({
      data: {
        userId: learnerAId,
        courseId: courseAId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
    enrollmentAId = enrollmentA.id;

    const enrollmentB = await db.enrollment.create({
      data: {
        userId: learnerBId,
        courseId: courseBId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
    enrollmentBId = enrollmentB.id;

    await db.cohort.createMany({
      data: [
        {
          id: cohortAId,
          courseId: courseAId,
          name: `A Cohort ${suffix}`,
          status: CohortStatus.ACTIVE,
          startsAt: new Date('2026-08-01T09:00:00.000Z'),
          endsAt: new Date('2026-09-01T09:00:00.000Z'),
        },
        {
          id: cohortA2Id,
          courseId: courseAId,
          name: `A2 Cohort ${suffix}`,
          status: CohortStatus.PLANNED,
        },
        {
          id: cohortBId,
          courseId: courseBId,
          name: `B Cohort ${suffix}`,
          status: CohortStatus.ACTIVE,
        },
      ],
    });

    const assignment = await db.cohortInstructorAssignment.create({
      data: {
        cohortId: cohortAId,
        instructorUserId: instructorId,
        role: CohortInstructorRole.LEAD,
      },
    });
    activeAssignmentId = assignment.id;

    const cohortEnrollment = await db.cohortEnrollment.create({
      data: { cohortId: cohortAId, enrollmentId: enrollmentAId },
    });
    activeCohortEnrollmentId = cohortEnrollment.id;
  });

  afterAll(async () => {
    await db.cohortEnrollment.deleteMany({
      where: { cohortId: { in: [cohortAId, cohortA2Id, cohortBId] } },
    });
    await db.cohortInstructorAssignment.deleteMany({
      where: { cohortId: { in: [cohortAId, cohortA2Id, cohortBId] } },
    });
    await db.cohort.deleteMany({
      where: { id: { in: [cohortAId, cohortA2Id, cohortBId] } },
    });
    await db.enrollment.deleteMany({
      where: { id: { in: [enrollmentAId, enrollmentBId].filter(Boolean) } },
    });
    await db.user.deleteMany({
      where: { id: { in: [instructorId, learnerAId, learnerBId] } },
    });
    await db.course.deleteMany({ where: { id: { in: [courseAId, courseBId] } } });
    await db.$disconnect();
  });

  test('resolves only an exact persisted active instructor assignment', async () => {
    await expect(
      getActiveInstructorCohortAssignment(instructorId, cohortAId),
    ).resolves.toEqual({
      cohortId: cohortAId,
      instructorUserId: instructorId,
      role: CohortInstructorRole.LEAD,
      active: true,
    });

    await expect(
      getActiveInstructorCohortAssignment(instructorId, cohortBId),
    ).resolves.toBeNull();

    await expect(getInstructorAssignedCohorts(instructorId)).resolves.toEqual([
      {
        cohortId: cohortAId,
        name: `A Cohort ${suffix}`,
        status: CohortStatus.ACTIVE,
        courseId: courseAId,
        courseTitle: `Milestone 18 A ${suffix}`,
        role: CohortInstructorRole.LEAD,
        startsAt: new Date('2026-08-01T09:00:00.000Z'),
        endsAt: new Date('2026-09-01T09:00:00.000Z'),
      },
    ]);
  });

  test('preserves instructor assignment history while forbidding two active duplicates', async () => {
    await expect(
      db.cohortInstructorAssignment.create({
        data: {
          cohortId: cohortAId,
          instructorUserId: instructorId,
          role: CohortInstructorRole.ASSISTANT,
        },
      }),
    ).rejects.toThrow();

    const endedAt = new Date('2026-08-17T13:45:00.000Z');
    await db.cohortInstructorAssignment.update({
      where: { id: activeAssignmentId },
      data: { active: false, endedAt },
    });

    const replacement = await db.cohortInstructorAssignment.create({
      data: {
        cohortId: cohortAId,
        instructorUserId: instructorId,
        role: CohortInstructorRole.REVIEWER,
      },
    });
    activeAssignmentId = replacement.id;

    await expect(
      db.cohortInstructorAssignment.update({
        where: { id: replacement.id },
        data: { cohortId: cohortA2Id },
      }),
    ).rejects.toThrow();
  });

  test('enforces the cohort course boundary for learner memberships', async () => {
    await expect(
      db.cohortEnrollment.create({
        data: { cohortId: cohortAId, enrollmentId: enrollmentBId },
      }),
    ).rejects.toThrow();
  });

  test('allows only one active cohort membership for an enrollment while preserving history', async () => {
    await expect(
      db.cohortEnrollment.create({
        data: { cohortId: cohortA2Id, enrollmentId: enrollmentAId },
      }),
    ).rejects.toThrow();

    const endedAt = new Date('2026-08-17T13:50:00.000Z');
    await db.cohortEnrollment.update({
      where: { id: activeCohortEnrollmentId },
      data: { active: false, endedAt },
    });

    const replacement = await db.cohortEnrollment.create({
      data: { cohortId: cohortA2Id, enrollmentId: enrollmentAId },
    });
    activeCohortEnrollmentId = replacement.id;

    await expect(
      db.cohortEnrollment.update({
        where: { id: replacement.id },
        data: { cohortId: cohortAId },
      }),
    ).rejects.toThrow();
  });

  test('keeps cohort course identity immutable and validates schedule windows', async () => {
    await expect(
      db.cohort.update({
        where: { id: cohortAId },
        data: { courseId: courseBId },
      }),
    ).rejects.toThrow();

    await expect(
      db.cohort.create({
        data: {
          courseId: courseAId,
          name: `Invalid schedule ${suffix}`,
          startsAt: new Date('2026-09-02T09:00:00.000Z'),
          endsAt: new Date('2026-09-01T09:00:00.000Z'),
        },
      }),
    ).rejects.toThrow();
  });

  test('requires an ended timestamp for inactive historical rows', async () => {
    await expect(
      db.cohortInstructorAssignment.create({
        data: {
          cohortId: cohortBId,
          instructorUserId: instructorId,
          role: CohortInstructorRole.LEAD,
          active: false,
        },
      }),
    ).rejects.toThrow();

    await expect(
      db.cohortEnrollment.create({
        data: {
          cohortId: cohortBId,
          enrollmentId: enrollmentBId,
          active: false,
        },
      }),
    ).rejects.toThrow();
  });
});
