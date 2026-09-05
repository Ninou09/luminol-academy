import { z } from 'zod';

import {
  ContentCalendarFormat,
  ContentCalendarPlatform,
  ContentCalendarStatus,
  SocialPublishingAttemptStatus,
  type PrismaClient,
} from '../generated/prisma/client';

const dispatchBatchSizeSchema = z.number().int().min(1).max(100);

export type DueInstagramReelsDispatchInput = {
  limit?: number;
  now?: Date;
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
