export const ANALYTICS_AUDIENCES = [
  'learner-self',
  'instructor-cohort',
  'academy-admin',
  'organization-manager',
] as const;

export type AnalyticsAudience = (typeof ANALYTICS_AUDIENCES)[number];

export const ANALYTICS_METRICS = [
  'personal-learning-progress',
  'personal-certificates',
  'personal-language-progress',
  'personal-professional-progress',
  'cohort-completion',
  'cohort-activity',
  'review-workload',
  'programme-completion',
  'programme-participation',
  'certificate-completion',
  'organization-seat-utilization',
  'organization-assigned-learning',
  'organization-aggregate-progress',
] as const;

export type AnalyticsMetric = (typeof ANALYTICS_METRICS)[number];

const ANALYTICS_METRIC_AUDIENCES = {
  'personal-learning-progress': ['learner-self'],
  'personal-certificates': ['learner-self'],
  'personal-language-progress': ['learner-self'],
  'personal-professional-progress': ['learner-self'],
  'cohort-completion': ['instructor-cohort', 'academy-admin'],
  'cohort-activity': ['instructor-cohort', 'academy-admin'],
  'review-workload': ['instructor-cohort', 'academy-admin'],
  'programme-completion': ['academy-admin'],
  'programme-participation': ['academy-admin'],
  'certificate-completion': [
    'instructor-cohort',
    'academy-admin',
    'organization-manager',
  ],
  'organization-seat-utilization': ['academy-admin', 'organization-manager'],
  'organization-assigned-learning': ['academy-admin', 'organization-manager'],
  'organization-aggregate-progress': ['academy-admin', 'organization-manager'],
} as const satisfies Record<AnalyticsMetric, readonly AnalyticsAudience[]>;

export const FORBIDDEN_ANALYTICS_DATA_CLASSES = [
  'assessment-answer',
  'psychology-content',
  'enquiry-message',
  'payment-detail',
  'private-certificate-metadata',
  'learner-authored-text',
  'raw-search-query',
  'session-identifier',
  'ip-address',
  'identity-record',
] as const;

export type ForbiddenAnalyticsDataClass =
  (typeof FORBIDDEN_ANALYTICS_DATA_CLASSES)[number];

export const DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE = 5;
export const DEFAULT_MAX_ANALYTICS_WINDOW_DAYS = 366;

export function canAccessAnalyticsMetric(
  audience: AnalyticsAudience,
  metric: AnalyticsMetric,
): boolean {
  return (
    ANALYTICS_METRIC_AUDIENCES[metric] as readonly AnalyticsAudience[]
  ).includes(audience);
}

export function getAccessibleAnalyticsMetrics(
  audience: AnalyticsAudience,
): AnalyticsMetric[] {
  return ANALYTICS_METRICS.filter((metric) =>
    canAccessAnalyticsMetric(audience, metric),
  );
}

export function isForbiddenAnalyticsDataClass(
  value: string,
): value is ForbiddenAnalyticsDataClass {
  return (FORBIDDEN_ANALYTICS_DATA_CLASSES as readonly string[]).includes(
    value,
  );
}

function assertNonNegativeFinite(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite non-negative number`);
  }
}

export function calculateBoundedPercentage(
  numerator: number,
  denominator: number,
): number {
  assertNonNegativeFinite(numerator, 'numerator');
  assertNonNegativeFinite(denominator, 'denominator');

  if (denominator === 0) return 0;

  return Math.round((Math.min(numerator, denominator) / denominator) * 100);
}

export type AnalyticsWindow = {
  from: Date;
  to: Date;
};

export type AnalyticsWindowValidation =
  | {
      valid: true;
      durationDays: number;
    }
  | {
      valid: false;
      reason: 'invalid-date' | 'reversed' | 'too-wide';
    };

export function validateAnalyticsWindow(
  window: AnalyticsWindow,
  maxDays = DEFAULT_MAX_ANALYTICS_WINDOW_DAYS,
): AnalyticsWindowValidation {
  if (!Number.isInteger(maxDays) || maxDays <= 0) {
    throw new RangeError('maxDays must be a positive integer');
  }

  const from = window.from.getTime();
  const to = window.to.getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return { valid: false, reason: 'invalid-date' };
  }
  if (to < from) return { valid: false, reason: 'reversed' };

  const durationDays = Math.ceil((to - from) / 86_400_000);
  if (durationDays > maxDays) return { valid: false, reason: 'too-wide' };

  return { valid: true, durationDays };
}

export type ProtectedAggregate<T> =
  | {
      state: 'visible';
      groupSize: number;
      minimumGroupSize: number;
      value: T;
    }
  | {
      state: 'suppressed';
      groupSize: number;
      minimumGroupSize: number;
      reason: 'minimum-group-size';
    };

export function protectAggregate<T>(
  groupSize: number,
  value: T,
  minimumGroupSize = DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE,
): ProtectedAggregate<T> {
  if (!Number.isInteger(groupSize) || groupSize < 0) {
    throw new RangeError('groupSize must be a non-negative integer');
  }
  if (!Number.isInteger(minimumGroupSize) || minimumGroupSize < 2) {
    throw new RangeError('minimumGroupSize must be an integer of at least 2');
  }

  if (groupSize < minimumGroupSize) {
    return {
      state: 'suppressed',
      groupSize,
      minimumGroupSize,
      reason: 'minimum-group-size',
    };
  }

  return {
    state: 'visible',
    groupSize,
    minimumGroupSize,
    value,
  };
}
