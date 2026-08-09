import {
  PrismaClient,
  SearchOutcome,
  SearchResultBucket,
  type SearchSurface,
} from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

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
 * accepted by this API or persisted by the backing model.
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
    await db.searchTelemetryDaily.upsert({
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
    return true;
  } catch {
    // Telemetry is best-effort and must never make search unavailable.
    return false;
  }
}

export * from '@prisma/client';
