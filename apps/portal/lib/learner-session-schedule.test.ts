import { describe, expect, it } from 'vitest';

import {
  splitLearnerSessionSchedule,
  type LearnerSessionScheduleItem,
} from './learner-session-schedule';

function session(
  id: string,
  startsAt: string,
  status: LearnerSessionScheduleItem['status'] = 'SCHEDULED',
): LearnerSessionScheduleItem {
  return {
    id,
    title: null,
    status,
    startsAt: new Date(startsAt),
    endsAt: new Date(new Date(startsAt).getTime() + 60 * 60 * 1000),
    timeZone: 'Africa/Algiers',
    cohort: { id: 'cohort-1', name: 'Cohort 1' },
    course: { id: 'course-1', title: 'Course 1' },
    attendanceStatus: null,
    attendanceRecordedAt: null,
  };
}

describe('learner session schedule projection', () => {
  it('keeps future scheduled sessions upcoming and sorts them ascending', () => {
    const now = new Date('2026-09-01T10:00:00.000Z');
    const result = splitLearnerSessionSchedule(
      [
        session('later', '2026-09-03T09:00:00.000Z'),
        session('next', '2026-09-02T09:00:00.000Z'),
      ],
      now,
    );

    expect(result.upcoming.map(({ id }) => id)).toEqual(['next', 'later']);
    expect(result.past).toEqual([]);
  });

  it('treats started, completed and cancelled sessions as history', () => {
    const now = new Date('2026-09-02T10:00:00.000Z');
    const result = splitLearnerSessionSchedule(
      [
        session('started', '2026-09-02T09:00:00.000Z'),
        session('completed', '2026-09-01T09:00:00.000Z', 'COMPLETED'),
        session('cancelled', '2026-09-04T09:00:00.000Z', 'CANCELLED'),
      ],
      now,
    );

    expect(result.upcoming).toEqual([]);
    expect(result.past.map(({ id }) => id)).toEqual([
      'cancelled',
      'started',
      'completed',
    ]);
  });

  it('preserves only the projected learner attendance fields', () => {
    const projected = session('past', '2026-09-01T09:00:00.000Z', 'COMPLETED');
    projected.attendanceStatus = 'PRESENT';
    projected.attendanceRecordedAt = new Date('2026-09-01T10:05:00.000Z');

    const result = splitLearnerSessionSchedule(
      [projected],
      new Date('2026-09-02T10:00:00.000Z'),
    );

    expect(result.past[0]).toMatchObject({
      attendanceStatus: 'PRESENT',
      attendanceRecordedAt: new Date('2026-09-01T10:05:00.000Z'),
    });
  });
});
