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
    const proposals = await db.aiOperatorProposal.findMany({
      where: { actionId: { startsWith: `operator:update-enquiry:${suffix}` } },
      select: { id: true },
    });
    await db.aiOperatorProposalEvent.deleteMany({
      where: { proposalId: { in: proposals.map(({ id }) => id) } },
    });
    await db.aiOperatorProposal.deleteMany({
      where: { id: { in: proposals.map(({ id }) => id) } },
    });
    await db.user.deleteMany({ where: { id: userId } });
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
});
