import type { PrismaClient } from '../generated/prisma/client';

export const PROFESSIONAL_SUBMISSION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
] as const;

export type ProfessionalSubmissionStatus =
  (typeof PROFESSIONAL_SUBMISSION_STATUSES)[number];

export const PROFESSIONAL_REVIEW_HISTORY_LIMIT = 20;

export type PersistedProfessionalSubmission = {
  id: string;
  learnerUserId: string;
  courseId: string;
  enrollmentId: string;
  projectId: string;
  status: ProfessionalSubmissionStatus;
  artifactUrl: string | null;
  reflection: string | null;
  reviewerUserId: string | null;
  submittedAt: Date | null;
  reviewStartedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PersistedProfessionalSubmissionReview = {
  id: string;
  submissionId: string;
  reviewerUserId: string;
  score: number;
  feedback: string;
  requiresRevision: boolean;
  fromStatus: ProfessionalSubmissionStatus;
  toStatus: ProfessionalSubmissionStatus;
  createdAt: Date;
};

type SubmissionQueryDatabase = Pick<PrismaClient, '$queryRaw'>;

function normalizeId(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${label} is required`);
  return normalized;
}

export async function getProfessionalSubmissionForLearner(
  database: SubmissionQueryDatabase,
  input: {
    submissionId: string;
    learnerUserId: string;
  },
) {
  const submissionId = normalizeId(input.submissionId, 'submissionId');
  const learnerUserId = normalizeId(input.learnerUserId, 'learnerUserId');

  const rows = await database.$queryRaw<PersistedProfessionalSubmission[]>`
    SELECT
      "id",
      "learnerUserId",
      "courseId",
      "enrollmentId",
      "projectId",
      "status",
      "artifactUrl",
      "reflection",
      "reviewerUserId",
      "submittedAt",
      "reviewStartedAt",
      "reviewedAt",
      "createdAt",
      "updatedAt"
    FROM "ProfessionalProjectSubmission"
    WHERE "id" = ${submissionId}
      AND "learnerUserId" = ${learnerUserId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getProfessionalSubmissionForReviewer(
  database: SubmissionQueryDatabase,
  input: {
    submissionId: string;
    reviewerUserId: string;
  },
) {
  const submissionId = normalizeId(input.submissionId, 'submissionId');
  const reviewerUserId = normalizeId(input.reviewerUserId, 'reviewerUserId');

  const rows = await database.$queryRaw<PersistedProfessionalSubmission[]>`
    SELECT
      "id",
      "learnerUserId",
      "courseId",
      "enrollmentId",
      "projectId",
      "status",
      "artifactUrl",
      "reflection",
      "reviewerUserId",
      "submittedAt",
      "reviewStartedAt",
      "reviewedAt",
      "createdAt",
      "updatedAt"
    FROM "ProfessionalProjectSubmission"
    WHERE "id" = ${submissionId}
      AND "reviewerUserId" = ${reviewerUserId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getProfessionalSubmissionReviewsForLearner(
  database: SubmissionQueryDatabase,
  input: {
    submissionId: string;
    learnerUserId: string;
  },
) {
  const submissionId = normalizeId(input.submissionId, 'submissionId');
  const learnerUserId = normalizeId(input.learnerUserId, 'learnerUserId');

  return database.$queryRaw<PersistedProfessionalSubmissionReview[]>`
    SELECT
      review."id",
      review."submissionId",
      review."reviewerUserId",
      review."score",
      review."feedback",
      review."requiresRevision",
      review."fromStatus",
      review."toStatus",
      review."createdAt"
    FROM "ProfessionalSubmissionReview" AS review
    JOIN "ProfessionalProjectSubmission" AS submission
      ON submission."id" = review."submissionId"
    WHERE review."submissionId" = ${submissionId}
      AND submission."learnerUserId" = ${learnerUserId}
    ORDER BY review."createdAt" DESC, review."id" DESC
    LIMIT ${PROFESSIONAL_REVIEW_HISTORY_LIMIT}
  `;
}

export async function getProfessionalSubmissionReviewsForReviewer(
  database: SubmissionQueryDatabase,
  input: {
    submissionId: string;
    reviewerUserId: string;
  },
) {
  const submissionId = normalizeId(input.submissionId, 'submissionId');
  const reviewerUserId = normalizeId(input.reviewerUserId, 'reviewerUserId');

  return database.$queryRaw<PersistedProfessionalSubmissionReview[]>`
    SELECT
      review."id",
      review."submissionId",
      review."reviewerUserId",
      review."score",
      review."feedback",
      review."requiresRevision",
      review."fromStatus",
      review."toStatus",
      review."createdAt"
    FROM "ProfessionalSubmissionReview" AS review
    JOIN "ProfessionalProjectSubmission" AS submission
      ON submission."id" = review."submissionId"
    WHERE review."submissionId" = ${submissionId}
      AND submission."reviewerUserId" = ${reviewerUserId}
      AND review."reviewerUserId" = ${reviewerUserId}
    ORDER BY review."createdAt" DESC, review."id" DESC
    LIMIT ${PROFESSIONAL_REVIEW_HISTORY_LIMIT}
  `;
}
