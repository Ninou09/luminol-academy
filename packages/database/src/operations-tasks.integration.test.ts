import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';
import {
  createOperationsTask,
  transitionOperationsTask,
  type OperationsTaskActor,
} from './operations-tasks';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const ownerId = `task-owner-${suffix}`;
const agentId = `task-agent-${suffix}`;
const outsiderId = `task-outsider-${suffix}`;

const owner: OperationsTaskActor = {
  userId: ownerId,
  canManage: true,
  canDecide: true,
};
const agent: OperationsTaskActor = {
  userId: agentId,
  canManage: false,
  canDecide: false,
};

suite('operations tasks and approvals', () => {
  beforeAll(async () => {
    await db.user.createMany({
      data: [ownerId, agentId, outsiderId].map((id) => ({
        id,
        clerkId: `clerk-${id}`,
        email: `${id}@example.test`,
      })),
    });
    const role = await db.role.findUniqueOrThrow({
      where: { key: 'enquiry-agent' },
    });
    await db.userRole.create({ data: { userId: agentId, roleId: role.id } });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('assigns, completes and reopens tasks within scope', async () => {
    const task = await createOperationsTask(db, {
      actor: owner,
      kind: 'TASK',
      title: 'Call back consented enquiries',
      assigneeUserId: agentId,
      dueOn: '2031-05-04',
      priority: 'HIGH',
    });
    expect(task.dueOn?.toISOString().slice(0, 10)).toBe('2031-05-04');

    await expect(
      createOperationsTask(db, {
        actor: owner,
        kind: 'TASK',
        title: 'Not staff',
        assigneeUserId: outsiderId,
      }),
    ).rejects.toMatchObject({ code: 'ineligible-assignee' });

    await expect(
      createOperationsTask(db, {
        actor: agent,
        kind: 'TASK',
        title: 'Assign to owner',
        assigneeUserId: ownerId,
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });

    const done = await transitionOperationsTask(db, {
      actor: agent,
      taskId: task.id,
      expectedRevision: 1,
      toStatus: 'DONE',
    });
    expect(done.closedAt).not.toBeNull();

    const reopened = await transitionOperationsTask(db, {
      actor: agent,
      taskId: task.id,
      expectedRevision: 2,
      toStatus: 'OPEN',
    });
    expect(reopened.closedAt).toBeNull();

    await expect(
      transitionOperationsTask(db, {
        actor: { userId: outsiderId, canManage: false, canDecide: false },
        taskId: task.id,
        expectedRevision: 3,
        toStatus: 'DONE',
      }),
    ).rejects.toMatchObject({ code: 'not-found' });
  });

  test('approvals are decided only by approvers and record the decision', async () => {
    const request = await createOperationsTask(db, {
      actor: agent,
      kind: 'APPROVAL',
      title: 'Post the free session announcement in the WhatsApp group',
      details: 'One post in the group; no bulk messages.',
    });
    expect(request.assigneeUserId).toBeNull();

    await expect(
      transitionOperationsTask(db, {
        actor: agent,
        taskId: request.id,
        expectedRevision: 1,
        toStatus: 'APPROVED',
      }),
    ).rejects.toMatchObject({ code: 'transition' });

    const approved = await transitionOperationsTask(db, {
      actor: owner,
      taskId: request.id,
      expectedRevision: 1,
      toStatus: 'APPROVED',
      decisionNote: 'Approved for Thursday evening',
    });
    expect(approved).toMatchObject({
      status: 'APPROVED',
      decidedByUserId: ownerId,
      decisionNote: 'Approved for Thursday evening',
    });

    const events = await db.operationsTaskEvent.findMany({
      where: { taskId: request.id },
      orderBy: { occurredAt: 'asc' },
    });
    expect(events.map(({ toStatus }) => toStatus)).toEqual([
      'OPEN',
      'APPROVED',
    ]);
    await expect(
      db.operationsTaskEvent.delete({ where: { id: events[0]!.id } }),
    ).rejects.toThrow();
  });
});
