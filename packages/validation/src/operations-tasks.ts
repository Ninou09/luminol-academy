import { z } from 'zod';

export const operationsTaskKinds = ['TASK', 'APPROVAL'] as const;
export const operationsTaskStatuses = [
  'OPEN',
  'DONE',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
] as const;
export const operationsTaskPriorities = ['HIGH', 'NORMAL', 'LOW'] as const;

export type OperationsTaskKindValue = (typeof operationsTaskKinds)[number];
export type OperationsTaskStatusValue = (typeof operationsTaskStatuses)[number];
export type OperationsTaskPriorityValue =
  (typeof operationsTaskPriorities)[number];

export const operationsTaskKindSchema = z.enum(operationsTaskKinds);
export const operationsTaskStatusSchema = z.enum(operationsTaskStatuses);
export const operationsTaskPrioritySchema = z.enum(operationsTaskPriorities);
export const operationsTaskTitleSchema = z.string().trim().min(3).max(160);
export const operationsTaskDetailsSchema = z
  .string()
  .trim()
  .max(1000)
  .transform((value) => (value.length > 0 ? value : null));
export const operationsDecisionNoteSchema = z
  .string()
  .trim()
  .max(240)
  .transform((value) => (value.length > 0 ? value : null));

/** Who may move a task: the assignee/requester, or an approver/manager. */
export type OperationsTaskRole = 'worker' | 'approver';

const transitions: Record<
  OperationsTaskKindValue,
  Partial<
    Record<
      OperationsTaskStatusValue,
      readonly {
        to: OperationsTaskStatusValue;
        roles: readonly OperationsTaskRole[];
      }[]
    >
  >
> = {
  TASK: {
    OPEN: [
      { to: 'DONE', roles: ['worker', 'approver'] },
      { to: 'CANCELLED', roles: ['worker', 'approver'] },
    ],
    DONE: [{ to: 'OPEN', roles: ['worker', 'approver'] }],
  },
  APPROVAL: {
    OPEN: [
      { to: 'APPROVED', roles: ['approver'] },
      { to: 'REJECTED', roles: ['approver'] },
      { to: 'CANCELLED', roles: ['worker', 'approver'] },
    ],
  },
};

export function getOperationsTaskTransitions(
  kind: OperationsTaskKindValue,
  from: OperationsTaskStatusValue,
  role: OperationsTaskRole,
): OperationsTaskStatusValue[] {
  return (transitions[kind][from] ?? [])
    .filter(({ roles }) => roles.includes(role))
    .map(({ to }) => to);
}

export function isOperationsTaskTransitionAllowed(
  kind: OperationsTaskKindValue,
  from: OperationsTaskStatusValue,
  to: OperationsTaskStatusValue,
  role: OperationsTaskRole,
) {
  return getOperationsTaskTransitions(kind, from, role).includes(to);
}

export function isOperationsTaskClosed(status: OperationsTaskStatusValue) {
  return status !== 'OPEN';
}
