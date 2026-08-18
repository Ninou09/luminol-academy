import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
  EnrollmentStatus,
  db,
  getAcademyProfessionalProjectAnalytics,
} from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const visibleCourseId = `m20-prof-analytics-visible-${suffix}`;
const suppressedCourseId = `m20-prof-analytics-suppressed-${suffix}`;
const visibleProjectId = `m20-prof-project-visible-${suffix}`;
const suppressedProjectId = `m20-prof-project-suppressed-${suffix}`;
const reviewerId = `m20-prof-reviewer-${suffix}`;
const visibleLearnerIds = Array.from(
  { length: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE },
  (_, index) => `m20-prof-visible-${index}-${suffix}`,
);
const suppressedLearnerIds = [
  `m20-prof-suppressed-0-${suffix}`,
  `m20-prof-suppressed-1-${suffix}`,
];
const allUserIds = [reviewerId, ...visibleLearnerIds, ...suppressedLearnerIds];
const now = new Date('2026-08-18T12:00:00.000Z');
const authoredCanary = `private-authored-project-content-${suffix}`;

suite('Milestone 20 professional project aggregate analytics', () => {
  beforeAll(async () => {
    await db.course.createMany({
      data: [
        {
          id: visibleCourseId,
          sanityId: `sanity-prof-visible-${suffix}`,
          slug: `prof-visible-${suffix}`,
          title: `A professional analytics programme ${suffix}`,
          published: true,
        },
        {
          id: suppressedCourseId,
          sanityId: `sanity-prof-suppressed-${suffix}`,
          slug: `prof-suppressed-${suffix}`,
          title: `B protected professional programme ${suffix}`,
          published: true,
        },
      ],
    });

    await db.user.createMany({
      data: allUserIds.map((id, index) => ({
        id,
        clerkId: `clerk-${id}`,
        email: `m20-prof-${index}-${suffix}@example.test`,
      })),
    });

    const visibleEnrollments = await Promise.all(
      visibleLearnerIds.map((userId) =>
        db.enrollment.create({
          data: {
            userId,
            courseId: visibleCourseId,
            status: EnrollmentStatus.ACTIVE,
          },
          select: { id: true, userId: true },
        }),
      ),
    );
    const suppressedEnrollments = await Promise.all(
      suppressedLearnerIds.map((userId) =>
        db.enrollment.create({
          data: {
            userId,
            courseId: suppressedCourseId,
            status: EnrollmentStatus.ACTIVE,
          },
          select: { id: true, userId: true },
        }),
      ),
    );

    await db.$executeRaw`
      INSERT INTO "ProfessionalProject" (
        "id", "courseId", "title", "active", "createdAt", "updatedAt"
      ) VALUES (
        ${visibleProjectId}, ${visibleCourseId}, ${`Visible project ${suffix}`}, TRUE, ${now}, ${now}
      )
    `;
    await db.$executeRaw`
      INSERT INTO "ProfessionalProject" (
        "id", "courseId", "title", "active", "createdAt", "updatedAt"
      ) VALUES (
        ${suppressedProjectId}, ${suppressedCourseId}, ${`Protected project ${suffix}`}, TRUE, ${now}, ${now}
      )
    `;

    const visibleStatuses = [
      'SUBMITTED',
      'IN_REVIEW',
      'REVISION_REQUIRED',
      'APPROVED',
      'REJECTED',
    ] as const;

    for (const [index, enrollment] of visibleEnrollments.entries()) {
      const status = visibleStatuses[index]!;
      const reviewerUserId = status === 'SUBMITTED' ? null : reviewerId;
      await db.$executeRaw`
        INSERT INTO "ProfessionalProjectSubmission" (
          "id", "learnerUserId", "courseId", "enrollmentId", "projectId",
          "status", "artifactUrl", "reflection", "reviewerUserId",
          "submittedAt", "createdAt", "updatedAt"
        ) VALUES (
          ${`m20-prof-submission-visible-${index}-${suffix}`},
          ${enrollment.userId},
          ${visibleCourseId},
          ${enrollment.id},
          ${visibleProjectId},
          ${status}::"ProfessionalSubmissionStatus",
          ${`https://example.test/project/${suffix}/${index}`},
          ${`${authoredCanary} visible ${index} with enough characters`},
          ${reviewerUserId},
          ${now},
          ${now},
          ${now}
        )
      `;
    }

    const suppressedStatuses = ['SUBMITTED', 'APPROVED'] as const;
    for (const [index, enrollment] of suppressedEnrollments.entries()) {
      const status = suppressedStatuses[index]!;
      await db.$executeRaw`
        INSERT INTO "ProfessionalProjectSubmission" (
          "id", "learnerUserId", "courseId", "enrollmentId", "projectId",
          "status", "artifactUrl", "reflection", "reviewerUserId",
          "submittedAt", "createdAt", "updatedAt"
        ) VALUES (
          ${`m20-prof-submission-suppressed-${index}-${suffix}`},
          ${enrollment.userId},
          ${suppressedCourseId},
          ${enrollment.id},
          ${suppressedProjectId},
          ${status}::"ProfessionalSubmissionStatus",
          ${`https://example.test/protected/${suffix}/${index}`},
          ${`${authoredCanary} protected ${index} with enough characters`},
          ${status === 'SUBMITTED' ? null : reviewerId},
          ${now},
          ${now},
          ${now}
        )
      `;
    }
  });

  afterAll(async () => {
    await db.$executeRaw`
      DELETE FROM "ProfessionalProjectSubmission"
      WHERE "courseId" IN (${visibleCourseId}, ${suppressedCourseId})
    `;
    await db.$executeRaw`
      DELETE FROM "ProfessionalProject"
      WHERE "id" IN (${visibleProjectId}, ${suppressedProjectId})
    `;
    await db.enrollment.deleteMany({
      where: { courseId: { in: [visibleCourseId, suppressedCourseId] } },
    });
    await db.course.deleteMany({
      where: { id: { in: [visibleCourseId, suppressedCourseId] } },
    });
    await db.user.deleteMany({ where: { id: { in: allUserIds } } });
    await db.$disconnect();
  });

  test('returns current workflow counts only after the submitter privacy threshold is met', async () => {
    const analytics = await getAcademyProfessionalProjectAnalytics();
    const visible = analytics.find(({ courseId }) => courseId === visibleCourseId);
    const suppressed = analytics.find(
      ({ courseId }) => courseId === suppressedCourseId,
    );

    expect(visible).toEqual({
      state: 'visible',
      courseId: visibleCourseId,
      title: `A professional analytics programme ${suffix}`,
      minimumGroupSize: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
      participantCount: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
      submittedProjects: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
      waitingReview: 1,
      inReview: 1,
      revisionRequired: 1,
      approved: 1,
      rejected: 1,
    });
    expect(suppressed).toEqual({
      state: 'suppressed',
      courseId: suppressedCourseId,
      title: `B protected professional programme ${suffix}`,
      minimumGroupSize: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
    });
  });

  test('never returns learner-authored project content or individual identities', async () => {
    const analytics = await getAcademyProfessionalProjectAnalytics();
    const serialized = JSON.stringify(analytics);

    expect(serialized).not.toContain(authoredCanary);
    for (const userId of allUserIds) expect(serialized).not.toContain(userId);
    expect(serialized).not.toContain('artifactUrl');
    expect(serialized).not.toContain('reflection');
    expect(serialized).not.toContain('feedback');
    expect(serialized).not.toContain('score');
  });
});
