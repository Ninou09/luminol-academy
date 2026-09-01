import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import {
  AiOperatorProposalStatus,
  ContentCalendarStatus,
  SocialPublishingAttemptStatus,
  db,
  decideAiOperatorProposal,
} from './index';
import {
  createContentCalendarItem,
  queueContentCalendarPublishProposal,
  transitionContentCalendarItemStatus,
  updateContentCalendarItem,
} from './content-calendar';
import {
  executeSocialPublishingAttempt,
  planSocialPublishingAttempt,
  type SocialPublishingProvider,
} from './social-publishing-attempts';
import { createSocialPublishingAccount } from './social-publishing-delivery';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `social-attempt-user-${suffix}`;
const baseNow = new Date('2026-09-01T17:00:00.000Z');

async function createApprovedPublishProposal(input: {
  label: string;
  platform?: 'INSTAGRAM' | 'FACEBOOK';
}) {
  const platform = input.platform ?? 'INSTAGRAM';
  const accountRef = `social-${input.label}-${suffix}`;
  await createSocialPublishingAccount(db, {
    actorUserId: userId,
    accountRef,
    platform,
    displayName: `Luminol ${input.label}`,
    externalAccountId: `external-${input.label}-${suffix}`,
    now: baseNow,
  });

  const draft = await createContentCalendarItem(db, {
    actorUserId: userId,
    title: `Social attempt ${input.label}`,
    caption: `Reviewed caption ${input.label}`,
    platform,
    accountRef,
    format: platform === 'INSTAGRAM' ? 'REEL' : 'STATIC_POST',
    assetReference: `asset:social-attempt:${input.label}:${suffix}`,
    now: baseNow,
  });
  const ready = await transitionContentCalendarItemStatus(db, {
    itemId: draft.id,
    expectedRevision: draft.revision,
    actorUserId: userId,
    toStatus: 'READY',
    now: new Date(baseNow.getTime() + 1_000),
  });
  expect(ready.status).toBe(ContentCalendarStatus.READY);

  const proposal = await queueContentCalendarPublishProposal(db, {
    itemId: ready.id,
    expectedRevision: ready.revision,
    actorUserId: userId,
  });
  expect(proposal.status).toBe(AiOperatorProposalStatus.PENDING_APPROVAL);

  const approved = await decideAiOperatorProposal(db, {
    proposalId: proposal.id,
    actorUserId: userId,
    decision: 'APPROVED',
    now: new Date(proposal.createdAt.getTime() + 1_000),
  });
  expect(approved.status).toBe(AiOperatorProposalStatus.APPROVED);

  return { accountRef, ready, proposal };
}

