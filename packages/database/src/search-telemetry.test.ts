import { SearchResultBucket } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import {
  searchResultBucketForCount,
  searchTelemetryDay,
} from './index';

describe('privacy-safe search telemetry aggregates', () => {
  it('buckets only aggregate result counts', () => {
    expect(searchResultBucketForCount(0)).toBe(SearchResultBucket.ZERO);
    expect(searchResultBucketForCount(1)).toBe(
      SearchResultBucket.ONE_TO_FIVE,
    );
    expect(searchResultBucketForCount(5)).toBe(
      SearchResultBucket.ONE_TO_FIVE,
    );
    expect(searchResultBucketForCount(6)).toBe(
      SearchResultBucket.SIX_TO_TWENTY,
    );
    expect(searchResultBucketForCount(20)).toBe(
      SearchResultBucket.SIX_TO_TWENTY,
    );
    expect(searchResultBucketForCount(21)).toBe(
      SearchResultBucket.TWENTY_PLUS,
    );
    expect(searchResultBucketForCount(Number.NaN)).toBe(
      SearchResultBucket.ZERO,
    );
  });

  it('normalizes aggregation days to UTC midnight', () => {
    expect(searchTelemetryDay(new Date('2026-08-09T23:59:59.999Z'))).toEqual(
      new Date('2026-08-09T00:00:00.000Z'),
    );
  });
});
