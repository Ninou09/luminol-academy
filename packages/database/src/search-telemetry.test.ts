import { SearchResultBucket } from '@prisma/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  SEARCH_TELEMETRY_WRITE_TIMEOUT_MS,
  searchResultBucketForCount,
  searchTelemetryDay,
  settleSearchTelemetryWrite,
} from './index';

afterEach(() => {
  vi.useRealTimers();
});

describe('privacy-safe search telemetry aggregates', () => {
  it('buckets only aggregate result counts', () => {
    expect(searchResultBucketForCount(0)).toBe(SearchResultBucket.ZERO);
    expect(searchResultBucketForCount(1)).toBe(SearchResultBucket.ONE_TO_FIVE);
    expect(searchResultBucketForCount(5)).toBe(SearchResultBucket.ONE_TO_FIVE);
    expect(searchResultBucketForCount(6)).toBe(
      SearchResultBucket.SIX_TO_TWENTY,
    );
    expect(searchResultBucketForCount(20)).toBe(
      SearchResultBucket.SIX_TO_TWENTY,
    );
    expect(searchResultBucketForCount(21)).toBe(SearchResultBucket.TWENTY_PLUS);
    expect(searchResultBucketForCount(Number.NaN)).toBe(
      SearchResultBucket.ZERO,
    );
  });

  it('normalizes aggregation days to UTC midnight', () => {
    expect(searchTelemetryDay(new Date('2026-08-09T23:59:59.999Z'))).toEqual(
      new Date('2026-08-09T00:00:00.000Z'),
    );
  });

  it('bounds a stalled telemetry write instead of blocking search indefinitely', async () => {
    vi.useFakeTimers();
    const stalledWrite = new Promise<never>(() => undefined);
    const settlement = settleSearchTelemetryWrite(stalledWrite);

    await vi.advanceTimersByTimeAsync(SEARCH_TELEMETRY_WRITE_TIMEOUT_MS);

    await expect(settlement).resolves.toBe(false);
  });

  it('reports a telemetry write that settles before the timeout', async () => {
    await expect(settleSearchTelemetryWrite(Promise.resolve())).resolves.toBe(
      true,
    );
    await expect(
      settleSearchTelemetryWrite(Promise.reject(new Error('unavailable'))),
    ).resolves.toBe(false);
  });
});
