import { localDateSchema } from '@luminol/validation/consultations';
import {
  isOperationsTaskTransitionAllowed,
  operationsDecisionNoteSchema,
  operationsTaskDetailsSchema,
  operationsTaskKindSchema,
  operationsTaskPrioritySchema,
  operationsTaskStatusSchema,
  operationsTaskTitleSchema,
  type OperationsTaskRole,
} from '@luminol/validation/operations-tasks';

import {
  OperationsTaskEventType,
  type OperationsTask,
  type Prisma,
  type PrismaClient,
} from '../generated/prisma/client';

const TASK_WORK_PERMISSION = 'task:work';

/** Capabilities resolved from the persisted role graph by the caller. */
export type OperationsTaskActor = {
  userId: string;
  canManage: boolean;
  canDecide: boolean;
};

export type OperationsTaskErrorCode =
  'not-found' | 'forbidden' | 'ineligible-assignee' | 'stale' | 'transition';

export class OperationsTaskError extends Error {
  constructor(
    readonly code: OperationsTaskErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'OperationsTaskError';
  }
}

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 128) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function requireRevision(value: number) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error('Task revision is invalid');
  }
  return value;
}

export function operationsTaskScopeWhere(
  actor: OperationsTaskActor,
): Prisma.OperationsTaskWhereInput {
  if (actor.canManage) return {};
  return {
    OR: [
      { assigneeUserId: actor.userId },
      { createdByUserId: actor.userId },
      ...(actor.canDecide ? [{ kind: 'APPROVAL' as const }] : []),
    ],
  };
}

/** Staff who can hold tasks: any active account with `task:work`. */
export function listTaskAssignees(client: PrismaClient) {
  return client.user.findMany({
    where: {
      deletedAt: null,
      roles: {
        some: {
          role: {
            permissions: {
              some: { permission: { key: TASK_WORK_PERMISSION } },
            },
          },
        },
      },
    },
    orderBy: { email: 'asc' },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
}

function roleFor(
  actor: OperationsTaskActor,
  task: Pick<OperationsTask, 'kind'>,
): OperationsTaskRole {
  if (task.kind === 'APPROVAL') return actor.canDecide ? 'approver' : 'worker';
  return actor.canManage ? 'approver' : 'worker';
}

export interface CreateOperationsTaskInput {
  actor: OperationsTaskActor;
  kind: string;
  title: string;
  details?: string | null;
  assigneeUserId?: string | null;
  dueOn?: string | null;
  priority?: string | null;
  clientId?: string | null;
}

export async function createOperationsTask(
  client: PrismaClient,
  input: CreateOperationsTaskInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const kind = operationsTaskKindSchema.parse(input.kind);
  const title = operationsTaskTitleSchema.parse(input.title);
  const details = operationsTaskDetailsSchema.parse(input.details ?? '');
  const priority = operationsTaskPrioritySchema.parse(
    input.priority ?? 'NORMAL',
  );
  const dueOnRaw = input.dueOn?.trim() || null;
  const dueOn = dueOnRaw
    ? new Date(`${localDateSchema.parse(dueOnRaw)}T00:00:00.000Z`)
    : null;
  const clientId = input.clientId?.trim() || null;

  let assigneeUserId: string | null = null;
  if (kind === 'TASK') {
    assigneeUserId = input.assigneeUserId?.trim() || actorUserId;
    if (!input.actor.canManage && assigneeUserId !== actorUserId) {
      throw new OperationsTaskError(
        'forbidden',
        'Only managers can assign tasks to someone else',
      );
    }
  }

  return client.$transaction(async (tx) => {
    if (assigneeUserId) {
      const assignee = await tx.user.findFirst({
        where: {
          id: assigneeUserId,
          deletedAt: null,
          roles: {
            some: {
              role: {
                permissions: {
                  some: { permission: { key: TASK_WORK_PERMISSION } },
                },
              },
            },
          },
        },
        select: { id: true },
      });
      if (!assignee) {
        throw new OperationsTaskError(
          'ineligible-assignee',
          'Tasks can only be assigned to active staff',
        );
      }
    }
    if (clientId) {
      const record = await tx.client.findUnique({
        where: { id: clientId },
        select: { id: true },
      });
      if (!record) {
        throw new OperationsTaskError('not-found', 'Client was not found');
      }
    }

    const task = await tx.operationsTask.create({
      data: {
        kind,
        title,
        details,
        assigneeUserId,
        dueOn,
        priority,
        clientId,
        createdByUserId: actorUserId,
      },
    });
    await tx.operationsTaskEvent.create({
      data: {
        taskId: task.id,
        eventType: OperationsTaskEventType.CREATED,
        actorUserId,
        toStatus: task.status,
      },
    });
    return task;
  });
}

export interface TransitionOperationsTaskInput {
  actor: OperationsTaskActor;
  taskId: string;
  expectedRevision: number;
  toStatus: string;
  decisionNote?: string | null;
  now?: Date;
}

export async function transitionOperationsTask(
  client: PrismaClient,
  input: TransitionOperationsTaskInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const taskId = requireIdentifier(input.taskId, 'Task');
  const expectedRevision = requireRevision(input.expectedRevision);
  const toStatus = operationsTaskStatusSchema.parse(input.toStatus);
  const decisionNote = operationsDecisionNoteSchema.parse(
    input.decisionNote ?? '',
  );
  const now = input.now ?? new Date();

  return client.$transaction(async (tx) => {
    const task = await tx.operationsTask.findFirst({
      where: { id: taskId, ...operationsTaskScopeWhere(input.actor) },
    });
    if (!task) {
      throw new OperationsTaskError('not-found', 'Task was not found');
    }
    if (task.revision !== expectedRevision) {
      throw new OperationsTaskError(
        'stale',
        'Task changed since it was loaded; reload and try again',
      );
    }

    const role = roleFor(input.actor, task);
    if (
      !isOperationsTaskTransitionAllowed(task.kind, task.status, toStatus, role)
    ) {
      throw new OperationsTaskError(
        'transition',
        `Cannot move this ${task.kind.toLowerCase()} from ${task.status} to ${toStatus}`,
      );
    }
    if (
      task.kind === 'APPROVAL' &&
      role === 'worker' &&
      task.createdByUserId !== actorUserId
    ) {
      throw new OperationsTaskError(
        'forbidden',
        'Only the requester can withdraw an approval request',
      );
    }

    const isDecision = toStatus === 'APPROVED' || toStatus === 'REJECTED';
    const updated = await tx.operationsTask.update({
      where: { id: task.id },
      data: {
        status: toStatus,
        closedAt: toStatus === 'OPEN' ? null : now,
        ...(isDecision ? { decidedByUserId: actorUserId, decisionNote } : {}),
        revision: { increment: 1 },
      },
    });
    await tx.operationsTaskEvent.create({
      data: {
        taskId: task.id,
        eventType: OperationsTaskEventType.STATUS_CHANGED,
        actorUserId,
        fromStatus: task.status,
        toStatus: updated.status,
      },
    });
    return updated;
  });
}
