import 'server-only';

import { requireUser } from '@luminol/auth';
import {
  EnrollmentStatus,
  LearningRecordStatus,
  db,
  getActiveInstructorCohortAssignment,
} from '@luminol/database';
import { assertInstructorCohortAccess } from '@luminol/professional';

function normalizeCohortId(cohortId: string) {
  const normalized = cohortId.trim();
  if (!normalized) throw new TypeError('cohortId is required');
  return normalized;
}

function normalizeSessionId(sessionId: string) {
  const normalized = sessionId.trim();
  if (!normalized) throw new TypeError('sessionId is required');
  return normalized;
}

export async function getAuthorizedInstructorCohortTeachingView(
  cohortId: string,
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
      startsAt: true,
      endsAt: true,
      course: { select: { id: true, title: true } },
      sessions: {
        where: { status: { not: 'CANCELLED' } },
        take: 24,
        orderBy: [{ startsAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          title: true,
          status: true,
          startsAt: true,
          endsAt: true,
          timeZone: true,
          _count: { select: { attendance: true } },
        },
      },
      enrollments: {
        where: {
          active: true,
          enrollment: {
            status: { not: EnrollmentStatus.CANCELLED },
            user: { deletedAt: null },
          },
        },
        orderBy: [{ joinedAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          joinedAt: true,
          enrollment: {
            select: {
              status: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cohort) return null;

  const learnerIds = cohort.enrollments.map(
    ({ enrollment }) => enrollment.user.id,
  );
  const learningGroups =
    learnerIds.length === 0
      ? []
      : await db.learningRecord.groupBy({
          by: ['userId', 'status'],
          where: {
            courseId: cohort.course.id,
            userId: { in: learnerIds },
            status: {
              in: [
                LearningRecordStatus.COMPLETED,
                LearningRecordStatus.IN_PROGRESS,
              ],
            },
          },
          _count: { _all: true },
          _max: { lastActivityAt: true },
        });

  const progressByLearner = new Map<
    string,
    {
      completedLessons: number;
      inProgressLessons: number;
      lastActivityAt: Date | null;
    }
  >();

  for (const group of learningGroups) {
    const current = progressByLearner.get(group.userId) ?? {
      completedLessons: 0,
      inProgressLessons: 0,
      lastActivityAt: null,
    };
    if (group.status === LearningRecordStatus.COMPLETED) {
      current.completedLessons = group._count._all;
    } else if (group.status === LearningRecordStatus.IN_PROGRESS) {
      current.inProgressLessons = group._count._all;
    }
    const latest = group._max.lastActivityAt;
    if (
      latest &&
      (!current.lastActivityAt ||
        latest.getTime() > current.lastActivityAt.getTime())
    ) {
      current.lastActivityAt = latest;
    }
    progressByLearner.set(group.userId, current);
  }

  return {
    cohort: {
      id: cohort.id,
      name: cohort.name,
      status: cohort.status,
      startsAt: cohort.startsAt,
      endsAt: cohort.endsAt,
      courseId: cohort.course.id,
      courseTitle: cohort.course.title,
    },
    assignmentRole: assignment.role,
    sessions: cohort.sessions.map((session) => ({
      id: session.id,
      title: session.title,
      status: session.status,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      timeZone: session.timeZone,
      attendanceCount: session._count.attendance,
    })),
    learners: cohort.enrollments.map(({ id, joinedAt, enrollment }) => {
      const progress = progressByLearner.get(enrollment.user.id) ?? {
        completedLessons: 0,
        inProgressLessons: 0,
        lastActivityAt: null,
      };
      return {
        cohortEnrollmentId: id,
        firstName: enrollment.user.firstName,
        lastName: enrollment.user.lastName,
        enrollmentStatus: enrollment.status,
        joinedAt,
        ...progress,
      };
    }),
  };
}

export async function getAuthorizedInstructorSessionAttendanceView(
  cohortId: string,
  sessionId: string,
) {
  const user = await requireUser();
  const normalizedCohortId = normalizeCohortId(cohortId);
  const normalizedSessionId = normalizeSessionId(sessionId);
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

  const session = await db.cohortSession.findFirst({
    where: {
      id: normalizedSessionId,
      cohortId: normalizedCohortId,
      status: { not: 'CANCELLED' },
      cohort: { status: { not: 'CANCELLED' } },
    },
    select: {
      id: true,
      title: true,
      status: true,
      startsAt: true,
      endsAt: true,
      timeZone: true,
      attendance: {
        select: {
          cohortEnrollmentId: true,
          status: true,
          recordedAt: true,
        },
      },
      cohort: {
        select: {
          id: true,
          name: true,
          course: { select: { title: true } },
          enrollments: {
            where: {
              active: true,
              enrollment: {
                status: EnrollmentStatus.ACTIVE,
                user: { deletedAt: null },
              },
            },
            orderBy: [{ joinedAt: 'asc' }, { id: 'asc' }],
            select: {
              id: true,
              enrollment: {
                select: {
                  status: true,
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  const attendanceByMembership = new Map(
    session.attendance.map((attendance) => [
      attendance.cohortEnrollmentId,
      attendance,
    ]),
  );

  return {
    assignmentRole: assignment.role,
    cohort: {
      id: session.cohort.id,
      name: session.cohort.name,
      courseTitle: session.cohort.course.title,
    },
    session: {
      id: session.id,
      title: session.title,
      status: session.status,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      timeZone: session.timeZone,
    },
    learners: session.cohort.enrollments.map(({ id, enrollment }) => {
      const attendance = attendanceByMembership.get(id);
      return {
        cohortEnrollmentId: id,
        learnerUserId: enrollment.user.id,
        firstName: enrollment.user.firstName,
        lastName: enrollment.user.lastName,
        enrollmentStatus: enrollment.status,
        attendanceStatus: attendance?.status ?? null,
        attendanceRecordedAt: attendance?.recordedAt ?? null,
      };
    }),
  };
}
