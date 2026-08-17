import 'server-only';

import { requireUser } from '@luminol/auth';
import {
  ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS,
  CertificateStatus,
  CohortAttendanceStatus,
  EnrollmentStatus,
  PlacementAttemptStatus,
  db,
  getActiveInstructorCohortAssignment,
} from '@luminol/database';
import { assertInstructorCohortAccess } from '@luminol/professional';

import {
  INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE,
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
  if (!Number.isFinite(timestamp))
    throw new TypeError('now must be a valid date');
  return new Date(
    timestamp - ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
}

function attendanceCount(
  groups: readonly { status: CohortAttendanceStatus; _count: { _all: number } }[],
  status: CohortAttendanceStatus,
) {
  return groups.find((group) => group.status === status)?._count._all ?? 0;
}

/**
 * Resolves exact persisted instructor authority before any cross-learner
 * analytics records are read. Browser-supplied cohort ids are selectors only.
 * Internal learner ids are used only to scope first-party source records after
 * authorization and are never returned by this read model. Authored text,
 * assessment answers/scores, psychology, enquiry, finance, certificate metadata,
 * search/session and network data are neither selected for metrics nor exposed.
 * Attendance is aggregated across eligible learner memberships only; no learner,
 * session or attendance-recorder identity is returned.
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
          enrollmentId: true,
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

  const baseView = {
    cohort: {
      id: cohort.id,
      name: cohort.name,
      status: cohort.status,
      courseId: cohort.course.id,
      courseTitle: cohort.course.title,
    },
    assignmentRole: assignment.role,
  };
  const learnerIds = cohort.enrollments.map(
    ({ enrollment }) => enrollment.userId,
  );
  const enrollmentIds = cohort.enrollments.map(({ enrollmentId }) => enrollmentId);
  const participantCount = learnerIds.length;

  if (participantCount < INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE) {
    return {
      ...baseView,
      analytics: protectInstructorCohortAnalytics(
        summarizeInstructorCohortAnalytics({
          participantCount,
          completedEnrollments: 0,
          recentlyActiveLearners: 0,
          activeCertificates: 0,
          reviewRequiredAttempts: 0,
          activityWindowDays: ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS,
          presentAttendanceRecords: 0,
          lateAttendanceRecords: 0,
          absentAttendanceRecords: 0,
          excusedAttendanceRecords: 0,
        }),
      ),
    };
  }

  const recentCutoff = activityCutoff(now);
  const completedEnrollments = cohort.enrollments.filter(
    ({ enrollment }) => enrollment.status === EnrollmentStatus.COMPLETED,
  ).length;
  const [
    recentActivityRows,
    certificateRows,
    reviewRequiredAttempts,
    attendanceGroups,
  ] = await Promise.all([
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
    db.cohortSessionAttendance.groupBy({
      by: ['status'],
      where: {
        session: { cohortId: cohort.id },
        cohortEnrollment: {
          active: true,
          enrollmentId: { in: enrollmentIds },
        },
      },
      _count: { _all: true },
    }),
  ]);

  const value = summarizeInstructorCohortAnalytics({
    participantCount,
    completedEnrollments,
    recentlyActiveLearners: recentActivityRows.length,
    activeCertificates: certificateRows.length,
    reviewRequiredAttempts,
    activityWindowDays: ACADEMY_ANALYTICS_ACTIVITY_WINDOW_DAYS,
    presentAttendanceRecords: attendanceCount(
      attendanceGroups,
      CohortAttendanceStatus.PRESENT,
    ),
    lateAttendanceRecords: attendanceCount(
      attendanceGroups,
      CohortAttendanceStatus.LATE,
    ),
    absentAttendanceRecords: attendanceCount(
      attendanceGroups,
      CohortAttendanceStatus.ABSENT,
    ),
    excusedAttendanceRecords: attendanceCount(
      attendanceGroups,
      CohortAttendanceStatus.EXCUSED,
    ),
  });

  return {
    ...baseView,
    analytics: protectInstructorCohortAnalytics(value),
  };
}
