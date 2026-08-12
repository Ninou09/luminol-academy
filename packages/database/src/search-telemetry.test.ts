import { describe, expect, it } from 'vitest';

import {
  PRISMA_PG_CONNECTION_TIMEOUT_MS,
  PRISMA_PG_IDLE_TIMEOUT_MS,
  SEARCH_TELEMETRY_STATEMENT_TIMEOUT_MS,
  SEARCH_TELEMETRY_TRANSACTION_MAX_WAIT_MS,
  SEARCH_TELEMETRY_TRANSACTION_TIMEOUT_MS,
  SearchResultBucket,
  normalizePrismaPostgresConnectionString,
  searchResultBucketForCount,
  searchTelemetryDay,
} from './index';

describe('Prisma PostgreSQL connection hardening', () => {
  it.each(['prefer', 'require', 'verify-ca'])(
    'pins legacy strict alias %s to verify-full',
    (sslMode) => {
      const normalized = normalizePrismaPostgresConnectionString(
        `postgresql://user:password@db.example.com/luminol?sslmode=${sslMode}&channel_binding=require`,
      );
      const url = new URL(normalized);

      expect(url.searchParams.get('sslmode')).toBe('verify-full');
      expect(url.searchParams.get('channel_binding')).toBe('require');
    },
  );

  it('validates the database URL with the governed PostgreSQL schema first', () => {
    expect(() =>
      normalizePrismaPostgresConnectionString(
        'https://db.example.com/luminol?sslmode=require',
      ),
    ).toThrow();
  });

  it.each([
    ['disable&sslmode=require', 'verify-full'],
    ['require&sslmode=disable', 'disable'],
  ])(
    'normalizes the downstream-effective duplicate sslmode for %s',
    (sslModes, expected) => {
      const normalized = normalizePrismaPostgresConnectionString(
        `postgresql://user:password@db.example.com/luminol?sslmode=${sslModes}`,
      );
      const url = new URL(normalized);

      expect(url.searchParams.getAll('sslmode')).toEqual([expected]);
    },
  );

  it('uses the last libpq compatibility parameter like the downstream parser', () => {
    const optIn = new URL(
      normalizePrismaPostgresConnectionString(
        'postgresql://user:password@db.example.com/luminol?sslmode=require&uselibpqcompat=false&uselibpqcompat=true',
      ),
    );
    const optOut = new URL(
      normalizePrismaPostgresConnectionString(
        'postgresql://user:password@db.example.com/luminol?sslmode=require&uselibpqcompat=true&uselibpqcompat=false',
      ),
    );

    expect(optIn.searchParams.get('sslmode')).toBe('require');
    expect(optIn.searchParams.getAll('uselibpqcompat')).toEqual(['true']);
    expect(optOut.searchParams.get('sslmode')).toBe('verify-full');
    expect(optOut.searchParams.getAll('uselibpqcompat')).toEqual(['false']);
  });

  it('matches pg case-sensitive libpq compatibility semantics', () => {
    for (const value of ['TRUE', 'True', 'tRuE']) {
      const normalized = normalizePrismaPostgresConnectionString(
        `postgresql://user:password@db.example.com/luminol?sslmode=require&uselibpqcompat=${value}`,
      );
      const url = new URL(normalized);

      expect(url.searchParams.get('sslmode')).toBe('verify-full');
      expect(url.searchParams.get('uselibpqcompat')).toBe(value);
    }
  });

  it('leaves explicit verify-full and non-TLS modes unchanged', () => {
    for (const sslMode of ['verify-full', 'disable']) {
      const normalized = normalizePrismaPostgresConnectionString(
        `postgresql://user:password@db.example.com/luminol?sslmode=${sslMode}`,
      );

      expect(new URL(normalized).searchParams.get('sslmode')).toBe(sslMode);
    }
  });

  it('respects an explicit lowercase libpq compatibility opt-in', () => {
    const normalized = normalizePrismaPostgresConnectionString(
      'postgresql://user:password@db.example.com/luminol?sslmode=require&uselibpqcompat=true',
    );
    const url = new URL(normalized);

    expect(url.searchParams.get('sslmode')).toBe('require');
    expect(url.searchParams.get('uselibpqcompat')).toBe('true');
  });
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

  it('preserves the Prisma v6 PostgreSQL timeout behavior', () => {
    expect(PRISMA_PG_CONNECTION_TIMEOUT_MS).toBe(5_000);
    expect(PRISMA_PG_IDLE_TIMEOUT_MS).toBe(300_000);
  });

  it('keeps telemetry database waits short and explicitly bounded', () => {
    expect(SEARCH_TELEMETRY_STATEMENT_TIMEOUT_MS).toBeGreaterThan(0);
    expect(SEARCH_TELEMETRY_STATEMENT_TIMEOUT_MS).toBeLessThanOrEqual(100);
    expect(SEARCH_TELEMETRY_TRANSACTION_MAX_WAIT_MS).toBeLessThanOrEqual(100);
    expect(SEARCH_TELEMETRY_TRANSACTION_TIMEOUT_MS).toBeGreaterThan(
      SEARCH_TELEMETRY_STATEMENT_TIMEOUT_MS,
    );
    expect(SEARCH_TELEMETRY_TRANSACTION_TIMEOUT_MS).toBeLessThanOrEqual(250);
  });
});
