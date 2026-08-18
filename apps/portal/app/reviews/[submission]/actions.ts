'use server';

import { randomUUID } from 'node:crypto';

import { AuthorizationError, requireUser } from '@luminol/auth';
import {
  db,
  type PrismaClient,
  type ProfessionalSubmissionStatus,
} from '@luminol/database';
import { determineReviewOutcome } from '@luminol/professional';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const submissionIdSchema = z.string().trim().min(1).max(128);
const decisionSchema = z.object({
  submissionId: submissionIdSchema,
  score: z.coerce.number().int().min(0).max(100),
  feedback: z.string().trim().min(10).max(5000),
  requiresRevision: z.boolean(),
});

type ReviewTransaction = Pick<PrismaClient, '$queryRaw'>;

type LockedReviewerSubmission = {
  id: string;
  status: ProfessionalSubmissionStatus;
};

async function getLockedReviewerSubmission(
  transaction: ReviewTransaction,
  submissionId: string,
  reviewerUserId: string,
) {
  const rows = await transaction.$queryRaw<LockedReviewerSubmission[]>`
    SELECT "id", "status"
    FROM "ProfessionalProjectSubmission"
    WHERE "id" = ${submissionId}
      AND "reviewerUserId" = ${reviewerUserId}
      AND "status" <> 'DRAFT'::"ProfessionalSubmissionStatus"
    FOR UPDATE
  `;

  return rows[0] ?? null;
}

function revalidateReviewWorkspace(submissionId: string) {
  revalidatePath('/reviews');
  revalidatePath(`/reviews/${submissionId}`);
  revalidatePath('/projects');
}

export async function startProfessionalSubmissionReview(formData: FormData) {
  const user = await requireUser();
  const submissionId = submissionIdSchema.parse(formData.get('submissionId'));

  await db.$transaction(async (transaction) => {
    const submission = await getLockedReviewerSubmission(
      transaction,
      submissionId,
      user.id,
    );
    if (!submission || submission.status !== 'SUBMITTED') {
      throw new AuthorizationError();
    }

    const now = new Date();
    await transaction.$executeRaw`
      UPDATE "ProfessionalProjectSubmission"
      SET
        "status" = 'IN_REVIEW'::"ProfessionalSubmissionStatus",
        "reviewStartedAt" = ${now},
        "reviewedAt" = NULL,
        "updatedAt" = ${now}
      WHERE "id" = ${submission.id}
        AND "reviewerUserId" = ${user.id}
    `;

    await transaction.$executeRaw`
      INSERT INTO "ProfessionalSubmissionAuditEvent" (
        "id", "submissionId", "actorUserId", "action", "fromStatus", "toStatus", "occurredAt"
      ) VALUES (
        ${randomUUID()}, ${submission.id}, ${user.id}, ${'professional_submission.review_started'},
        'SUBMITTED'::"ProfessionalSubmissionStatus",
        'IN_REVIEW'::"ProfessionalSubmissionStatus", ${now}
      )
    `;
  });

  revalidateReviewWorkspace(submissionId);
}

export async function decideProfessionalSubmissionReview(formData: FormData) {
  const user = await requireUser();
  const input = decisionSchema.parse({
    submissionId: formData.get('submissionId'),
    score: formData.get('score'),
    feedback: formData.get('feedback'),
    requiresRevision: formData.get('requiresRevision') === 'on',
  });
  const outcome = determineReviewOutcome({
    reviewerId: user.id,
    score: input.score,
    feedback: input.feedback,
    requiresRevision: input.requiresRevision,
  });

  await db.$transaction(async (transaction) => {
    const submission = await getLockedReviewerSubmission(
      transaction,
      input.submissionId,
      user.id,
    );
    if (!submission || submission.status !== 'IN_REVIEW') {
      throw new AuthorizationError();
    }

    const now = new Date();
    await transaction.$executeRaw`
      INSERT INTO "ProfessionalSubmissionReview" (
        "id", "submissionId", "reviewerUserId", "score", "feedback",
        "requiresRevision", "fromStatus", "toStatus", "createdAt"
      ) VALUES (
        ${randomUUID()}, ${submission.id}, ${user.id}, ${outcome.review.score},
        ${outcome.review.feedback}, ${outcome.review.requiresRevision},
        'IN_REVIEW'::"ProfessionalSubmissionStatus",
        ${outcome.status}::"ProfessionalSubmissionStatus", ${now}
      )
    `;

    await transaction.$executeRaw`
      UPDATE "ProfessionalProjectSubmission"
      SET
        "status" = ${outcome.status}::"ProfessionalSubmissionStatus",
        "reviewedAt" = ${now},
        "updatedAt" = ${now}
      WHERE "id" = ${submission.id}
        AND "reviewerUserId" = ${user.id}
    `;

    const action =
      outcome.status === 'REVISION_REQUIRED'
        ? 'professional_submission.revision_requested'
        : outcome.status === 'APPROVED'
          ? 'professional_submission.approved'
          : 'professional_submission.rejected';

    await transaction.$executeRaw`
      INSERT INTO "ProfessionalSubmissionAuditEvent" (
        "id", "submissionId", "actorUserId", "action", "fromStatus", "toStatus", "occurredAt"
      ) VALUES (
        ${randomUUID()}, ${submission.id}, ${user.id}, ${action},
        'IN_REVIEW'::"ProfessionalSubmissionStatus",
        ${outcome.status}::"ProfessionalSubmissionStatus", ${now}
      )
    `;
  });

  revalidateReviewWorkspace(input.submissionId);
}
