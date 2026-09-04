import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import {
  AiOperatorProposalStatus,
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
  executeSocialPublishingAttempt,
  getSocialPublishingProviderPhase,
  planSocialPublishingAttempt,
  type ResumableSocialPublishingProvider,
} from './social-publishing-attempts';
import { createSocialPublishingAccount } from './social-publishing-delivery';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `social-checkpoint-user-${suffix}`;
const baseNow = new Date('2026-09-01T21:45:00.000Z');

async function createApprovedPublishProposal() {
  const accountRef = `social-checkpoint-${suffix}`;
  await createSocialPublishingAccount(db, {
    actorUserId: userId,
    accountRef,
    platform: 'INSTAGRAM',
    displayName: 'Luminol checkpoint test',
    externalAccountId: `external-social-checkpoint-${suffix}`,
    now: baseNow,
  });

  const draft = await createContentCalendarItem(db, {
    actorUserId: userId,
    title: 'Checkpointed Reel',
    caption: 'Reviewed checkpoint caption',
    platform: 'INSTAGRAM',
    accountRef,
    format: 'REEL',
    assetReference: `asset:social-checkpoint:${suffix}`,
    now: baseNow,
  });
  const ready = await transitionContentCalendarItemStatus(db, {
    itemId: draft.id,
    expectedRevision: draft.revision,
    actorUserId: userId,
    toStatus: 'READY',
    now: new Date(baseNow.getTime() + 1_000),
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

  return proposal;
}

suite('social publishing provider checkpoints', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `clerk-social-checkpoint-${suffix}`,
        email: `social-checkpoint-${suffix}@example.test`,
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('persists a provider session and resumes without creating it again', async () => {
    const proposal = await createApprovedPublishProposal();
    const attempt = await planSocialPublishingAttempt(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      now: baseNow,
    });

    const begin = vi.fn(async () => ({
      sessionReference: 'session-opaque-123',
    }));
    const complete = vi
      .fn<ResumableSocialPublishingProvider['complete']>()
      .mockRejectedValueOnce(new Error('temporary provider failure'))
      .mockResolvedValueOnce({ providerReference: 'published-opaque-456' });
    const provider: ResumableSocialPublishingProvider = { begin, complete };

    const firstNow = new Date(attempt.nextAttemptAt.getTime() + 5_000);
    const first = await executeSocialPublishingAttempt(db, {
      attemptId: attempt.id,
      actorUserId: userId,
      provider,
      now: firstNow,
    });

    expect(first.providerInvoked).toBe(true);
    expect(first.attempt).toMatchObject({
      status: SocialPublishingAttemptStatus.RETRY_SCHEDULED,
      attemptCount: 1,
      providerReference: 'session-opaque-123',
      lastErrorCode: 'PROVIDER_ERROR',
    });
    expect(getSocialPublishingProviderPhase(first.attempt)).toBe(
      'SESSION_READY',
    );
    expect(begin).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);

    const checkpointEvents = await db.socialPublishingAttemptEvent.findMany({
      where: {
        attemptId: attempt.id,
        eventType: 'STARTED',
        fromStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
        toStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
      },
    });
    expect(checkpointEvents).toHaveLength(1);
    expect(checkpointEvents[0]).toMatchObject({
      providerReference: 'session-opaque-123',
      actorUserId: userId,
      attemptNumber: 1,
    });

    const second = await executeSocialPublishingAttempt(db, {
      attemptId: attempt.id,
      actorUserId: userId,
      provider,
      now: first.attempt.nextAttemptAt,
    });

    expect(second.providerInvoked).toBe(true);
    expect(second.attempt).toMatchObject({
      status: SocialPublishingAttemptStatus.SUCCEEDED,
      attemptCount: 2,
      providerReference: 'published-opaque-456',
      lastErrorCode: null,
    });
    expect(getSocialPublishingProviderPhase(second.attempt)).toBe('PUBLISHED');
    expect(begin).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(2);
    expect(complete.mock.calls[1]?.[0]).toMatchObject({
      sessionReference: 'session-opaque-123',
      idempotencyKey: attempt.idempotencyKey,
    });

    const executedProposal = await db.aiOperatorProposal.findUniqueOrThrow({
      where: { id: proposal.id },
    });
    expect(executedProposal.status).toBe(AiOperatorProposalStatus.EXECUTED);
  });
});
