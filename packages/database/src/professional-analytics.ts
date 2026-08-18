import { ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE } from './learning-analytics';
import { db } from './index';

export type AcademyProfessionalProjectAnalytics =
  | {
      state: 'suppressed';
      courseId: string;
      title: string;
      minimumGroupSize: number;
    }
  | {
      state: 'visible';
      courseId: string;
      title: string;
      minimumGroupSize: number;
      participantCount: number;
      submittedProjects: number;
      waitingReview: number;
      inReview: number;
      revisionRequired: number;
      approved: number;
      rejected: number;
    };

type RawProfessionalProjectAnalytics = {
  courseId: string;
  title: string;
  participantCount: bigint;
  submittedProjects: bigint;
  waitingReview: bigint;
  inReview: bigint;
  revisionRequired: bigint;
  approved: bigint;
  rejected: bigint;
};

function safeCount(value: bigint, label: string) {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError(`${label} exceeded the safe analytics count range`);
  }
  return count;
}

/**
 * Returns academy-level professional project workflow aggregates without
 * selecting learner identities, reviewer identities, artifact links,
 * reflections, review feedback, scores or other authored content.
 *
 * A programme's workflow metrics remain suppressed until at least the academy
 * minimum group size of distinct learners have moved beyond draft state. This
 * is intentionally stricter than counting all enrolments because professional
 * project participation can be sparse inside an otherwise large programme.
 * Callers must enforce academy-level authorization before invoking this reader.
 */
export async function getAcademyProfessionalProjectAnalytics(): Promise<
  AcademyProfessionalProjectAnalytics[]
> {
  const rows = await db.$queryRaw<RawProfessionalProjectAnalytics[]>`
    SELECT
      course."id" AS "courseId",
      course."title" AS "title",
      COUNT(DISTINCT submission."learnerUserId") FILTER (
        WHERE submission."status" <> 'DRAFT'::"ProfessionalSubmissionStatus"
      ) AS "participantCount",
      COUNT(submission."id") FILTER (
        WHERE submission."status" <> 'DRAFT'::"ProfessionalSubmissionStatus"
      ) AS "submittedProjects",
      COUNT(submission."id") FILTER (
        WHERE submission."status" = 'SUBMITTED'::"ProfessionalSubmissionStatus"
      ) AS "waitingReview",
      COUNT(submission."id") FILTER (
        WHERE submission."status" = 'IN_REVIEW'::"ProfessionalSubmissionStatus"
      ) AS "inReview",
      COUNT(submission."id") FILTER (
        WHERE submission."status" = 'REVISION_REQUIRED'::"ProfessionalSubmissionStatus"
      ) AS "revisionRequired",
      COUNT(submission."id") FILTER (
        WHERE submission."status" = 'APPROVED'::"ProfessionalSubmissionStatus"
      ) AS "approved",
      COUNT(submission."id") FILTER (
        WHERE submission."status" = 'REJECTED'::"ProfessionalSubmissionStatus"
      ) AS "rejected"
    FROM "Course" AS course
    INNER JOIN "ProfessionalProject" AS project
      ON project."courseId" = course."id"
    LEFT JOIN "ProfessionalProjectSubmission" AS submission
      ON submission."courseId" = course."id"
      AND submission."projectId" = project."id"
    WHERE course."published" = TRUE
    GROUP BY course."id", course."title"
    ORDER BY course."title" ASC, course."id" ASC
  `;

  return rows.map((row): AcademyProfessionalProjectAnalytics => {
    const participantCount = safeCount(
      row.participantCount,
      'professional participant count',
    );

    if (participantCount < ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE) {
      return {
        state: 'suppressed',
        courseId: row.courseId,
        title: row.title,
        minimumGroupSize: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
      };
    }

    return {
      state: 'visible',
      courseId: row.courseId,
      title: row.title,
      minimumGroupSize: ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
      participantCount,
      submittedProjects: safeCount(
        row.submittedProjects,
        'professional submission count',
      ),
      waitingReview: safeCount(row.waitingReview, 'waiting review count'),
      inReview: safeCount(row.inReview, 'in-review count'),
      revisionRequired: safeCount(
        row.revisionRequired,
        'revision-required count',
      ),
      approved: safeCount(row.approved, 'approved project count'),
      rejected: safeCount(row.rejected, 'rejected project count'),
    };
  });
}