suite('social publishing attempt ledger', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `clerk-social-attempt-${suffix}`,
        email: `social-attempt-${suffix}@example.test`,
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('plans one idempotent attempt for repeated and concurrent requests', async () => {
    const { proposal } = await createApprovedPublishProposal({
      label: 'planning',
    });

    const attempts = await Promise.all(
      Array.from({ length: 4 }, () =>
        planSocialPublishingAttempt(db, {
          proposalId: proposal.id,
          actorUserId: userId,
          now: baseNow,
        }),
      ),
    );

    expect(new Set(attempts.map((attempt) => attempt.id))).toHaveLength(1);
    expect(new Set(attempts.map((attempt) => attempt.idempotencyKey))).toHaveLength(
      1,
    );

    const stored = await db.socialPublishingAttempt.findMany({
      where: { proposalId: proposal.id },
      include: { events: true },
    });
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      status: SocialPublishingAttemptStatus.PLANNED,
      attemptCount: 0,
      providerReference: null,
      lastErrorCode: null,
    });
    expect(stored[0]?.events).toHaveLength(1);
    expect(stored[0]?.events[0]).toMatchObject({
      eventType: 'PLANNED',
      actorUserId: userId,
      attemptNumber: 0,
    });
  });

  test('claims concurrent execution once and persists only a bounded provider result', async () => {
    const { proposal } = await createApprovedPublishProposal({
      label: 'concurrent-execution',
      platform: 'FACEBOOK',
    });
    const attempt = await planSocialPublishingAttempt(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      now: baseNow,
    });

    const publish = vi.fn(async () => ({ providerReference: 'provider-post-123' }));
    const provider: SocialPublishingProvider = { publish };
    const executionNow = new Date(proposal.createdAt.getTime() + 5_000);

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

    expect(publish).toHaveBeenCalledTimes(1);
    expect(results.filter((result) => result.providerInvoked)).toHaveLength(1);

    const stored = await db.socialPublishingAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
      include: { events: { orderBy: { occurredAt: 'asc' } } },
    });
    expect(stored).toMatchObject({
      status: SocialPublishingAttemptStatus.SUCCEEDED,
      attemptCount: 1,
      providerReference: 'provider-post-123',
      lastErrorCode: null,
      lockToken: null,
      lockedUntil: null,
    });
    expect(stored.events.map((event) => event.eventType)).toEqual([
      'PLANNED',
      'STARTED',
      'SUCCEEDED',
    ]);

    await expect(
      db.socialPublishingAttempt.update({
        where: { id: stored.id },
        data: { status: SocialPublishingAttemptStatus.PLANNED },
      }),
    ).rejects.toThrow('terminal state is immutable');
    await expect(
      db.socialPublishingAttemptEvent.update({
        where: { id: stored.events[1]!.id },
        data: { errorCode: 'MUTATED' },
      }),
    ).rejects.toThrow('append-only');
    await expect(
      db.socialPublishingAttemptEvent.delete({
        where: { id: stored.events[1]!.id },
      }),
    ).rejects.toThrow('append-only');
  });

  test('uses bounded retry state without persisting provider exception details', async () => {
    const { proposal } = await createApprovedPublishProposal({ label: 'retry' });
    const attempt = await planSocialPublishingAttempt(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      now: baseNow,
    });
    const sensitiveProviderMessage =
      'Meta token SECRET_SHOULD_NEVER_BE_PERSISTED request body caption';
    const provider: SocialPublishingProvider = {
      publish: vi.fn(async () => {
        throw new Error(sensitiveProviderMessage);
      }),
    };

    const firstNow = new Date(proposal.createdAt.getTime() + 10_000);
    const first = await executeSocialPublishingAttempt(db, {
      attemptId: attempt.id,
      actorUserId: userId,
      provider,
      now: firstNow,
    });
    expect(first.attempt).toMatchObject({
      status: SocialPublishingAttemptStatus.RETRY_SCHEDULED,
      attemptCount: 1,
      lastErrorCode: 'PROVIDER_ERROR',
      providerReference: null,
    });

    const second = await executeSocialPublishingAttempt(db, {
      attemptId: attempt.id,
      actorUserId: userId,
      provider,
      now: new Date(firstNow.getTime() + 60_000),
    });
    expect(second.attempt).toMatchObject({
      status: SocialPublishingAttemptStatus.RETRY_SCHEDULED,
      attemptCount: 2,
      lastErrorCode: 'PROVIDER_ERROR',
    });

    const third = await executeSocialPublishingAttempt(db, {
      attemptId: attempt.id,
      actorUserId: userId,
      provider,
      now: new Date(firstNow.getTime() + 6 * 60_000),
    });
    expect(third.attempt).toMatchObject({
      status: SocialPublishingAttemptStatus.DEAD_LETTER,
      attemptCount: 3,
      lastErrorCode: 'PROVIDER_ERROR',
      providerReference: null,
    });

    const events = await db.socialPublishingAttemptEvent.findMany({
      where: { attemptId: attempt.id },
      orderBy: { occurredAt: 'asc' },
    });
    expect(events.filter((event) => event.eventType === 'PROVIDER_FAILED')).toHaveLength(
      3,
    );
    expect(JSON.stringify({ attempt: third.attempt, events })).not.toContain(
      sensitiveProviderMessage,
    );
    expect(JSON.stringify({ attempt: third.attempt, events })).not.toContain(
      'SECRET_SHOULD_NEVER_BE_PERSISTED',
    );
  });

  test('invalidates a planned attempt without invoking provider when content drifts', async () => {
    const { proposal, ready } = await createApprovedPublishProposal({
      label: 'drift',
    });
    const attempt = await planSocialPublishingAttempt(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      now: baseNow,
    });

    await updateContentCalendarItem(db, {
      itemId: ready.id,
      expectedRevision: ready.revision,
      actorUserId: userId,
      title: ready.title,
      caption: 'Changed after publish approval and attempt planning',
      platform: ready.platform,
      accountRef: ready.accountRef,
      format: ready.format,
      assetReference: ready.assetReference,
      now: new Date(proposal.createdAt.getTime() + 2_000),
    });

    const publish = vi.fn(async () => ({ providerReference: 'should-not-run' }));
    const result = await executeSocialPublishingAttempt(db, {
      attemptId: attempt.id,
      actorUserId: userId,
      provider: { publish },
      now: new Date(proposal.createdAt.getTime() + 5_000),
    });

    expect(publish).not.toHaveBeenCalled();
    expect(result.providerInvoked).toBe(false);
    expect(result.attempt).toMatchObject({
      status: SocialPublishingAttemptStatus.DEAD_LETTER,
      attemptCount: 0,
      lastErrorCode: 'DELIVERY_PLAN_INVALID',
      providerReference: null,
    });

    const event = await db.socialPublishingAttemptEvent.findFirstOrThrow({
      where: { attemptId: attempt.id, eventType: 'INVALIDATED' },
    });
    expect(event).toMatchObject({
      errorCode: 'DELIVERY_PLAN_INVALID',
      toStatus: SocialPublishingAttemptStatus.DEAD_LETTER,
      attemptNumber: 0,
    });
  });
});
