import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { EnrollmentStatus, db } from './index';
import {
  getProfessionalSubmissionForLearner,
  getProfessionalSubmissionForReviewer,
} from './professional-submissions';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const courseId = `m20-course-${suffix}`;
const otherCourseId = `m20-other-course-${suffix}`;
const learnerId = `m20-learner-${suffix}`;
const reviewerId = `m20-reviewer-${suffix}`;
const otherLearnerId = `m20-other-learner-${suffix}`;
const submissionId = `m20-submission-${suffix}`;
const projectId = `portfolio-project-${suffix}`;
let enrollmentId = '';
let otherEnrollmentId = '';

suite('Milestone 20 professional submission persistence', () => {
  beforeAll(async () => {
    await db.course.createMany({
      data: [
        {
          id: courseId,
          sanityId: `sanity-m20-${suffix}`,
          slug: `m20-${suffix}`,
          title: `Milestone 20 ${suffix}`,
          published: true,
        },
        {
          id: otherCourseId,
          sanityId: `sanity-m20-other-${suffix}`,
          slug: `m20-other-${suffix}`,
          title: `Milestone 20 other ${suffix}`,
          published: true,
        },
      ],
    });
    await db.user.createMany({
      data: [
        {
          id: learnerId,
          clerkId: `clerk-${learnerId}`,
          email: `learner-${suffix}@example.test`,
        },
        {
          id: reviewerId,
          clerkId: `clerk-${reviewerId}`,
          email: `reviewer-${suffix}@example.test`,
        },
        {
          id: otherLearnerId,
          clerkId: `clerk-${otherLearnerId}`,
          email: `other-learner-${suffix}@example.test`,
        },
      ],
    });
    const enrollment = await db.enrollment.create({
      data: {
        userId: learnerId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
    enrollmentId = enrollment.id;
    const otherEnrollment = await db.enrollment.create({
      data: {
        userId: otherLearnerId,
        courseId: otherCourseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
    otherEnrollmentId = otherEnrollment.id;
  });

  afterAll(async () => {
    await db.$executeRaw`DELETE FROM "ProfessionalSubmissionAuditEvent" WHERE "submissionId" = ${submissionId}`;
    await db.$executeRaw`DELETE FROM "ProfessionalProjectSubmission" WHERE "id" = ${submissionId}`;
    await db.enrollment.deleteMany({
      where: { id: { in: [enrollmentId, otherEnrollmentId].filter(Boolean) } },
    });
    await db.user.deleteMany({
      where: { id: { in: [learnerId, reviewerId, otherLearnerId] } },
    });
    await db.course.deleteMany({
      where: { id: { in: [courseId, otherCourseId] } },
    });
    await db.$disconnect();
  });

  test('creates one learner-scoped draft and reads it only through exact identity', async () => {
    const now = new Date();
    await db.$executeRaw`
      INSERT INTO "ProfessionalProjectSubmission" (
        "id", "learnerUserId", "courseId", "enrollmentId", "projectId",
        "status", "createdAt", "updatedAt"
      ) VALUES (
        ${submissionId}, ${learnerId}, ${courseId}, ${enrollmentId}, ${projectId},
        'DRAFT'::"ProfessionalSubmissionStatus", ${now}, ${now}
      )
    `;

    await expect(
      getProfessionalSubmissionForLearner(db, {
        submissionId,
        learnerUserId: learnerId,
      }),
    ).resolves.toMatchObject({
      id: submissionId,
      learnerUserId: learnerId,
      courseId,
      enrollmentId,
      projectId,
      status: 'DRAFT',
    });

    await expect(
      getProfessionalSubmissionForLearner(db, {
        submissionId,
        learnerUserId: otherLearnerId,
      }),
    ).resolves.toBeNull();
  });

  test('rejects learner/course scope changes and invalid submission content', async () => {
    await expect(
      db.$executeRaw`
        UPDATE "ProfessionalProjectSubmission"
        SET "enrollmentId" = ${otherEnrollmentId}, "updatedAt" = ${new Date()}
        WHERE "id" = ${submissionId}
      `,
    ).rejects.toThrow();

    await expect(
      db.$executeRaw`
        UPDATE "ProfessionalProjectSubmission"
        SET "status" = 'SUBMITTED'::"ProfessionalSubmissionStatus", "updatedAt" = ${new Date()}
        WHERE "id" = ${submissionId}
      `,
    ).rejects.toThrow();
  });

  test('enforces the existing domain transition sequence and assigned reviewer boundary', async () => {
    const reflection =
      'I applied the project requirements, documented the decisions, and reflected on the result.';
    const submittedAt = new Date();
    await db.$executeRaw`
      UPDATE "ProfessionalProjectSubmission"
      SET
        "artifactUrl" = ${'https://example.test/artifact'},
        "reflection" = ${reflection},
        "status" = 'SUBMITTED'::"ProfessionalSubmissionStatus",
        "submittedAt" = ${submittedAt},
        "updatedAt" = ${submittedAt}
      WHERE "id" = ${submissionId}
    `;

    await expect(
      db.$executeRaw`
        UPDATE "ProfessionalProjectSubmission"
        SET "status" = 'APPROVED'::"ProfessionalSubmissionStatus", "updatedAt" = ${new Date()}
        WHERE "id" = ${submissionId}
      `,
    ).rejects.toThrow();

    await expect(
      db.$executeRaw`
        UPDATE "ProfessionalProjectSubmission"
        SET "status" = 'IN_REVIEW'::"ProfessionalSubmissionStatus", "updatedAt" = ${new Date()}
        WHERE "id" = ${submissionId}
      `,
    ).rejects.toThrow();

    const reviewStartedAt = new Date();
    await db.$executeRaw`
      UPDATE "ProfessionalProjectSubmission"
      SET
        "reviewerUserId" = ${reviewerId},
        "status" = 'IN_REVIEW'::"ProfessionalSubmissionStatus",
        "reviewStartedAt" = ${reviewStartedAt},
        "updatedAt" = ${reviewStartedAt}
      WHERE "id" = ${submissionId}
    `;

    await expect(
      getProfessionalSubmissionForReviewer(db, {
        submissionId,
        reviewerUserId: reviewerId,
      }),
    ).resolves.toMatchObject({
      id: submissionId,
      status: 'IN_REVIEW',
      reviewerUserId: reviewerId,
    });
  });

  test('persists append-only audit records tied to exact submission and actor', async () => {
    const auditId = randomUUID();
    await db.$executeRaw`
      INSERT INTO "ProfessionalSubmissionAuditEvent" (
        "id", "submissionId", "actorUserId", "action", "fromStatus", "toStatus"
      ) VALUES (
        ${auditId}, ${submissionId}, ${reviewerId}, ${'professional_submission.review_started'},
        'SUBMITTED'::"ProfessionalSubmissionStatus", 'IN_REVIEW'::"ProfessionalSubmissionStatus"
      )
    `;

    const rows = await db.$queryRaw<
      Array<{ submissionId: string; actorUserId: string; action: string }>
    >`
      SELECT "submissionId", "actorUserId", "action"
      FROM "ProfessionalSubmissionAuditEvent"
      WHERE "id" = ${auditId}
    `;
    expect(rows).toEqual([
      {
        submissionId,
        actorUserId: reviewerId,
        action: 'professional_submission.review_started',
      },
    ]);
  });
});
