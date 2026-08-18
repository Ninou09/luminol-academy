'use server';

import { randomUUID } from 'node:crypto';

import { AuthorizationError, requireUser } from '@luminol/auth';
import {
  db,
  type ProfessionalSubmissionStatus,
} from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const projectIdSchema = z.string().trim().min(1).max(160);
const submissionIdSchema = z.string().trim().min(1).max(128);

function isHttpUrl(value: string) {
  if (!value) return true;
  if (/\s/.test(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const editableContentSchema = z.object({
  submissionId: submissionIdSchema,
  artifactUrl: z
    .string()
    .trim()
    .max(2048)
    .refine(isHttpUrl, 'Project link must use HTTP(S).'),
  reflection: z.string().trim().max(5000),
});

const submittedContentSchema = editableContentSchema.extend({
  artifactUrl: z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .refine(isHttpUrl, 'Project link must use HTTP(S).'),
  reflection: z.string().trim().min(20).max(5000),
});

type LockedSubmission = {
  id: string;
  status: ProfessionalSubmissionStatus;
};

async function getLockedLearnerSubmission(
  transaction: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  submissionId: string,
  learnerUserId: string,
) {
  const rows = await transaction.$queryRaw<LockedSubmission[]>`
    SELECT "id", "status"
    FROM "ProfessionalProjectSubmission"
    WHERE "id" = ${submissionId}
      AND "learnerUserId" = ${learnerUserId}
    FOR UPDATE
  `;

  return rows[0] ?? null;
}

function revalidateLearnerProjects() {
  revalidatePath('/projects');
  revalidatePath('/');
}

export async function createProfessionalSubmissionDraft(formData: FormData) {
  const user = await requireUser();
  const projectId = projectIdSchema.parse(formData.get('projectId'));

  await db.$transaction(async (transaction) => {
    const eligible = await transaction.$queryRaw<
      Array<{ projectId: string; courseId: string; enrollmentId: string }>
    >`
      SELECT
        project."id" AS "projectId",
        project."courseId" AS "courseId",
        enrollment."id" AS "enrollmentId"
      FROM "ProfessionalProject" AS project
      JOIN "Enrollment" AS enrollment
        ON enrollment."courseId" = project."courseId"
      WHERE project."id" = ${projectId}
        AND project."active" = true
        AND enrollment."userId" = ${user.id}
        AND enrollment."status" = 'ACTIVE'::"EnrollmentStatus"
      ORDER BY enrollment."enrolledAt" DESC, enrollment."id" DESC
      LIMIT 1
    `;

    const scope = eligible[0];
    if (!scope) throw new AuthorizationError();

    const submissionId = randomUUID();
    const now = new Date();
    const inserted = await transaction.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "ProfessionalProjectSubmission" (
        "id",
        "learnerUserId",
        "courseId",
        "enrollmentId",
        "projectId",
        "status",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${submissionId},
        ${user.id},
        ${scope.courseId},
        ${scope.enrollmentId},
        ${scope.projectId},
        'DRAFT'::"ProfessionalSubmissionStatus",
        ${now},
        ${now}
      )
      ON CONFLICT ("learnerUserId", "projectId") DO NOTHING
      RETURNING "id"
    `;

    if (inserted.length === 0) return;

    await transaction.$executeRaw`
      INSERT INTO "ProfessionalSubmissionAuditEvent" (
        "id", "submissionId", "actorUserId", "action", "fromStatus", "toStatus", "occurredAt"
      ) VALUES (
        ${randomUUID()}, ${submissionId}, ${user.id}, ${'professional_submission.draft_created'},
        NULL, 'DRAFT'::"ProfessionalSubmissionStatus", ${now}
      )
    `;
  });

  revalidateLearnerProjects();
}

export async function saveProfessionalSubmissionDraft(formData: FormData) {
  const user = await requireUser();
  const input = editableContentSchema.parse({
    submissionId: formData.get('submissionId'),
    artifactUrl: formData.get('artifactUrl'),
    reflection: formData.get('reflection'),
  });

  await db.$transaction(async (transaction) => {
    const submission = await getLockedLearnerSubmission(
      transaction,
      input.submissionId,
      user.id,
    );
    if (
      !submission ||
      (submission.status !== 'DRAFT' &&
        submission.status !== 'REVISION_REQUIRED')
    ) {
      throw new AuthorizationError();
    }

    const now = new Date();
    await transaction.$executeRaw`
      UPDATE "ProfessionalProjectSubmission"
      SET
        "artifactUrl" = ${input.artifactUrl || null},
        "reflection" = ${input.reflection || null},
        "updatedAt" = ${now}
      WHERE "id" = ${submission.id}
        AND "learnerUserId" = ${user.id}
    `;

    await transaction.$executeRaw`
      INSERT INTO "ProfessionalSubmissionAuditEvent" (
        "id", "submissionId", "actorUserId", "action", "fromStatus", "toStatus", "occurredAt"
      ) VALUES (
        ${randomUUID()}, ${submission.id}, ${user.id}, ${'professional_submission.draft_saved'},
        ${submission.status}::"ProfessionalSubmissionStatus",
        ${submission.status}::"ProfessionalSubmissionStatus",
        ${now}
      )
    `;
  });

  revalidateLearnerProjects();
}

export async function submitProfessionalSubmission(formData: FormData) {
  const user = await requireUser();
  const input = submittedContentSchema.parse({
    submissionId: formData.get('submissionId'),
    artifactUrl: formData.get('artifactUrl'),
    reflection: formData.get('reflection'),
  });

  await db.$transaction(async (transaction) => {
    const submission = await getLockedLearnerSubmission(
      transaction,
      input.submissionId,
      user.id,
    );
    if (
      !submission ||
      (submission.status !== 'DRAFT' &&
        submission.status !== 'REVISION_REQUIRED')
    ) {
      throw new AuthorizationError();
    }

    const now = new Date();
    await transaction.$executeRaw`
      UPDATE "ProfessionalProjectSubmission"
      SET
        "artifactUrl" = ${input.artifactUrl},
        "reflection" = ${input.reflection},
        "status" = 'SUBMITTED'::"ProfessionalSubmissionStatus",
        "submittedAt" = ${now},
        "reviewStartedAt" = NULL,
        "reviewedAt" = NULL,
        "updatedAt" = ${now}
      WHERE "id" = ${submission.id}
        AND "learnerUserId" = ${user.id}
    `;

    const action =
      submission.status === 'REVISION_REQUIRED'
        ? 'professional_submission.resubmitted'
        : 'professional_submission.submitted';

    await transaction.$executeRaw`
      INSERT INTO "ProfessionalSubmissionAuditEvent" (
        "id", "submissionId", "actorUserId", "action", "fromStatus", "toStatus", "occurredAt"
      ) VALUES (
        ${randomUUID()}, ${submission.id}, ${user.id}, ${action},
        ${submission.status}::"ProfessionalSubmissionStatus",
        'SUBMITTED'::"ProfessionalSubmissionStatus",
        ${now}
      )
    `;
  });

  revalidateLearnerProjects();
}
