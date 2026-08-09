import {
  PrismaClient,
  SearchOutcome,
  SearchResultBucket,
  type SearchSurface,
} from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const SEARCH_TELEMETRY_STATEMENT_TIMEOUT_MS = 100;
export const SEARCH_TELEMETRY_TRANSACTION_MAX_WAIT_MS = 100;
export const SEARCH_TELEMETRY_TRANSACTION_TIMEOUT_MS = 250;

function getClient(): PrismaClient {
  const client = globalForPrisma.prisma ?? new PrismaClient();
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

export * from '@prisma/client';
