import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  AiOperatorProposalStatus,
  db,
  decideAiOperatorProposal,
  executeApprovedAiOperatorProposal,
  queueAiOperatorProposal,
} from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const actorUserId = `ai-executor-user-${suffix}`;

function enquiryId(label: string) {
  return `ai-executor-enquiry-${label}-${suffix}`;
}

function actionId(label: string) {
  return `operator:set-follow-up:${label}:${suffix}`;
}

function setFollowUpAction(label: string, targetEnquiryId: string) {
  return {
    version: '1',
    actionId: actionId(label),
    kind: 'UPDATE_ENQUIRY_WORKFLOW',
    executionPolicy: 'approval_required',
    source: {
      surface: 'ai_operator',
      reference: `executor-test:${label}:${suffix}`,
    },
    target: {
      surface: 'crm_enquiry',
      enquiryId: targetEnquiryId,
    },
    payload: {
      operation: 'SET_FOLLOW_UP',
      parameters: {
        nextFollowUpOn: '2030-05-12',
        nextAction: `Confirm programme interest for ${label}`,
      },
    },
  } as const;
}

async function createEnquiry(
  label: string,
  plan?: { nextFollowUpAt: Date; nextAction: string },
) {
  return db.enquiry.create({
    data: {
      id: enquiryId(label),
      name: `AI Executor ${label} ${suffix}`,
      email: `ai-executor-${label}-${suffix}@example.test`,
      school: 'GENERAL',
      message: 'Please contact me about the available programme.',
      consent: true,
      ...(plan ?? {}),
    },
  });
}

async function approveAction(action: ReturnType<typeof setFollowUpAction>) {
  const proposal = await queueAiOperatorProposal(db, action, actorUserId);
  return decideAiOperatorProposal(db, {
    proposalId: proposal.id,
    actorUserId,
    decision: 'APPROVED',
    now: new Date(proposal.createdAt.getTime() + 1_000),
  });
}

