import { z } from 'zod';

import {
  ContentCalendarFormat,
  ContentCalendarPlatform,
  ContentCalendarStatus,
  SocialPublishingAttemptStatus,
  type PrismaClient,
} from '../generated/prisma/client';
import {
  executeSocialPublishingAttempt,
  type SocialPublishingProvider,
} from './social-publishing-attempts';

const dispatchBatchSizeSchema = z.number().int().min(1).max(100);

export type DueInstagramReelsDispatchInput = {
  limit?: number;
  now?: Date;
};

export type DispatchDueInstagramReelsPublishingInput =
  DueInstagramReelsDispatchInput & {
    provider: SocialPublishingProvider;
    actorUserId?: string | null;
  };

type SocialPublishingDispatchDependencies = {
  listDueAttemptIds?: typeof listDueInstagramReelsPublishingAttemptIds;
  executeAttempt?: typeof executeSocialPublishingAttempt;
};

/**
 * Returns only attempt identifiers that are safe candidates for the scheduled
 * Instagram Reels executor. The executor remains authoritative: it re-materializes
 * the exact approved proposal/content/account binding and owns the durable lock,
 * retry and dead-letter state machine before any provider phase runs.
 */
export async function listDueInstagramReelsPublishingAttemptIds(
  client: PrismaClient,
  input: DueInstagramReelsDispatchInput = {},
) {
  const limit = dispatchBatchSizeSchema.parse(input.limit ?? 10);
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) {
    throw new Error('Social publishing dispatch time is invalid');
  }

  const attempts = await client.socialPublishingAttempt.findMany({
    where: {
      platform: ContentCalendarPlatform.INSTAGRAM,
      content: {
        status: ContentCalendarStatus.SCHEDULED,
        format: ContentCalendarFormat.REEL,
        scheduledFor: { lte: now },
      },
      OR: [
        {
          status: {
            in: [
              SocialPublishingAttemptStatus.PLANNED,
              SocialPublishingAttemptStatus.RETRY_SCHEDULED,
            ],
          },
          nextAttemptAt: { lte: now },
        },
        {
          status: SocialPublishingAttemptStatus.IN_PROGRESS,
          lockedUntil: { lte: now },
        },
      ],
    },
    select: { id: true },
    orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    take: limit,
  });

  return attempts.map(({ id }) => id);
}

/**
 * Runs one bounded due batch through the existing authoritative executor.
 * Provider-managed failures remain represented by the executor's retry/dead-letter
 * state machine; only failures that escape that flow reject the whole batch.
 */
export async function dispatchDueInstagramReelsPublishingAttempts(
  client: PrismaClient,
  input: DispatchDueInstagramReelsPublishingInput,
  dependencies: SocialPublishingDispatchDependencies = {},
) {
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) {
    throw new Error('Social publishing dispatch time is invalid');
  }

  const listDueAttemptIds =
    dependencies.listDueAttemptIds ?? listDueInstagramReelsPublishingAttemptIds;
  const executeAttempt =
    dependencies.executeAttempt ?? executeSocialPublishingAttempt;
  const ids = await listDueAttemptIds(client, {
    ...(input.limit === undefined ? {} : { limit: input.limit }),
    now,
  });
  const results = await Promise.allSettled(
    ids.map((attemptId) =>
      executeAttempt(client, {
        attemptId,
        provider: input.provider,
        now,
        ...(input.actorUserId === undefined
          ? {}
          : { actorUserId: input.actorUserId }),
      }),
    ),
  );
  const fatalFailures = results.filter(
    (result) => result.status === 'rejected',
  );

  if (fatalFailures.length > 0) {
    throw new AggregateError(
      fatalFailures.map(({ reason }) => reason),
      'One or more social publishing attempts failed outside the provider retry flow',
    );
  }

  return { processed: ids.length };
}
