import 'server-only';

import { requireUser } from '@luminol/auth';
import {
  db,
  getProfessionalSubmissionForReviewer,
  getProfessionalSubmissionReviewsForReviewer,
  type PersistedProfessionalSubmissionReview,
  type ProfessionalSubmissionStatus,
} from '@luminol/database';

export const REVIEWER_SUBMISSION_LIMIT = 50;

export type ReviewerSubmissionSummary = {
  submissionId: string;
  projectTitle: string;
  courseTitle: string;
  status: ProfessionalSubmissionStatus;
  submittedAt: Date | null;
  reviewStartedAt: Date | null;
  reviewedAt: Date | null;
  updatedAt: Date;
};

export type ReviewerSubmissionDetail = ReviewerSubmissionSummary & {
  artifactUrl: string | null;
  reflection: string | null;
  reviews: PersistedProfessionalSubmissionReview[];
};

export function isActiveReviewerWork(status: ProfessionalSubmissionStatus) {
  return status === 'SUBMITTED' || status === 'IN_REVIEW';
}

export async function hasProfessionalReviewerAccess(userId: string) {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) return false;

  const rows = await db.$queryRaw<Array<{ found: number }>>`
    SELECT 1 AS "found"
    FROM "ProfessionalProjectSubmission"
    WHERE "reviewerUserId" = ${normalizedUserId}
      AND "status" <> 'DRAFT'::"ProfessionalSubmissionStatus"
    LIMIT 1
  `;

  return rows.length > 0;
}

export async function getAssignedProfessionalSubmissions() {
  const user = await requireUser();

  const submissions = await db.$queryRaw<ReviewerSubmissionSummary[]>`
    SELECT
      submission."id" AS "submissionId",
      project."title" AS "projectTitle",
      course."title" AS "courseTitle",
      submission."status" AS "status",
      submission."submittedAt" AS "submittedAt",
      submission."reviewStartedAt" AS "reviewStartedAt",
      submission."reviewedAt" AS "reviewedAt",
      submission."updatedAt" AS "updatedAt"
    FROM "ProfessionalProjectSubmission" AS submission
    JOIN "ProfessionalProject" AS project
      ON project."id" = submission."projectId"
    JOIN "Course" AS course
      ON course."id" = submission."courseId"
    WHERE submission."reviewerUserId" = ${user.id}
      AND submission."status" <> 'DRAFT'::"ProfessionalSubmissionStatus"
    ORDER BY
      CASE
        WHEN submission."status" = 'IN_REVIEW'::"ProfessionalSubmissionStatus" THEN 0
        WHEN submission."status" = 'SUBMITTED'::"ProfessionalSubmissionStatus" THEN 1
        ELSE 2
      END,
      submission."updatedAt" DESC,
      submission."id" ASC
    LIMIT ${REVIEWER_SUBMISSION_LIMIT}
  `;

  return {
    submissions,
    limit: REVIEWER_SUBMISSION_LIMIT,
  };
}

export async function getAssignedProfessionalSubmissionDetail(
  submissionId: string,
) {
  const user = await requireUser();
  const normalizedSubmissionId = submissionId.trim();
  if (!normalizedSubmissionId) return null;

  const authorized = await db.$queryRaw<Array<{ status: string }>>`
    SELECT "status"::text AS "status"
    FROM "ProfessionalProjectSubmission"
    WHERE "id" = ${normalizedSubmissionId}
      AND "reviewerUserId" = ${user.id}
      AND "status" <> 'DRAFT'::"ProfessionalSubmissionStatus"
    LIMIT 1
  `;
  if (authorized.length === 0) return null;

  const submission = await getProfessionalSubmissionForReviewer(db, {
    submissionId: normalizedSubmissionId,
    reviewerUserId: user.id,
  });
  if (!submission || submission.status === 'DRAFT') return null;

  const [labels, reviews] = await Promise.all([
    db.$queryRaw<Array<{ projectTitle: string; courseTitle: string }>>`
      SELECT
        project."title" AS "projectTitle",
        course."title" AS "courseTitle"
      FROM "ProfessionalProject" AS project
      JOIN "Course" AS course
        ON course."id" = project."courseId"
      WHERE project."id" = ${submission.projectId}
        AND project."courseId" = ${submission.courseId}
      LIMIT 1
    `,
    getProfessionalSubmissionReviewsForReviewer(db, {
      submissionId: submission.id,
      reviewerUserId: user.id,
    }),
  ]);
  const label = labels[0];
  if (!label) return null;

  return {
    submissionId: submission.id,
    projectTitle: label.projectTitle,
    courseTitle: label.courseTitle,
    status: submission.status,
    artifactUrl: submission.artifactUrl,
    reflection: submission.reflection,
    submittedAt: submission.submittedAt,
    reviewStartedAt: submission.reviewStartedAt,
    reviewedAt: submission.reviewedAt,
    updatedAt: submission.updatedAt,
    reviews,
  } satisfies ReviewerSubmissionDetail;
}
