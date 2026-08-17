import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS,
  ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
  CertificateStatus,
  EnrollmentStatus,
  LearningRecordStatus,
  PlacementAttemptStatus,
  db,
  getAcademyProgrammeAnalytics,
} from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const visibleCourseId = `m17-academy-visible-${suffix}`;
const suppressedCourseId = `m17-academy-suppressed-${suffix}`;
const draftCourseId = `m17-academy-draft-${suffix}`;
const assessmentId = `m17-academy-assessment-${suffix}`;
const userIds = Array.from(
  { length: 9 },
  (_, index) => `m17-academy-user-${index}-${suffix}`,
);
const now = new Date('2026-08-17T12:00:00.000Z');

suite('Milestone 17 academy analytics read model', () => {
  beforeAll(async () => {
    await db.course.createMany({
      data: [
        {
          id: visibleCourseId,
          sanityId: `sanity-visible-${suffix}`,
          slug: `visible-${suffix}`,
          title: `A visible programme ${suffix}`,
          published: true,
        },
        {
          id: suppressedCourseId,
          sanityId: `sanity-suppressed-${suffix}`,
          slug: `suppressed-${suffix}`,
          title: `B suppressed programme ${suffix}`,
          published: true,
        },
        {
          id: draftCourseId,
          sanityId: `sanity-draft-${suffix}`,
          slug: `draft-${suffix}`,
          title: `C draft programme ${suffix}`,
          published: false,
        },
      ],
    });

    await db.user.createMany({
      data: userIds.map((id, index) => ({
        id,
        clerkId: `clerk-${id}`,
        email: `${index}-${suffix}@example.test`,
      })),
    });

    await db.enrollment.createMany({
      data: [
        {
          userId: userIds[0]!,
          courseId: visibleCourseId,
          status: EnrollmentStatus.ACTIVE,
        },
        {
          userId: userIds[1]!,
          courseId: visibleCourseId,
          status: EnrollmentStatus.ACTIVE,
        },
        {
          userId: userIds[2]!,
          courseId: visibleCourseId,
          status: EnrollmentStatus.COMPLETED,
        },
        {
          userId: userIds[3]!,
          courseId: visibleCourseId,
          status: EnrollmentStatus.COMPLETED,
        },
        {
          userId: userIds[4]!,
          courseId: visibleCourseId,
          status: EnrollmentStatus.CANCELLED,
        },
        ...userIds.slice(5).map((userId) => ({
          userId,
          courseId: suppressedCourseId,
          status: EnrollmentStatus.ACTIVE,
        })),
      ],
    });

    await db.learningRecord.createMany({
      data: [
        {
          userId: userIds[0]!,
          courseId: visibleCourseId,
          lessonId: `recent-1-${suffix}`,
          status: LearningRecordStatus.IN_PROGRESS,
          lastActivityAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
        {
          userId: userIds[1]!,
          courseId: visibleCourseId,
          lessonId: `recent-2-${suffix}`,
          status: LearningRecordStatus.COMPLETED,
          lastActivityAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          userId: userIds[2]!,
          courseId: visibleCourseId,
          lessonId: `old-${suffix}`,
          status: LearningRecordStatus.COMPLETED,
          lastActivityAt: new Date(
            now.getTime() -
              (ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS + 1) *
                24 *
                60 *
                60 *
                1000,
          ),
        },
      ],
    });

    await db.certificate.createMany({
      data: [
        {
          userId: userIds[0]!,
          courseId: visibleCourseId,
          status: CertificateStatus.ACTIVE,
        },
        {
          userId: userIds[1]!,
          courseId: visibleCourseId,
          status: CertificateStatus.ACTIVE,
        },
        {
          userId: userIds[2]!,
          courseId: visibleCourseId,
          status: CertificateStatus.REVOKED,
          revokedAt: now,
        },
      ],
    });

    await db.placementAssessment.create({
      data: {
        id: assessmentId,
        courseId: visibleCourseId,
        title: `Assessment ${suffix}`,
        targetLanguage: 'English',
        published: true,
      },
    });
    await db.placementAttempt.createMany({
      data: [
        {
          assessmentId,
          userId: userIds[0]!,
          status: PlacementAttemptStatus.REVIEW_REQUIRED,
        },
        {
          assessmentId,
          userId: userIds[1]!,
          status: PlacementAttemptStatus.REVIEW_REQUIRED,
        },
        {
          assessmentId,
          userId: userIds[2]!,
          status: PlacementAttemptStatus.COMPLETED,
        },
      ],
    });
  });

  afterAll(async () => {
    await db.placementAttempt.deleteMany({ where: { assessmentId } });
    await db.placementAssessment.deleteMany({ where: { id: assessmentId } });
    await db.certificate.deleteMany({
      where: { courseId: { in: [visibleCourseId, suppressedCourseId] } },
    });
    await db.learningRecord.deleteMany({
      where: { courseId: { in: [visibleCourseId, suppressedCourseId] } },
    });
    await db.enrollment.deleteMany({
      where: { courseId: { in: [visibleCourseId, suppressedCourseId] } },
    });
    await db.course.deleteMany({
      where: {
        id: { in: [visibleCourseId, suppressedCourseId, draftCourseId] },
      },
    });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.$disconnect();
  });

  test('returns detailed aggregates only for sufficiently large published programmes', async () => {
    const analytics = await getAcademyProgrammeAnalytics(now);
    const visible = analytics.find(
      ({ courseId }) => courseId === visibleCourseId,
    );
    const suppressed = analytics.find(
      ({ courseId }) => courseId === suppressedCourseId,
    );

    expect(visible).toEqual({
      state: 'visible',
      courseId: visibleCourseId,
      title: `A visible programme ${suffix}`,
      participantCount: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
      minimumGroupSize: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
      activeEnrollments: 2,
      completedEnrollments: 2,
      recentLearningRecords: 2,
      activeCertificates: 2,
      reviewRequiredAttempts: 2,
    });
    expect(suppressed).toEqual({
      state: 'suppressed',
      courseId: suppressedCourseId,
      title: `B suppressed programme ${suffix}`,
      participantCount: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE - 1,
      minimumGroupSize: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
    });
    expect(analytics.some(({ courseId }) => courseId === draftCourseId)).toBe(
      false,
    );
  });

  test('rejects an invalid activity-window anchor', async () => {
    await expect(
      getAcademyProgrammeAnalytics(new Date(Number.NaN)),
    ).rejects.toThrow('now must be a valid date');
  });
});
