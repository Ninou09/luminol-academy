import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { db, getLearnerLearningAnalytics } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const learnerId = `m17-learner-${suffix}`;
const deletedLearnerId = `m17-deleted-learner-${suffix}`;
const activeCourseId = `m17-active-course-${suffix}`;
const completedCourseId = `m17-completed-course-${suffix}`;
const activeCourseSanityId = `m17-sanity-active-${suffix}`;
const completedCourseSanityId = `m17-sanity-completed-${suffix}`;
const lastActivityAt = new Date('2026-08-17T10:30:00.000Z');

suite('Milestone 17 learner analytics read model', () => {
  beforeAll(async () => {
    await db.user.createMany({
      data: [
        {
          id: learnerId,
          clerkId: `m17-clerk-${suffix}`,
          email: `m17-${suffix}@example.test`,
        },
        {
          id: deletedLearnerId,
          clerkId: `m17-deleted-clerk-${suffix}`,
          email: `m17-deleted-${suffix}@example.test`,
          deletedAt: new Date('2026-08-17T00:00:00.000Z'),
        },
      ],
    });

    await db.course.createMany({
      data: [
        {
          id: activeCourseId,
          sanityId: activeCourseSanityId,
          slug: `m17-active-${suffix}`,
          title: 'Milestone 17 active course fixture',
          published: true,
        },
        {
          id: completedCourseId,
          sanityId: completedCourseSanityId,
          slug: `m17-completed-${suffix}`,
          title: 'Milestone 17 completed course fixture',
          published: true,
        },
      ],
    });

    await db.enrollment.createMany({
      data: [
        {
          userId: learnerId,
          courseId: activeCourseId,
          status: 'ACTIVE',
          startedAt: new Date('2026-08-10T00:00:00.000Z'),
        },
        {
          userId: learnerId,
          courseId: completedCourseId,
          status: 'COMPLETED',
          startedAt: new Date('2026-08-01T00:00:00.000Z'),
          completedAt: new Date('2026-08-15T00:00:00.000Z'),
        },
      ],
    });

    await db.learningRecord.createMany({
      data: [
        {
          userId: learnerId,
          courseId: activeCourseId,
          lessonId: `m17-lesson-in-progress-${suffix}`,
          status: 'IN_PROGRESS',
          progress: 60,
          lastActivityAt,
        },
        {
          userId: learnerId,
          courseId: completedCourseId,
          lessonId: `m17-lesson-completed-a-${suffix}`,
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date('2026-08-14T00:00:00.000Z'),
          lastActivityAt: new Date('2026-08-14T00:00:00.000Z'),
        },
        {
          userId: learnerId,
          courseId: completedCourseId,
          lessonId: `m17-lesson-completed-b-${suffix}`,
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date('2026-08-15T00:00:00.000Z'),
          lastActivityAt: new Date('2026-08-15T00:00:00.000Z'),
        },
      ],
    });

    await db.certificate.createMany({
      data: [
        {
          userId: learnerId,
          courseId: completedCourseId,
          serialNumber: `m17-active-cert-${suffix}`,
          status: 'ACTIVE',
        },
        {
          userId: learnerId,
          courseId: completedCourseId,
          serialNumber: `m17-revoked-cert-${suffix}`,
          status: 'REVOKED',
          revokedAt: new Date('2026-08-16T00:00:00.000Z'),
        },
      ],
    });
  });

  afterAll(async () => {
    await db.certificate.deleteMany({ where: { userId: learnerId } });
    await db.learningRecord.deleteMany({ where: { userId: learnerId } });
    await db.enrollment.deleteMany({ where: { userId: learnerId } });
    await db.course.deleteMany({
      where: { id: { in: [activeCourseId, completedCourseId] } },
    });
    await db.user.deleteMany({
      where: { id: { in: [learnerId, deletedLearnerId] } },
    });
    await db.$disconnect();
  });

  test('returns only bounded first-party learning status aggregates', async () => {
    await expect(getLearnerLearningAnalytics(learnerId)).resolves.toEqual({
      activeProgrammes: 1,
      completedProgrammes: 1,
      completedLessons: 2,
      inProgressLessons: 1,
      certificatesEarned: 1,
      lastLearningActivityAt: lastActivityAt,
    });
  });

  test('fails closed for a soft-deleted learner', async () => {
    await expect(
      getLearnerLearningAnalytics(deletedLearnerId),
    ).resolves.toBeNull();
  });

  test('rejects an empty learner id', async () => {
    await expect(getLearnerLearningAnalytics('   ')).rejects.toThrow(TypeError);
  });
});
