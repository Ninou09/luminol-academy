import 'server-only';

import { requireUser } from '@luminol/auth';
import {
  ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS,
  CertificateStatus,
  EnrollmentStatus,
  PlacementAttemptStatus,
  db,
  getActiveInstructorCohortAssignment,
} from '@luminol/database';
import { assertInstructorCohortAccess } from '@luminol/professional';

import {
  protectInstructorCohortAnalytics,
  summarizeInstructorCohortAnalytics,
} from './instructor-cohort-analytics';

function normalizeCohortId(cohortId: string) {
  const normalized = cohortId.trim();
  if (!normalized) throw new TypeError('cohortId is required');
  return normalized;
}

function activityCutoff(now: Date) {
  const timestamp = now.getTime();
  if (!Number.isFinite(timestamp)) throw new TypeError('now must be a valid date');
  return new Date(
    timestamp - ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
}

/**
 * Resolves exact persisted instructor authority before any cross-learner
 * analytics records are read. Browser-supplied cohort ids are selectors only.
 * Returned analytics contain aggregate learning state only; no learner identity,
 * authored text, assessment answers/scores, psychology, enquiry, finance,
 * certificate metadata, search/session or network data are selected or exposed.
 */
export async function getAuthorizedInstructorCohortAnalytics(
  cohortId: string,
  now = new Date(),
) {
  const user = await requireUser();
  const normalizedCohortId = normalizeCohortId(cohortId);
  const assignment = await getActiveInstructorCohortAssignment(
    user.id,
    normalizedCohortId,
  );

  if (!assignment) return null;

  assertInstructorCohortAccess({
    actorUserId: user.id,
    cohortId: normalizedCohortId,
    assignment,
  });

  const recentCutoff = activityCutoff(now);
  const cohort = await db.cohort.findFirst({
    where: {
      id: normalizedCohortId,
      status: { not: 'CANCELLED' },
    },
    select: {
      id: true,
      name: true,
      status: true,
      course: { select: { id: true, title: true } },
      enrollments: {
        where: {
          active: true,
          enrollment: {
            status: { not: EnrollmentStatus.CANCELLED },
            user: { deletedAt: null },
          },
        },
        select: {
          enrollment: {
            select: {
              userId: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!cohort) return null;

  const learnerIds = cohort.enrollments.map(
    ({ enrollment }) => enrollment.userId,
  );
  const participantCount = learnerIds.length;
  const completedEnrollments = cohort.enrollments.filter(
    ({ enrollment }) => enrollment.status === EnrollmentStatus.COMPLETED,
  ).length;

  const [recentActivityRows, certificateRows, reviewRequiredAttempts] =
    participantCount === 0
      ? [[], [], 0]
      : await Promise.all([
          db.learningRecord.findMany({
            where: {
              courseId: cohort.course.id,
              userId: { in: learnerIds },
              lastActivityAt: { gte: recentCutoff },
            },
            distinct: ['userId'],
            select: { userId: true },
          }),
          db.certificate.findMany({
            where: {
              courseId: cohort.course.id,
              userId: { in: learnerIds },
              status: CertificateStatus.ACTIVE,
            },
            distinct: ['userId'],
            select: { userId: true },
          }),
          db.placementAttempt.count({
            where: {
              userId: { in: learnerIds },
              status: PlacementAttemptStatus.REVIEW_REQUIRED,
              assessment: { courseId: cohort.course.id },
            },
          }),
        ]);

  const value = summarizeInstructorCohortAnalytics({
    participantCount,
    completedEnrollments,
    recentlyActiveLearners: recentActivityRows.length,
    activeCertificates: certificateRows.length,
    reviewRequiredAttempts,
    activityWindowDays: ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS,
  });

  return {
    cohort: {
      id: cohort.id,
      name: cohort.name,
      status: cohort.status,
      courseId: cohort.course.id,
      courseTitle: cohort.course.title,
    },
    assignmentRole: assignment.role,
    analytics: protectInstructorCohortAnalytics(value),
  };
}
