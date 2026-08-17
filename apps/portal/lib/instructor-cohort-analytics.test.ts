import { describe, expect, it } from 'vitest';

import {
  INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE,
  protectInstructorCohortAnalytics,
  summarizeInstructorCohortAnalytics,
} from './instructor-cohort-analytics';

describe('instructor cohort analytics', () => {
  it('calculates bounded explainable cohort metrics', () => {
    const summary = summarizeInstructorCohortAnalytics({
      participantCount: 10,
      completedEnrollments: 7,
      recentlyActiveLearners: 6,
      activeCertificates: 5,
      reviewRequiredAttempts: 3,
      activityWindowDays: 30,
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
    });
  });

  it('suppresses small cohorts without returning their exact size', () => {
    const protectedAnalytics = protectInstructorCohortAnalytics(
      summarizeInstructorCohortAnalytics({
        participantCount: INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE - 1,
        completedEnrollments: 2,
        recentlyActiveLearners: 2,
        activeCertificates: 1,
        reviewRequiredAttempts: 1,
        activityWindowDays: 30,
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

  it('returns metrics only when the Milestone 17 minimum is met', () => {
    const protectedAnalytics = protectInstructorCohortAnalytics(
      summarizeInstructorCohortAnalytics({
        participantCount: INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE,
        completedEnrollments: 3,
        recentlyActiveLearners: 4,
        activeCertificates: 2,
        reviewRequiredAttempts: 0,
        activityWindowDays: 30,
      }),
    );

    expect(protectedAnalytics.state).toBe('visible');
    if (protectedAnalytics.state === 'visible') {
      expect(protectedAnalytics.value.participantCount).toBe(5);
      expect(protectedAnalytics.value.completionPercent).toBe(60);
    }
  });

  it('rejects impossible counts rather than clipping them', () => {
    expect(() =>
      summarizeInstructorCohortAnalytics({
        participantCount: 5,
        completedEnrollments: 6,
        recentlyActiveLearners: 2,
        activeCertificates: 1,
        reviewRequiredAttempts: 0,
        activityWindowDays: 30,
      }),
    ).toThrow();
  });
});
