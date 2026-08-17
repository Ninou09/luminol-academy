import { describe, expect, it } from 'vitest';

import {
  ATTENDANCE_STATUSES,
  assertAttendanceMutationAccess,
  canScheduleSessionForCohort,
  canTransitionCohortSession,
  cohortSessionAttendanceSchema,
  cohortSessionSchema,
  decideAttendanceMutationAccess,
  ianaTimeZoneSchema,
} from './cohort-sessions';

const session = {
  id: 'session-1',
  cohortId: 'cohort-1',
  title: 'Session 1',
  status: 'SCHEDULED' as const,
  startsAt: '2026-09-01T09:00:00Z',
  endsAt: '2026-09-01T11:00:00Z',
  timeZone: 'Africa/Algiers',
};

const enrollment = {
  id: 'enrollment-1',
  cohortId: 'cohort-1',
  learnerUserId: 'learner-1',
  status: 'ACTIVE' as const,
};

const leadAssignment = {
  cohortId: 'cohort-1',
  instructorUserId: 'instructor-1',
  role: 'LEAD' as const,
  active: true,
};

describe('cohort session contracts', () => {
  it('accepts a bounded session with explicit instants and an IANA timezone', () => {
    expect(cohortSessionSchema.parse(session)).toEqual(session);
    expect(ianaTimeZoneSchema.safeParse('Europe/Paris').success).toBe(true);
    expect(ianaTimeZoneSchema.safeParse('not/a-zone').success).toBe(false);
  });

  it('rejects reversed, zero-length, excessive and offset-free windows', () => {
    expect(
      cohortSessionSchema.safeParse({
        ...session,
        endsAt: session.startsAt,
      }).success,
    ).toBe(false);

    expect(
      cohortSessionSchema.safeParse({
        ...session,
        endsAt: '2026-09-01T22:00:01Z',
      }).success,
    ).toBe(false);

    expect(
      cohortSessionSchema.safeParse({
        ...session,
        startsAt: '2026-09-01T09:00:00',
      }).success,
    ).toBe(false);
  });

  it('keeps completed and cancelled sessions terminal', () => {
    expect(canTransitionCohortSession('SCHEDULED', 'COMPLETED')).toBe(true);
    expect(canTransitionCohortSession('SCHEDULED', 'CANCELLED')).toBe(true);
    expect(canTransitionCohortSession('COMPLETED', 'SCHEDULED')).toBe(false);
    expect(canTransitionCohortSession('CANCELLED', 'SCHEDULED')).toBe(false);
    expect(canTransitionCohortSession('SCHEDULED', 'SCHEDULED')).toBe(false);
  });

  it('allows scheduling only while the cohort can still deliver teaching', () => {
    expect(canScheduleSessionForCohort('PLANNED')).toBe(true);
    expect(canScheduleSessionForCohort('ACTIVE')).toBe(true);
    expect(canScheduleSessionForCohort('COMPLETED')).toBe(false);
    expect(canScheduleSessionForCohort('CANCELLED')).toBe(false);
  });
});

describe('attendance contracts', () => {
  it('keeps the neutral attendance vocabulary bounded', () => {
    expect(ATTENDANCE_STATUSES).toEqual([
      'PRESENT',
      'ABSENT',
      'LATE',
      'EXCUSED',
    ]);

    for (const status of ATTENDANCE_STATUSES) {
      expect(
        cohortSessionAttendanceSchema.safeParse({
          sessionId: 'session-1',
          cohortId: 'cohort-1',
          enrollmentId: 'enrollment-1',
          learnerUserId: 'learner-1',
          status,
          recordedAt: '2026-09-01T11:00:00Z',
        }).success,
      ).toBe(true);
    }
  });

  it('allows the exact active lead or assistant assignment', () => {
    expect(
      decideAttendanceMutationAccess({
        actorUserId: 'instructor-1',
        session,
        enrollment,
        assignment: leadAssignment,
      }),
    ).toEqual({ allowed: true, authority: 'instructor-assignment' });

    expect(
      decideAttendanceMutationAccess({
        actorUserId: 'instructor-1',
        session,
        enrollment,
        assignment: { ...leadAssignment, role: 'ASSISTANT' },
      }),
    ).toEqual({ allowed: true, authority: 'instructor-assignment' });
  });

  it('keeps reviewers read-only even when they are assigned', () => {
    expect(
      decideAttendanceMutationAccess({
        actorUserId: 'instructor-1',
        session,
        enrollment,
        assignment: { ...leadAssignment, role: 'REVIEWER' },
      }),
    ).toEqual({ allowed: false, reason: 'reviewer-read-only' });
  });

  it('fails closed for wrong cohort, inactive enrollment, cancelled session or instructor scope', () => {
    expect(
      decideAttendanceMutationAccess({
        actorUserId: 'instructor-1',
        session,
        enrollment: { ...enrollment, cohortId: 'cohort-2' },
        assignment: leadAssignment,
      }),
    ).toEqual({ allowed: false, reason: 'wrong-enrollment-cohort' });

    expect(
      decideAttendanceMutationAccess({
        actorUserId: 'instructor-1',
        session,
        enrollment: { ...enrollment, status: 'COMPLETED' },
        assignment: leadAssignment,
      }),
    ).toEqual({ allowed: false, reason: 'inactive-enrollment' });

    expect(
      decideAttendanceMutationAccess({
        actorUserId: 'instructor-1',
        session: { ...session, status: 'CANCELLED' },
        enrollment,
        assignment: leadAssignment,
      }),
    ).toEqual({ allowed: false, reason: 'cancelled-session' });

    expect(
      decideAttendanceMutationAccess({
        actorUserId: 'another-instructor',
        session,
        enrollment,
        assignment: leadAssignment,
      }),
    ).toEqual({ allowed: false, reason: 'wrong-instructor' });
  });

  it('permits only an explicit academy override and identifies its authority', () => {
    expect(
      decideAttendanceMutationAccess({
        actorUserId: 'academy-admin',
        session,
        enrollment,
        assignment: null,
        academyOverride: true,
      }),
    ).toEqual({ allowed: true, authority: 'academy-override' });
  });

  it('throws a stable denial when mutation access is asserted', () => {
    expect(() =>
      assertAttendanceMutationAccess({
        actorUserId: 'instructor-1',
        session,
        enrollment,
        assignment: { ...leadAssignment, active: false },
      }),
    ).toThrow('Attendance mutation access denied: inactive-assignment');
  });
});
