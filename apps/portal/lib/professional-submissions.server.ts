import 'server-only';

import { requireUser } from '@luminol/auth';
import { db, type ProfessionalSubmissionStatus } from '@luminol/database';

export const LEARNER_PROJECT_LIMIT = 50;

export type LearnerProfessionalProject = {
  projectId: string;
  projectTitle: string;
  courseId: string;
  courseTitle: string;
  enrollmentId: string | null;
  submissionId: string | null;
  status: ProfessionalSubmissionStatus | null;
  artifactUrl: string | null;
  reflection: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  updatedAt: Date | null;
  latestReviewScore: number | null;
  latestReviewFeedback: string | null;
  latestReviewStatus: ProfessionalSubmissionStatus | null;
  latestReviewAt: Date | null;
};

export function isLearnerSubmissionEditable(
  status: ProfessionalSubmissionStatus | null,
) {
  return status === 'DRAFT' || status === 'REVISION_REQUIRED';
}

export async function getLearnerProfessionalProjects() {
  const user = await requireUser();

  const projects = await db.$queryRaw<LearnerProfessionalProject[]>`
    SELECT
      project."id" AS "projectId",
      project."title" AS "projectTitle",
      course."id" AS "courseId",
      course."title" AS "courseTitle",
      enrollment."id" AS "enrollmentId",
      submission."id" AS "submissionId",
      submission."status" AS "status",
      submission."artifactUrl" AS "artifactUrl",
      submission."reflection" AS "reflection",
      submission."submittedAt" AS "submittedAt",
      submission."reviewedAt" AS "reviewedAt",
      submission."updatedAt" AS "updatedAt",
      latest_review."score" AS "latestReviewScore",
      latest_review."feedback" AS "latestReviewFeedback",
      latest_review."toStatus" AS "latestReviewStatus",
      latest_review."createdAt" AS "latestReviewAt"
    FROM "ProfessionalProject" AS project
    JOIN "Course" AS course
      ON course."id" = project."courseId"
    LEFT JOIN LATERAL (
      SELECT candidate."id"
      FROM "Enrollment" AS candidate
      WHERE candidate."userId" = ${user.id}
        AND candidate."courseId" = project."courseId"
        AND candidate."status" = 'ACTIVE'::"EnrollmentStatus"
      ORDER BY candidate."enrolledAt" DESC, candidate."id" DESC
      LIMIT 1
    ) AS enrollment ON TRUE
    LEFT JOIN "ProfessionalProjectSubmission" AS submission
      ON submission."learnerUserId" = ${user.id}
      AND submission."projectId" = project."id"
    LEFT JOIN LATERAL (
      SELECT
        review."score",
        review."feedback",
        review."toStatus",
        review."createdAt"
      FROM "ProfessionalSubmissionReview" AS review
      WHERE review."submissionId" = submission."id"
      ORDER BY review."createdAt" DESC, review."id" DESC
      LIMIT 1
    ) AS latest_review ON TRUE
    WHERE submission."id" IS NOT NULL
      OR (project."active" = true AND enrollment."id" IS NOT NULL)
    ORDER BY course."title" ASC, project."title" ASC, project."id" ASC
    LIMIT ${LEARNER_PROJECT_LIMIT}
  `;

  return {
    projects,
    limit: LEARNER_PROJECT_LIMIT,
  };
}
