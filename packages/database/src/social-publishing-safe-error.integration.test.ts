import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  SocialPublishingAttemptStatus,
  db,
  decideAiOperatorProposal,
} from './index';
import {
  createContentCalendarItem,
  queueContentCalendarPublishProposal,
  transitionContentCalendarItemStatus,
} from './content-calendar';
import {
  SocialPublishingProviderSafeError,
  executeSocialPublishingAttempt,
  planSocialPublishingAttempt,
  type ResumableSocialPublishingProvider,
} from './social-publishing-attempts';
import { createSocialPublishingAccount } from './social-publishing-delivery';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `social-safe-error-user-${suffix}`;
const now = new Date('2026-09-04T09:45:00.000Z');

suite('social publishing provider safe errors', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `clerk-social-safe-error-${suffix}`,
        email: `social-safe-error-${suffix}@example.test`,
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('persists only the bounded provider code instead of raw failure text', async () => {
    const accountRef = `social-safe-error-${suffix}`;
    await createSocialPublishingAccount(db, {
      actorUserId: userId,
      accountRef,
      platform: 'INSTAGRAM',
      displayName: 'Luminol safe error test',
      externalAccountId: `external-social-safe-error-${suffix}`,
      now,
    });

    const draft = await createContentCalendarItem(db, {
      actorUserId: userId,
      title: 'Safe provider error Reel',
      caption: 'Reviewed safe provider error caption',
      platform: 'INSTAGRAM',
      accountRef,
      format: 'REEL',
      assetReference: `asset:social-safe-error:${suffix}`,
      now,
    });
    const ready = await transitionContentCalendarItemStatus(db, {
      itemId: draft.id,
      expectedRevision: draft.revision,
      actorUserId: userId,
      toStatus: 'READY',
      now: new Date(now.getTime() + 1_000),
    });
    const proposal = await queueContentCalendarPublishProposal(db, {
      itemId: ready.id,
      expectedRevision: ready.revision,
      actorUserId: userId,
    });
    await decideAiOperatorProposal(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      decision: 'APPROVED',
      now: new Date(proposal.createdAt.getTime() + 1_000),
    });

    const attempt = await planSocialPublishingAttempt(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      now,
    });
    const provider: ResumableSocialPublishingProvider = {
      async begin() {
        return { sessionReference: 'safe-session-123' };
      },
      async complete() {
        throw new SocialPublishingProviderSafeError('META_RATE_LIMITED');
      },
    };

    const result = await executeSocialPublishingAttempt(db, {
      attemptId: attempt.id,
      actorUserId: userId,
      provider,
      now: new Date(now.getTime() + 5_000),
    });

    expect(result.attempt).toMatchObject({
      status: SocialPublishingAttemptStatus.RETRY_SCHEDULED,
      providerReference: 'safe-session-123',
      lastErrorCode: 'META_RATE_LIMITED',
    });

    const failure = await db.socialPublishingAttemptEvent.findFirstOrThrow({
      where: {
        attemptId: attempt.id,
        eventType: 'PROVIDER_FAILED',
      },
      orderBy: { occurredAt: 'desc' },
    });
    expect(failure.errorCode).toBe('META_RATE_LIMITED');
  });
});
