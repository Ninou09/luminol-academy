import { describe, expect, it, vi } from 'vitest';

import {
  ContentCalendarFormat,
  ContentCalendarPlatform,
  ContentCalendarStatus,
  SocialPublishingAttemptStatus,
  type PrismaClient,
} from '../generated/prisma/client';
import { listDueInstagramReelsPublishingAttemptIds } from './social-publishing-dispatch';

function database(ids: string[] = []) {
  const findMany = vi.fn().mockResolvedValue(ids.map((id) => ({ id })));
  const client = {
    socialPublishingAttempt: { findMany },
  } as unknown as PrismaClient;
  return { client, findMany };
}

describe('scheduled Instagram Reels dispatch selection', () => {
  it('selects only due scheduled Reels and stale resumable attempts in a bounded order', async () => {
    const { client, findMany } = database(['attempt-a', 'attempt-b']);
    const now = new Date('2026-09-04T12:00:00.000Z');

    await expect(
      listDueInstagramReelsPublishingAttemptIds(client, { limit: 12, now }),
    ).resolves.toEqual(['attempt-a', 'attempt-b']);

    expect(findMany).toHaveBeenCalledWith({
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
      take: 12,
    });
  });

  it('defaults to a small bounded batch', async () => {
    const { client, findMany } = database();
    const now = new Date('2026-09-04T12:00:00.000Z');

    await listDueInstagramReelsPublishingAttemptIds(client, { now });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 }),
    );
  });

  it('rejects invalid dispatch limits and timestamps before querying', async () => {
    const { client, findMany } = database();

    await expect(
      listDueInstagramReelsPublishingAttemptIds(client, { limit: 101 }),
    ).rejects.toThrow();
    await expect(
      listDueInstagramReelsPublishingAttemptIds(client, {
        now: new Date(Number.NaN),
      }),
    ).rejects.toThrow('Social publishing dispatch time is invalid');

    expect(findMany).not.toHaveBeenCalled();
  });
});
