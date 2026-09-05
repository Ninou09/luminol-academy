import { describe, expect, it, vi } from 'vitest';

import {
  ContentCalendarFormat,
  ContentCalendarPlatform,
  ContentCalendarStatus,
  SocialPublishingAttemptStatus,
  type PrismaClient,
} from '../generated/prisma/client';
import type { ResumableSocialPublishingProvider } from './social-publishing-attempts';
import {
  dispatchDueInstagramReelsPublishingAttempts,
  listDueInstagramReelsPublishingAttemptIds,
} from './social-publishing-dispatch';

function database(ids: string[] = []) {
  const findMany = vi.fn().mockResolvedValue(ids.map((id) => ({ id })));
  const client = {
    socialPublishingAttempt: { findMany },
  } as unknown as PrismaClient;
  return { client, findMany };
}

function provider(): ResumableSocialPublishingProvider {
  return {
    begin: vi.fn(),
    complete: vi.fn(),
  };
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

describe('scheduled Instagram Reels dispatch execution', () => {
  it('runs every selected attempt through one shared bounded batch', async () => {
    const client = {} as PrismaClient;
    const metaProvider = provider();
    const now = new Date('2026-09-05T09:15:00.000Z');
    const listDueAttemptIds = vi
      .fn()
      .mockResolvedValue(['attempt-a', 'attempt-b']);
    const executeAttempt = vi.fn().mockResolvedValue({
      providerInvoked: true,
    });

    await expect(
      dispatchDueInstagramReelsPublishingAttempts(
        client,
        { limit: 8, now, provider: metaProvider },
        { listDueAttemptIds, executeAttempt },
      ),
    ).resolves.toEqual({ processed: 2 });

    expect(listDueAttemptIds).toHaveBeenCalledWith(client, { limit: 8, now });
    expect(executeAttempt).toHaveBeenCalledTimes(2);
    expect(executeAttempt).toHaveBeenCalledWith(client, {
      attemptId: 'attempt-a',
      provider: metaProvider,
      now,
    });
    expect(executeAttempt).toHaveBeenCalledWith(client, {
      attemptId: 'attempt-b',
      provider: metaProvider,
      now,
    });
  });

  it('treats executor-managed retry outcomes as processed work', async () => {
    const client = {} as PrismaClient;
    const listDueAttemptIds = vi.fn().mockResolvedValue(['attempt-retry']);
    const executeAttempt = vi.fn().mockResolvedValue({
      providerInvoked: true,
      status: SocialPublishingAttemptStatus.RETRY_SCHEDULED,
    });

    await expect(
      dispatchDueInstagramReelsPublishingAttempts(
        client,
        { provider: provider() },
        { listDueAttemptIds, executeAttempt },
      ),
    ).resolves.toEqual({ processed: 1 });
  });

  it('fails visibly when execution escapes the provider retry flow', async () => {
    const client = {} as PrismaClient;
    const listDueAttemptIds = vi
      .fn()
      .mockResolvedValue(['attempt-a', 'attempt-fatal']);
    const executeAttempt = vi
      .fn()
      .mockResolvedValueOnce({ providerInvoked: true })
      .mockRejectedValueOnce(new Error('database unavailable'));

    await expect(
      dispatchDueInstagramReelsPublishingAttempts(
        client,
        { provider: provider() },
        { listDueAttemptIds, executeAttempt },
      ),
    ).rejects.toThrow(
      'One or more social publishing attempts failed outside the provider retry flow',
    );

    expect(executeAttempt).toHaveBeenCalledTimes(2);
  });

  it('rejects an invalid dispatch clock before selection or execution', async () => {
    const client = {} as PrismaClient;
    const listDueAttemptIds = vi.fn();
    const executeAttempt = vi.fn();

    await expect(
      dispatchDueInstagramReelsPublishingAttempts(
        client,
        { now: new Date(Number.NaN), provider: provider() },
        { listDueAttemptIds, executeAttempt },
      ),
    ).rejects.toThrow('Social publishing dispatch time is invalid');

    expect(listDueAttemptIds).not.toHaveBeenCalled();
    expect(executeAttempt).not.toHaveBeenCalled();
  });
});
