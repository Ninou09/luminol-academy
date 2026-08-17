import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE,
  FORBIDDEN_ANALYTICS_DATA_CLASSES,
  calculateBoundedPercentage,
  canAccessAnalyticsMetric,
  getAccessibleAnalyticsMetrics,
  isForbiddenAnalyticsDataClass,
  protectAggregate,
  validateAnalyticsWindow,
} from './learning-outcomes';

describe('analytics audience boundaries', () => {
  it('keeps learner-self metrics private to the learner', () => {
    expect(
      canAccessAnalyticsMetric('learner-self', 'personal-learning-progress'),
    ).toBe(true);
    expect(
      canAccessAnalyticsMetric('academy-admin', 'personal-learning-progress'),
    ).toBe(false);
    expect(
      canAccessAnalyticsMetric(
        'organization-manager',
        'personal-learning-progress',
      ),
    ).toBe(false);
  });

  it('separates organization aggregates from learner-self analytics', () => {
    expect(
      canAccessAnalyticsMetric(
        'organization-manager',
        'organization-aggregate-progress',
      ),
    ).toBe(true);
    expect(
      canAccessAnalyticsMetric(
        'learner-self',
        'organization-aggregate-progress',
      ),
    ).toBe(false);
  });

  it('returns only metrics available to the requested audience', () => {
    const managerMetrics = getAccessibleAnalyticsMetrics(
      'organization-manager',
    );

    expect(managerMetrics).toContain('organization-seat-utilization');
    expect(managerMetrics).toContain('organization-aggregate-progress');
    expect(managerMetrics).not.toContain('review-workload');
    expect(managerMetrics).not.toContain('personal-certificates');
  });
});

describe('analytics data minimization', () => {
  it('centrally classifies forbidden analytics data', () => {
    expect(FORBIDDEN_ANALYTICS_DATA_CLASSES).toEqual(
      expect.arrayContaining([
        'assessment-answer',
        'psychology-content',
        'enquiry-message',
        'payment-detail',
        'learner-authored-text',
        'raw-search-query',
        'session-identifier',
        'ip-address',
      ]),
    );
  });

  it('recognizes only exact forbidden data-class names', () => {
    expect(isForbiddenAnalyticsDataClass('psychology-content')).toBe(true);
    expect(isForbiddenAnalyticsDataClass('learning-progress')).toBe(false);
  });
});

describe('bounded analytics calculations', () => {
  it('returns zero for an empty denominator', () => {
    expect(calculateBoundedPercentage(0, 0)).toBe(0);
  });

  it('rounds normal percentages and never exceeds one hundred', () => {
    expect(calculateBoundedPercentage(2, 3)).toBe(67);
    expect(calculateBoundedPercentage(8, 5)).toBe(100);
  });

  it('rejects negative or non-finite inputs', () => {
    expect(() => calculateBoundedPercentage(-1, 3)).toThrow(RangeError);
    expect(() => calculateBoundedPercentage(1, Number.NaN)).toThrow(
      RangeError,
    );
  });
});

describe('analytics date windows', () => {
  it('accepts bounded chronological windows', () => {
    expect(
      validateAnalyticsWindow({
        from: new Date('2026-08-01T00:00:00.000Z'),
        to: new Date('2026-08-17T00:00:00.000Z'),
      }),
    ).toEqual({ valid: true, durationDays: 16 });
  });

  it('fails closed for reversed, invalid, or overly wide windows', () => {
    expect(
      validateAnalyticsWindow({
        from: new Date('2026-08-17T00:00:00.000Z'),
        to: new Date('2026-08-01T00:00:00.000Z'),
      }),
    ).toEqual({ valid: false, reason: 'reversed' });

    expect(
      validateAnalyticsWindow({ from: new Date('invalid'), to: new Date() }),
    ).toEqual({ valid: false, reason: 'invalid-date' });

    expect(
      validateAnalyticsWindow(
        {
          from: new Date('2026-01-01T00:00:00.000Z'),
          to: new Date('2026-02-15T00:00:00.000Z'),
        },
        30,
      ),
    ).toEqual({ valid: false, reason: 'too-wide' });
  });
});

describe('minimum-group suppression', () => {
  it('suppresses aggregates below the privacy threshold without returning the value', () => {
    const result = protectAggregate(
      DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE - 1,
      { completionRate: 75 },
    );

    expect(result).toEqual({
      state: 'suppressed',
      groupSize: 4,
      minimumGroupSize: DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE,
      reason: 'minimum-group-size',
    });
    expect('value' in result).toBe(false);
  });

  it('reveals aggregate values only at or above the threshold', () => {
    expect(
      protectAggregate(DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE, {
        completionRate: 80,
      }),
    ).toEqual({
      state: 'visible',
      groupSize: DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE,
      minimumGroupSize: DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE,
      value: { completionRate: 80 },
    });
  });

  it('rejects invalid thresholds and group sizes', () => {
    expect(() => protectAggregate(-1, {})).toThrow(RangeError);
    expect(() => protectAggregate(10, {}, 1)).toThrow(RangeError);
  });
});
