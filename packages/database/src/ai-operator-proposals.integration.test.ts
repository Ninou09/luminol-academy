import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  AiOperatorProposalStatus,
  db,
  decideAiOperatorProposal,
  queueAiOperatorProposal,
} from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `ai-operator-user-${suffix}`;
const actionId = `operator:update-enquiry:${suffix}`;

const action = {
  version: '1',
  actionId,
  kind: 'UPDATE_ENQUIRY_WORKFLOW',
  executionPolicy: 'approval_required',
  source: {
    surface: 'ai_operator',
    reference: `proposal-test:${suffix}`,
  },
  target: {
    surface: 'crm_enquiry',
    enquiryId: `enquiry-${suffix}`,
  },
  payload: {
    operation: 'SET_FOLLOW_UP',
    parameters: {
      nextFollowUpOn: '2026-09-02',
      nextAction: 'Confirm programme interest',
    },
  },
} as const;

suite('AI Operator proposal persistence', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `clerk-ai-operator-${suffix}`,
        email: `ai-operator-${suffix}@example.test`,
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('queues once, preserves the reviewed envelope, and fails closed after a decision', async () => {
    const first = await queueAiOperatorProposal(db, action, userId);
    const duplicate = await queueAiOperatorProposal(db, action, userId);

    expect(duplicate.id).toBe(first.id);
    expect(first.status).toBe(AiOperatorProposalStatus.PENDING_APPROVAL);

    const stored = await db.aiOperatorProposal.findUniqueOrThrow({
      where: { id: first.id },
      include: { events: true },
    });
    expect(stored.actionEnvelope).toEqual(action);
    expect(stored.events).toHaveLength(1);
    expect(stored.events[0]?.eventType).toBe('PROPOSED');

    await expect(
      queueAiOperatorProposal(
        db,
        {
          ...action,
          target: { ...action.target, enquiryId: `other-${suffix}` },
        },
        userId,
      ),
    ).rejects.toThrow('already belongs to another proposal');

    const decided = await decideAiOperatorProposal(db, {
      proposalId: first.id,
      actorUserId: userId,
      decision: 'REJECTED',
      note: '  Needs revised timing  ',
      now: new Date('2026-09-01T12:00:00.000Z'),
    });

    expect(decided.status).toBe(AiOperatorProposalStatus.REJECTED);
    expect(decided.decisionNote).toBe('Needs revised timing');
    expect(decided.events.map(({ eventType }) => eventType)).toEqual([
      'PROPOSED',
      'REJECTED',
    ]);

    await expect(
      decideAiOperatorProposal(db, {
        proposalId: first.id,
        actorUserId: userId,
        decision: 'APPROVED',
      }),
    ).rejects.toThrow('no longer pending approval');
  });

  test('coalesces concurrent duplicate proposal requests onto one action ID', async () => {
    const concurrentAction = {
      ...action,
      actionId: `${actionId}:concurrent`,
      source: {
        ...action.source,
        reference: `proposal-test:${suffix}:concurrent`,
      },
    };

    const proposals = await Promise.all([
      queueAiOperatorProposal(db, concurrentAction, userId),
      queueAiOperatorProposal(db, concurrentAction, userId),
    ]);

    expect(new Set(proposals.map(({ id }) => id)).size).toBe(1);
    await expect(
      db.aiOperatorProposal.count({
        where: { actionId: concurrentAction.actionId },
      }),
    ).resolves.toBe(1);
    await expect(
      db.aiOperatorProposalEvent.count({
        where: { proposalId: proposals[0]!.id },
      }),
    ).resolves.toBe(1);
  });

  test('keeps proposal decision history append-only at the database boundary', async () => {
    const event = await db.aiOperatorProposalEvent.findFirstOrThrow({
      where: { proposal: { actionId } },
      orderBy: { occurredAt: 'asc' },
    });

    await expect(
      db.aiOperatorProposalEvent.update({
        where: { id: event.id },
        data: { note: 'tampered' },
      }),
    ).rejects.toThrow('append-only');

    await expect(
      db.aiOperatorProposalEvent.delete({ where: { id: event.id } }),
    ).rejects.toThrow('append-only');
  });
});
