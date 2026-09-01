import { databaseUrlSchema } from '@luminol/validation/env';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  SearchOutcome,
  SearchResultBucket,
  type SearchSurface,
} from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const PRISMA_PG_CONNECTION_TIMEOUT_MS = 5_000;
export const PRISMA_PG_IDLE_TIMEOUT_MS = 300_000;
export const SEARCH_TELEMETRY_STATEMENT_TIMEOUT_MS = 100;
export const SEARCH_TELEMETRY_TRANSACTION_MAX_WAIT_MS = 100;
export const SEARCH_TELEMETRY_TRANSACTION_TIMEOUT_MS = 250;

const LEGACY_STRICT_SSL_MODES = new Set(['prefer', 'require', 'verify-ca']);

function normalizeEffectiveSearchParameter(url: URL, name: string) {
  const values = url.searchParams.getAll(name);
  const effectiveValue = values.at(-1);

  if (values.length > 1 && effectiveValue !== undefined) {
    url.searchParams.delete(name);
    url.searchParams.set(name, effectiveValue);
  }

  return effectiveValue;
}

/**
 * pg-connection-string currently treats prefer/require/verify-ca as aliases for
 * verify-full, but its next major version will adopt weaker libpq semantics for
 * those names. Pin the current strict behavior explicitly while respecting an
 * operator who deliberately opted into libpq compatibility.
 */
export function normalizePrismaPostgresConnectionString(databaseUrl: string) {
  const validatedDatabaseUrl = databaseUrlSchema.parse(databaseUrl);
  const url = new URL(validatedDatabaseUrl);
  const sslMode = normalizeEffectiveSearchParameter(
    url,
    'sslmode',
  )?.toLowerCase();
  const useLibpqCompat =
    normalizeEffectiveSearchParameter(url, 'uselibpqcompat') === 'true';

  if (!useLibpqCompat && sslMode && LEGACY_STRICT_SSL_MODES.has(sslMode)) {
    url.searchParams.set('sslmode', 'verify-full');
  }

  return url.toString();
}

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize Prisma Client.');
  }
  return normalizePrismaPostgresConnectionString(databaseUrl);
}

function createClient() {
  const adapter = new PrismaPg({
    connectionString: requireDatabaseUrl(),
    connectionTimeoutMillis: PRISMA_PG_CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: PRISMA_PG_IDLE_TIMEOUT_MS,
  });

  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  const client = globalForPrisma.prisma ?? createClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
}

// Lazy construction keeps build-time route analysis independent from a database
// connection while retaining one client per development process.
export const db = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getClient(), property, receiver);
  },
});

export type SearchTelemetryInput = {
  surface: SearchSurface;
  resultCount: number;
  now?: Date;
};

export function searchResultBucketForCount(resultCount: number) {
  const count = Number.isFinite(resultCount)
    ? Math.max(0, Math.floor(resultCount))
    : 0;

  if (count === 0) return SearchResultBucket.ZERO;
  if (count <= 5) return SearchResultBucket.ONE_TO_FIVE;
  if (count <= 20) return SearchResultBucket.SIX_TO_TWENTY;
  return SearchResultBucket.TWENTY_PLUS;
}

export function searchTelemetryDay(now = new Date()) {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/**
 * Records only a daily aggregate bucket. Raw query text, user identifiers,
 * session identifiers, IP addresses and content values are deliberately not
 * accepted by this API or persisted by the backing model. A database statement
 * timeout plus an interactive-transaction acquisition/runtime bound prevents a
 * stalled telemetry write from accumulating after the search response path.
 */
export async function recordSearchTelemetry({
  surface,
  resultCount,
  now = new Date(),
}: SearchTelemetryInput) {
  const normalizedResultCount = Number.isFinite(resultCount)
    ? Math.max(0, Math.floor(resultCount))
    : 0;
  const day = searchTelemetryDay(now);
  const outcome =
    normalizedResultCount > 0 ? SearchOutcome.HIT : SearchOutcome.NO_MATCH;
  const resultBucket = searchResultBucketForCount(normalizedResultCount);

  try {
    await db.$transaction(
      async (transaction) => {
        await transaction.$queryRaw`SELECT set_config('statement_timeout', ${String(
          SEARCH_TELEMETRY_STATEMENT_TIMEOUT_MS,
        )}, true)`;

        await transaction.searchTelemetryDaily.upsert({
          where: {
            day_surface_outcome_resultBucket: {
              day,
              surface,
              outcome,
              resultBucket,
            },
          },
          create: {
            day,
            surface,
            outcome,
            resultBucket,
            count: 1,
          },
          update: {
            count: { increment: 1 },
          },
        });
      },
      {
        maxWait: SEARCH_TELEMETRY_TRANSACTION_MAX_WAIT_MS,
        timeout: SEARCH_TELEMETRY_TRANSACTION_TIMEOUT_MS,
      },
    );
    return true;
  } catch {
    return false;
  }
}

export * from './ai-operator-proposals';
export * from './instructor-cohorts';
export * from './learning-analytics';
export * from './professional-analytics';
export * from './professional-submissions';
export * from '../generated/prisma/client';
