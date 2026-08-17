import { describe, expect, it } from 'vitest';

import {
  INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE,
  protectInstructorCohortAnalytics,
  summarizeInstructorCohortAnalytics,
} from './instructor-cohort-analytics';

describe('instructor cohort analytics', () => {
  it('calculates bounded explainable cohort and attendance metrics', () => {
    const summary = summarizeInstructorCohortAnalytics({
      participantCount: 10,
      completedEnrollments: 7,
      recentlyActiveLearners: 6,
      activeCertificates: 5,
      reviewRequiredAttempts: 3,
      activityWindowDays: 30,
      presentAttendanceRecords: 14,
      lateAttendanceRecords: 2,
      absentAttendanceRecords: 3,
      excusedAttendanceRecords: 1,
    });

    expect(summary).toEqual({
      participantCount: 10,
      completedEnrollments: 7,
      completionPercent: 70,
      recentlyActiveLearners: 6,
      recentActivityPercent: 60,
      activeCertificates: 5,
      certificatePercent: 50,
      reviewRequiredAttempts: 3,
      activityWindowDays: 30,
      attendanceRecords: 20,
      attendedRecords: 16,
      attendancePercent: 80,
      absentRecords: 3,
      excusedRecords: 1,
    });
  });

  it('suppresses small cohorts without returning their exact size or attendance', () => {
    const protectedAnalytics = protectInstructorCohortAnalytics(
      summarizeInstructorCohortAnalytics({
        participantCount: INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE - 1,
        completedEnrollments: 2,
        recentlyActiveLearners: 2,
        activeCertificates: 1,
        reviewRequiredAttempts: 1,
        activityWindowDays: 30,
        presentAttendanceRecords: 3,
        lateAttendanceRecords: 0,
        absentAttendanceRecords: 1,
        excusedAttendanceRecords: 0,
      }),
    );

    expect(protectedAnalytics).toEqual({
      state: 'suppressed',
      minimumGroupSize: INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE,
      reason: 'minimum-group-size',
    });
    expect('groupSize' in protectedAnalytics).toBe(false);
    expect('value' in protectedAnalytics).toBe(false);
  });

  it('returns aggregate attendance only when the minimum group size is met', () => {
    const protectedAnalytics = protectInstructorCohortAnalytics(
      summarizeInstructorCohortAnalytics({
        participantCount: INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE,
        completedEnrollments: 3,
        recentlyActiveLearners: 4,
        activeCertificates: 2,
        reviewRequiredAttempts: 0,
        activityWindowDays: 30,
        presentAttendanceRecords: 8,
        lateAttendanceRecords: 1,
        absentAttendanceRecords: 1,
        excusedAttendanceRecords: 0,
      }),
    );

    expect(protectedAnalytics.state).toBe('visible');
    if (protectedAnalytics.state === 'visible') {
      expect(protectedAnalytics.value.participantCount).toBe(5);
      expect(protectedAnalytics.value.completionPercent).toBe(60);
      expect(protectedAnalytics.value.attendanceRecords).toBe(10);
      expect(protectedAnalytics.value.attendancePercent).toBe(90);
    }
  });

  it('returns zero attendance rate when no attendance has been recorded', () => {
    const summary = summarizeInstructorCohortAnalytics({
      participantCount: 5,
      completedEnrollments: 0,
      recentlyActiveLearners: 0,
      activeCertificates: 0,
      reviewRequiredAttempts: 0,
      activityWindowDays: 30,
      presentAttendanceRecords: 0,
      lateAttendanceRecords: 0,
      absentAttendanceRecords: 0,
      excusedAttendanceRecords: 0,
    });

    expect(summary.attendanceRecords).toBe(0);
    expect(summary.attendancePercent).toBe(0);
  });

  it('rejects impossible participant-bounded counts rather than clipping them', () => {
    expect(() =>
      summarizeInstructorCohortAnalytics({
        participantCount: 5,
        completedEnrollments: 6,
        recentlyActiveLearners: 2,
        activeCertificates: 1,
        reviewRequiredAttempts: 0,
        activityWindowDays: 30,
        presentAttendanceRecords: 0,
        lateAttendanceRecords: 0,
        absentAttendanceRecords: 0,
        excusedAttendanceRecords: 0,
      }),
    ).toThrow();
  });
});
