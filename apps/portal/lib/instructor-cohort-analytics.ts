import {
  DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE,
  calculateBoundedPercentage,
  protectAggregate,
} from '@luminol/analytics';
import { z } from 'zod';

export const INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE =
  DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE;

export type InstructorCohortAnalyticsValue = {
  participantCount: number;
  completedEnrollments: number;
  completionPercent: number;
  recentlyActiveLearners: number;
  recentActivityPercent: number;
  activeCertificates: number;
  certificatePercent: number;
  reviewRequiredAttempts: number;
  activityWindowDays: number;
};

export type ProtectedInstructorCohortAnalytics =
  | {
      state: 'visible';
      minimumGroupSize: number;
      value: InstructorCohortAnalyticsValue;
    }
  | {
      state: 'suppressed';
      minimumGroupSize: number;
      reason: 'minimum-group-size';
    };

const analyticsCountSchema = z.number().int().nonnegative();

export function summarizeInstructorCohortAnalytics(input: {
  participantCount: number;
  completedEnrollments: number;
  recentlyActiveLearners: number;
  activeCertificates: number;
  reviewRequiredAttempts: number;
  activityWindowDays: number;
}): InstructorCohortAnalyticsValue {
  const participantCount = analyticsCountSchema.parse(input.participantCount);
  const completedEnrollments = analyticsCountSchema
    .max(participantCount)
    .parse(input.completedEnrollments);
  const recentlyActiveLearners = analyticsCountSchema
    .max(participantCount)
    .parse(input.recentlyActiveLearners);
  const activeCertificates = analyticsCountSchema
    .max(participantCount)
    .parse(input.activeCertificates);
  const reviewRequiredAttempts = analyticsCountSchema.parse(
    input.reviewRequiredAttempts,
  );
  const activityWindowDays = z
    .number()
    .int()
    .positive()
    .max(366)
    .parse(input.activityWindowDays);

  return {
    participantCount,
    completedEnrollments,
    completionPercent: calculateBoundedPercentage(
      completedEnrollments,
      participantCount,
    ),
    recentlyActiveLearners,
    recentActivityPercent: calculateBoundedPercentage(
      recentlyActiveLearners,
      participantCount,
    ),
    activeCertificates,
    certificatePercent: calculateBoundedPercentage(
      activeCertificates,
      participantCount,
    ),
    reviewRequiredAttempts,
    activityWindowDays,
  };
}

/**
 * Reuses the Milestone 17 aggregate suppression contract while deliberately
 * removing the exact small-group size from the presentation-layer result.
 */
export function protectInstructorCohortAnalytics(
  value: InstructorCohortAnalyticsValue,
): ProtectedInstructorCohortAnalytics {
  const protectedAggregate = protectAggregate(
    value.participantCount,
    value,
    INSTRUCTOR_COHORT_ANALYTICS_MINIMUM_GROUP_SIZE,
  );

  if (protectedAggregate.state === 'suppressed') {
    return {
      state: 'suppressed',
      minimumGroupSize: protectedAggregate.minimumGroupSize,
      reason: protectedAggregate.reason,
    };
  }

  return {
    state: 'visible',
    minimumGroupSize: protectedAggregate.minimumGroupSize,
    value: protectedAggregate.value,
  };
}