suite('AI Operator controlled CRM executor', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: actorUserId,
        clerkId: `clerk-ai-executor-${suffix}`,
        email: `ai-executor-actor-${suffix}@example.test`,
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('executes one approved SET_FOLLOW_UP proposal atomically and exactly once', async () => {
    const enquiry = await createEnquiry('success');
    const approved = await approveAction(
      setFollowUpAction('success', enquiry.id),
    );
    const executedAt = new Date(approved.decidedAt!.getTime() + 1_000);

    const result = await executeApprovedAiOperatorProposal(db, {
      proposalId: approved.id,
      actorUserId,
      now: executedAt,
    });

    expect(result.proposal.status).toBe(AiOperatorProposalStatus.EXECUTED);
    expect(result.proposal.executedByUserId).toBe(actorUserId);
    expect(result.proposal.executedAt?.toISOString()).toBe(
      executedAt.toISOString(),
    );
    expect(result.proposal.events.map(({ eventType }) => eventType)).toEqual([
      'PROPOSED',
      'APPROVED',
      'EXECUTED',
    ]);

    const storedEnquiry = await db.enquiry.findUniqueOrThrow({
      where: { id: enquiry.id },
      select: { nextFollowUpAt: true, nextAction: true },
    });
    expect(storedEnquiry.nextFollowUpAt?.toISOString()).toBe(
      '2030-05-12T00:00:00.000Z',
    );
    expect(storedEnquiry.nextAction).toBe(
      'Confirm programme interest for success',
    );
    await expect(
      db.enquiryFollowUpEvent.count({ where: { enquiryId: enquiry.id } }),
    ).resolves.toBe(1);

    await expect(
      executeApprovedAiOperatorProposal(db, {
        proposalId: approved.id,
        actorUserId,
        now: new Date(executedAt.getTime() + 1_000),
      }),
    ).rejects.toThrow('not ready for execution');

    await expect(
      db.aiOperatorProposalEvent.count({
        where: { proposalId: approved.id, eventType: 'EXECUTED' },
      }),
    ).resolves.toBe(1);
    await expect(
      db.enquiryFollowUpEvent.count({ where: { enquiryId: enquiry.id } }),
    ).resolves.toBe(1);
  });

  test('allows only one concurrent execution attempt to commit', async () => {
    const enquiry = await createEnquiry('concurrent');
    const approved = await approveAction(
      setFollowUpAction('concurrent', enquiry.id),
    );
    const executedAt = new Date(approved.decidedAt!.getTime() + 1_000);

    const attempts = await Promise.allSettled([
      executeApprovedAiOperatorProposal(db, {
        proposalId: approved.id,
        actorUserId,
        now: executedAt,
      }),
      executeApprovedAiOperatorProposal(db, {
        proposalId: approved.id,
        actorUserId,
        now: executedAt,
      }),
    ]);

    expect(
      attempts.filter(({ status }) => status === 'fulfilled'),
    ).toHaveLength(1);
    expect(attempts.filter(({ status }) => status === 'rejected')).toHaveLength(
      1,
    );
    await expect(
      db.aiOperatorProposalEvent.count({
        where: { proposalId: approved.id, eventType: 'EXECUTED' },
      }),
    ).resolves.toBe(1);
    await expect(
      db.enquiryFollowUpEvent.count({ where: { enquiryId: enquiry.id } }),
    ).resolves.toBe(1);
  });

  test('rolls back the execution claim when the CRM target is already stale', async () => {
    const existingPlan = {
      nextFollowUpAt: new Date('2030-05-12T00:00:00.000Z'),
      nextAction: 'Confirm programme interest for stale',
    };
    const enquiry = await createEnquiry('stale', existingPlan);
    const approved = await approveAction(
      setFollowUpAction('stale', enquiry.id),
    );

    await expect(
      executeApprovedAiOperatorProposal(db, {
        proposalId: approved.id,
        actorUserId,
        now: new Date(approved.decidedAt!.getTime() + 1_000),
      }),
    ).rejects.toThrow('already matches the proposed follow-up plan');

    const proposal = await db.aiOperatorProposal.findUniqueOrThrow({
      where: { id: approved.id },
    });
    expect(proposal.status).toBe(AiOperatorProposalStatus.APPROVED);
    expect(proposal.executedByUserId).toBeNull();
    expect(proposal.executedAt).toBeNull();
    await expect(
      db.aiOperatorProposalEvent.count({
        where: { proposalId: approved.id, eventType: 'EXECUTED' },
      }),
    ).resolves.toBe(0);
    await expect(
      db.enquiryFollowUpEvent.count({ where: { enquiryId: enquiry.id } }),
    ).resolves.toBe(0);
  });

  test('keeps unsupported CRM operations approved and side-effect free', async () => {
    const enquiry = await createEnquiry('unsupported');
    const base = setFollowUpAction('unsupported', enquiry.id);
    const action = {
      ...base,
      payload: {
        operation: 'TRANSITION_STATUS',
        parameters: { toStatus: 'CONTACTED' },
      },
    } as const;
    const proposal = await queueAiOperatorProposal(db, action, actorUserId);
    const approved = await decideAiOperatorProposal(db, {
      proposalId: proposal.id,
      actorUserId,
      decision: 'APPROVED',
      now: new Date(proposal.createdAt.getTime() + 1_000),
    });

    await expect(
      executeApprovedAiOperatorProposal(db, {
        proposalId: approved.id,
        actorUserId,
        now: new Date(approved.decidedAt!.getTime() + 1_000),
      }),
    ).rejects.toThrow('not supported by this executor');

    const stored = await db.aiOperatorProposal.findUniqueOrThrow({
      where: { id: approved.id },
    });
    expect(stored.status).toBe(AiOperatorProposalStatus.APPROVED);
    await expect(
      db.enquiryFollowUpEvent.count({ where: { enquiryId: enquiry.id } }),
    ).resolves.toBe(0);
  });
});
