import 'server-only';

import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';

import {
  splitLearnerSessionSchedule,
  type LearnerSessionScheduleItem,
} from './learner-session-schedule';

const SESSION_LIMIT = 100;

export async function getLearnerSessionSchedule(now = new Date()) {
  const user = await requireUser();

  const sessions = await db.cohortSession.findMany({
    where: {
      OR: [
        {
          status: 'SCHEDULED',
          startsAt: { gte: now },
          cohort: {
            enrollments: {
              some: {
                active: true,
                enrollment: {
                  userId: user.id,
                  status: 'ACTIVE',
                },
              },
            },
          },
        },
        {
          OR: [{ status: { not: 'SCHEDULED' } }, { startsAt: { lt: now } }],
          cohort: {
            enrollments: {
              some: {
                enrollment: { userId: user.id },
              },
            },
          },
        },
      ],
    },
    take: SESSION_LIMIT,
    orderBy: [{ startsAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      title: true,
      status: true,
      startsAt: true,
      endsAt: true,
      timeZone: true,
      cohort: {
        select: {
          id: true,
          name: true,
          course: {
            select: { id: true, title: true },
          },
        },
      },
      attendance: {
        where: {
          cohortEnrollment: {
            enrollment: { userId: user.id },
          },
        },
        take: 1,
        orderBy: [{ recordedAt: 'desc' }, { id: 'desc' }],
        select: {
          status: true,
          recordedAt: true,
        },
      },
    },
  });

  const projected: LearnerSessionScheduleItem[] = sessions.map((session) => {
    const attendance = session.attendance[0] ?? null;
    return {
      id: session.id,
      title: session.title,
      status: session.status,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      timeZone: session.timeZone,
      cohort: {
        id: session.cohort.id,
        name: session.cohort.name,
      },
      course: {
        id: session.cohort.course.id,
        title: session.cohort.course.title,
      },
      attendanceStatus: attendance?.status ?? null,
      attendanceRecordedAt: attendance?.recordedAt ?? null,
    };
  });

  return {
    ...splitLearnerSessionSchedule(projected, now),
    limit: SESSION_LIMIT,
  };
}
