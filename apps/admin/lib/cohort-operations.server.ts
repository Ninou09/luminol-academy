import 'server-only';

import { db } from '@luminol/database';

const COHORT_LIMIT = 50;
const OPTION_LIMIT = 100;
const ENROLLMENT_OPTION_LIMIT = 200;
const SESSION_LIMIT = 100;

export async function getCohortOperationsDashboard() {
  const now = new Date();

  const [cohorts, courses, instructors, enrollments] = await Promise.all([
    db.cohort.findMany({
      take: COHORT_LIMIT,
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        status: true,
        startsAt: true,
        endsAt: true,
        courseId: true,
        course: { select: { title: true } },
        sessions: {
          take: SESSION_LIMIT,
          orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
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
        instructorAssignments: {
          where: { active: true },
          take: OPTION_LIMIT,
          orderBy: [{ role: 'asc' }, { assignedAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            role: true,
            assignedAt: true,
            instructorUserId: true,
            instructor: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        enrollments: {
          where: { active: true },
          take: OPTION_LIMIT,
          orderBy: [{ joinedAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            enrollmentId: true,
            joinedAt: true,
            enrollment: {
              select: {
                status: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            instructorAssignments: { where: { active: true } },
            enrollments: { where: { active: true } },
            sessions: true,
          },
        },
      },
    }),
    db.course.findMany({
      where: { published: true },
      take: OPTION_LIMIT,
      orderBy: [{ title: 'asc' }, { id: 'asc' }],
      select: { id: true, title: true },
    }),
    db.user.findMany({
      where: {
        deletedAt: null,
        roles: { some: { role: { key: { in: ['staff', 'admin'] } } } },
      },
      take: OPTION_LIMIT,
      orderBy: [{ email: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
    db.enrollment.findMany({
      where: {
        status: { in: ['PENDING', 'ACTIVE'] },
        user: { deletedAt: null },
      },
      take: ENROLLMENT_OPTION_LIMIT,
      orderBy: [{ enrolledAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        courseId: true,
        status: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const upcoming = cohorts.filter(
    (cohort) =>
      cohort.status !== 'COMPLETED' &&
      cohort.status !== 'CANCELLED' &&
      cohort.startsAt !== null &&
      cohort.startsAt >= now,
  );
  const past = cohorts.filter(
    (cohort) =>
      cohort.status === 'COMPLETED' ||
      cohort.status === 'CANCELLED' ||
      (cohort.endsAt !== null && cohort.endsAt < now),
  );
  const unscheduled = cohorts.filter(
    (cohort) =>
      cohort.status !== 'COMPLETED' &&
      cohort.status !== 'CANCELLED' &&
      cohort.startsAt === null,
  );

  return {
    cohorts,
    courses,
    instructors,
    enrollments,
    operational: {
      upcoming: upcoming.slice(0, 12),
      past: past.slice(-12).reverse(),
      unscheduled: unscheduled.slice(0, 12),
    },
    limits: {
      cohorts: COHORT_LIMIT,
      options: OPTION_LIMIT,
      enrollmentOptions: ENROLLMENT_OPTION_LIMIT,
      sessions: SESSION_LIMIT,
    },
  };
}
