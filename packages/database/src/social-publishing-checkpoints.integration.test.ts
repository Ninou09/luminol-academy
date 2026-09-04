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

async function createApprovedPublishProposal(label: string) {
  const accountRef = `social-checkpoint-${label}-${suffix}`;
  await createSocialPublishingAccount(db, {
    actorUserId: userId,
    accountRef,
    platform: 'INSTAGRAM',
    displayName: `Luminol checkpoint test ${label}`,
    externalAccountId: `external-social-checkpoint-${label}-${suffix}`,
    now: baseNow,
  });

  const draft = await createContentCalendarItem(db, {
    actorUserId: userId,
    title: `Checkpointed Reel ${label}`,
    caption: `Reviewed checkpoint caption ${label}`,
    platform: 'INSTAGRAM',
    accountRef,
    format: 'REEL',
    assetReference: `asset:social-checkpoint:${label}:${suffix}`,
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
    const proposal = await createApprovedPublishProposal('resume');
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

  test('claims a concurrent resumable phase once', async () => {
    const proposal = await createApprovedPublishProposal('concurrent');
    const attempt = await planSocialPublishingAttempt(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      now: baseNow,
    });
    const begin = vi.fn(async () => ({
      sessionReference: 'session-concurrent-123',
    }));
    const complete = vi.fn<ResumableSocialPublishingProvider['complete']>(
      async () => ({ providerReference: 'published-concurrent-456' }),
    );
    const provider: ResumableSocialPublishingProvider = { begin, complete };
    const executionNow = new Date(attempt.nextAttemptAt.getTime() + 5_000);

    const results = await Promise.all([
      executeSocialPublishingAttempt(db, {
        attemptId: attempt.id,
        actorUserId: userId,
        provider,
        now: executionNow,
      }),
      executeSocialPublishingAttempt(db, {
        attemptId: attempt.id,
        actorUserId: userId,
        provider,
        now: executionNow,
      }),
    ]);

    expect(results.filter((result) => result.providerInvoked)).toHaveLength(1);
    expect(begin).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);

    const stored = await db.socialPublishingAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    });
    expect(stored).toMatchObject({
      status: SocialPublishingAttemptStatus.SUCCEEDED,
      attemptCount: 1,
      providerReference: 'published-concurrent-456',
      lockToken: null,
      lockedUntil: null,
    });
  });

  test('reclaims an expired lock and resumes the persisted provider session', async () => {
    const proposal = await createApprovedPublishProposal('expired-lock');
    const attempt = await planSocialPublishingAttempt(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      now: baseNow,
    });
    const executionNow = new Date(attempt.nextAttemptAt.getTime() + 10_000);
    const startedAt = new Date(executionNow.getTime() - 5_000);

    await db.$transaction(async (transaction) => {
      await transaction.socialPublishingAttempt.update({
        where: { id: attempt.id },
        data: {
          status: SocialPublishingAttemptStatus.IN_PROGRESS,
          attemptCount: 1,
          providerReference: 'session-expired-lock-123',
          lockToken: 'expired-social-checkpoint-lock',
          lockedUntil: new Date(executionNow.getTime() - 1),
          startedAt,
        },
      });
      await transaction.socialPublishingAttemptEvent.createMany({
        data: [
          {
            attemptId: attempt.id,
            eventType: 'STARTED',
            actorUserId: userId,
            fromStatus: SocialPublishingAttemptStatus.PLANNED,
            toStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
            attemptNumber: 1,
            occurredAt: startedAt,
          },
          {
            attemptId: attempt.id,
            eventType: 'STARTED',
            actorUserId: userId,
            fromStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
            toStatus: SocialPublishingAttemptStatus.IN_PROGRESS,
            attemptNumber: 1,
            providerReference: 'session-expired-lock-123',
            occurredAt: new Date(startedAt.getTime() + 1),
          },
        ],
      });
    });

    const begin = vi.fn(async () => ({
      sessionReference: 'unexpected-new-session',
    }));
    const complete = vi.fn<ResumableSocialPublishingProvider['complete']>(
      async ({ sessionReference, idempotencyKey }) => {
        expect(sessionReference).toBe('session-expired-lock-123');
        expect(idempotencyKey).toBe(attempt.idempotencyKey);
        return { providerReference: 'published-after-lock-recovery-456' };
      },
    );

    const result = await executeSocialPublishingAttempt(db, {
      attemptId: attempt.id,
      actorUserId: userId,
      provider: { begin, complete },
      now: executionNow,
    });

    expect(result.providerInvoked).toBe(true);
    expect(begin).not.toHaveBeenCalled();
    expect(complete).toHaveBeenCalledTimes(1);
    expect(result.attempt).toMatchObject({
      status: SocialPublishingAttemptStatus.SUCCEEDED,
      attemptCount: 2,
      providerReference: 'published-after-lock-recovery-456',
      lockToken: null,
      lockedUntil: null,
    });
  });
});
