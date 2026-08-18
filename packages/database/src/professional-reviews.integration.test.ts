import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { EnrollmentStatus, db } from './index';
import {
  getProfessionalSubmissionReviewsForLearner,
  getProfessionalSubmissionReviewsForReviewer,
} from './professional-submissions';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const courseId = `m20-review-course-${suffix}`;
const learnerId = `m20-review-learner-${suffix}`;
const reviewerId = `m20-review-reviewer-${suffix}`;
const otherReviewerId = `m20-review-other-reviewer-${suffix}`;
let enrollmentId = '';

suite('Milestone 20 professional review history', () => {
  beforeAll(async () => {
    await db.course.create({
      data: {
        id: courseId,
        sanityId: `sanity-m20-review-${suffix}`,
        slug: `m20-review-${suffix}`,
        title: `Milestone 20 review ${suffix}`,
        published: true,
      },
    });
    await db.user.createMany({
      data: [
        {
          id: learnerId,
          clerkId: `clerk-${learnerId}`,
          email: `review-learner-${suffix}@example.test`,
        },
        {
          id: reviewerId,
          clerkId: `clerk-${reviewerId}`,
          email: `reviewer-${suffix}@example.test`,
        },
        {
          id: otherReviewerId,
          clerkId: `clerk-${otherReviewerId}`,
          email: `other-reviewer-${suffix}@example.test`,
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
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  async function createInReviewSubmission(label: string) {
    const projectId = `m20-review-project-${label}-${suffix}`;
    const submissionId = `m20-review-submission-${label}-${suffix}`;
    const now = new Date();

    await db.$executeRaw`
      INSERT INTO "ProfessionalProject" (
        "id", "courseId", "title", "active", "createdAt", "updatedAt"
      ) VALUES (
        ${projectId}, ${courseId}, ${`Review project ${label} ${suffix}`}, true, ${now}, ${now}
      )
    `;
    await db.$executeRaw`
      INSERT INTO "ProfessionalProjectSubmission" (
        "id", "learnerUserId", "courseId", "enrollmentId", "projectId",
        "status", "createdAt", "updatedAt"
      ) VALUES (
        ${submissionId}, ${learnerId}, ${courseId}, ${enrollmentId}, ${projectId},
        'DRAFT'::"ProfessionalSubmissionStatus", ${now}, ${now}
      )
    `;
    await db.$executeRaw`
      UPDATE "ProfessionalProjectSubmission"
      SET
        "artifactUrl" = ${`https://example.test/${label}`},
        "reflection" = ${'I completed the governed project requirements and documented the decisions I made.'},
        "status" = 'SUBMITTED'::"ProfessionalSubmissionStatus",
        "submittedAt" = ${now},
        "updatedAt" = ${now}
      WHERE "id" = ${submissionId}
    `;
    await db.$executeRaw`
      UPDATE "ProfessionalProjectSubmission"
      SET
        "reviewerUserId" = ${reviewerId},
        "status" = 'IN_REVIEW'::"ProfessionalSubmissionStatus",
        "reviewStartedAt" = ${now},
        "updatedAt" = ${now}
      WHERE "id" = ${submissionId}
    `;

    return submissionId;
  }

  test('requires the exact assigned reviewer and consistent human outcome', async () => {
    const submissionId = await createInReviewSubmission('scope');
    const now = new Date();

    await expect(
      db.$executeRaw`
        INSERT INTO "ProfessionalSubmissionReview" (
          "id", "submissionId", "reviewerUserId", "score", "feedback",
          "requiresRevision", "fromStatus", "toStatus", "createdAt"
        ) VALUES (
          ${randomUUID()}, ${submissionId}, ${otherReviewerId}, 82,
          ${'Clear implementation with the requested evidence and documentation.'},
          false, 'IN_REVIEW'::"ProfessionalSubmissionStatus",
          'APPROVED'::"ProfessionalSubmissionStatus", ${now}
        )
      `,
    ).rejects.toThrow();

    await expect(
      db.$executeRaw`
        INSERT INTO "ProfessionalSubmissionReview" (
          "id", "submissionId", "reviewerUserId", "score", "feedback",
          "requiresRevision", "fromStatus", "toStatus", "createdAt"
        ) VALUES (
          ${randomUUID()}, ${submissionId}, ${reviewerId}, 60,
          ${'The work is clear, but the evidence does not yet meet the governed threshold.'},
          false, 'IN_REVIEW'::"ProfessionalSubmissionStatus",
          'APPROVED'::"ProfessionalSubmissionStatus", ${now}
        )
      `,
    ).rejects.toThrow();
  });

  test('persists append-only review history behind exact learner and reviewer scope', async () => {
    const submissionId = await createInReviewSubmission('history');
    const reviewId = randomUUID();
    const now = new Date();

    await db.$executeRaw`
      INSERT INTO "ProfessionalSubmissionReview" (
        "id", "submissionId", "reviewerUserId", "score", "feedback",
        "requiresRevision", "fromStatus", "toStatus", "createdAt"
      ) VALUES (
        ${reviewId}, ${submissionId}, ${reviewerId}, 88,
        ${'The project meets the practical requirements and the learner explains the decisions clearly.'},
        false, 'IN_REVIEW'::"ProfessionalSubmissionStatus",
        'APPROVED'::"ProfessionalSubmissionStatus", ${now}
      )
    `;

    await expect(
      getProfessionalSubmissionReviewsForReviewer(db, {
        submissionId,
        reviewerUserId: reviewerId,
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        id: reviewId,
        submissionId,
        reviewerUserId: reviewerId,
        score: 88,
        toStatus: 'APPROVED',
      }),
    ]);

    await expect(
      getProfessionalSubmissionReviewsForLearner(db, {
        submissionId,
        learnerUserId: learnerId,
      }),
    ).resolves.toEqual([
      expect.objectContaining({ id: reviewId, submissionId, score: 88 }),
    ]);

    await expect(
      getProfessionalSubmissionReviewsForReviewer(db, {
        submissionId,
        reviewerUserId: otherReviewerId,
      }),
    ).resolves.toEqual([]);

    await expect(
      db.$executeRaw`
        UPDATE "ProfessionalSubmissionReview"
        SET "feedback" = ${'Tampered feedback'}
        WHERE "id" = ${reviewId}
      `,
    ).rejects.toThrow();

    await expect(
      db.$executeRaw`
        DELETE FROM "ProfessionalSubmissionReview"
        WHERE "id" = ${reviewId}
      `,
    ).rejects.toThrow();
  });
});
