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
  it('keeps learner metrics self-only', () => {
    const metric = 'personal-learning-progress';

    expect(canAccessAnalyticsMetric('learner-self', metric)).toBe(true);
    expect(canAccessAnalyticsMetric('academy-admin', metric)).toBe(false);
    expect(canAccessAnalyticsMetric('organization-manager', metric)).toBe(false);
  });

  it('separates organization aggregates from learner analytics', () => {
    const metric = 'organization-aggregate-progress';

    expect(canAccessAnalyticsMetric('organization-manager', metric)).toBe(true);
    expect(canAccessAnalyticsMetric('learner-self', metric)).toBe(false);
  });

  it('returns metrics available to an organization manager', () => {
    const metrics = getAccessibleAnalyticsMetrics('organization-manager');

    expect(metrics).toContain('organization-seat-utilization');
    expect(metrics).toContain('organization-aggregate-progress');
    expect(metrics).not.toContain('review-workload');
    expect(metrics).not.toContain('personal-certificates');
  });
});

describe('analytics data minimization', () => {
  it('classifies forbidden analytics data', () => {
    const expected = [
      'assessment-answer',
      'psychology-content',
      'enquiry-message',
      'payment-detail',
      'learner-authored-text',
      'raw-search-query',
      'session-identifier',
      'ip-address',
    ];

    expect(FORBIDDEN_ANALYTICS_DATA_CLASSES).toEqual(
      expect.arrayContaining(expected),
    );
  });

  it('matches exact forbidden data-class names', () => {
    expect(isForbiddenAnalyticsDataClass('psychology-content')).toBe(true);
    expect(isForbiddenAnalyticsDataClass('learning-progress')).toBe(false);
  });
});

describe('bounded analytics calculations', () => {
  it('returns zero for an empty denominator', () => {
    expect(calculateBoundedPercentage(0, 0)).toBe(0);
  });

  it('rounds percentages and caps them at one hundred', () => {
    expect(calculateBoundedPercentage(2, 3)).toBe(67);
    expect(calculateBoundedPercentage(8, 5)).toBe(100);
  });

  it('rejects invalid inputs', () => {
    expect(() => calculateBoundedPercentage(-1, 3)).toThrow(RangeError);
    expect(() => calculateBoundedPercentage(1, Number.NaN)).toThrow(RangeError);
  });
});

describe('analytics date windows', () => {
  it('accepts a bounded chronological window', () => {
    const from = new Date('2026-08-01T00:00:00.000Z');
    const to = new Date('2026-08-17T00:00:00.000Z');
    const result = validateAnalyticsWindow({ from, to });

    expect(result).toEqual({ valid: true, durationDays: 16 });
  });

  it('rejects a reversed window', () => {
    const from = new Date('2026-08-17T00:00:00.000Z');
    const to = new Date('2026-08-01T00:00:00.000Z');
    const result = validateAnalyticsWindow({ from, to });

    expect(result).toEqual({ valid: false, reason: 'reversed' });
  });

  it('rejects an invalid date', () => {
    const from = new Date('invalid');
    const to = new Date();
    const result = validateAnalyticsWindow({ from, to });

    expect(result).toEqual({ valid: false, reason: 'invalid-date' });
  });

  it('rejects an overly wide window', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const to = new Date('2026-02-15T00:00:00.000Z');
    const result = validateAnalyticsWindow({ from, to }, 30);

    expect(result).toEqual({ valid: false, reason: 'too-wide' });
  });
});

describe('minimum-group suppression', () => {
  it('suppresses small aggregates without returning the value', () => {
    const groupSize = DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE - 1;
    const result = protectAggregate(groupSize, { completionRate: 75 });

    expect(result).toEqual({
      state: 'suppressed',
      groupSize: 4,
      minimumGroupSize: DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE,
      reason: 'minimum-group-size',
    });
    expect('value' in result).toBe(false);
  });

  it('reveals aggregates at the privacy threshold', () => {
    const groupSize = DEFAULT_MINIMUM_AGGREGATE_GROUP_SIZE;
    const result = protectAggregate(groupSize, { completionRate: 80 });

    expect(result).toEqual({
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
