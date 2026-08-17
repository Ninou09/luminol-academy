import type { AttendanceStatus } from '@luminol/professional';

export type LearnerSessionScheduleItem = {
  id: string;
  title: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  cohort: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    title: string;
  };
  attendanceStatus: AttendanceStatus | null;
  attendanceRecordedAt: Date | null;
};

export type LearnerSessionSchedule = {
  upcoming: LearnerSessionScheduleItem[];
  past: LearnerSessionScheduleItem[];
};

export function splitLearnerSessionSchedule(
  sessions: readonly LearnerSessionScheduleItem[],
  now: Date,
): LearnerSessionSchedule {
  const upcoming: LearnerSessionScheduleItem[] = [];
  const past: LearnerSessionScheduleItem[] = [];

  for (const session of sessions) {
    if (session.status === 'SCHEDULED' && session.startsAt >= now) {
      upcoming.push(session);
    } else {
      past.push(session);
    }
  }

  upcoming.sort(
    (left, right) =>
      left.startsAt.getTime() - right.startsAt.getTime() ||
      left.id.localeCompare(right.id),
  );
  past.sort(
    (left, right) =>
      right.startsAt.getTime() - left.startsAt.getTime() ||
      left.id.localeCompare(right.id),
  );

  return { upcoming, past };
}
