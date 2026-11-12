import type { OperationsTaskActor } from '@luminol/database/operations-tasks';
import { formatLocalizedDate, type Locale } from '@luminol/localization';
import {
  getOperationsTaskTransitions,
  type OperationsTaskKindValue,
  type OperationsTaskPriorityValue,
  type OperationsTaskStatusValue,
} from '@luminol/validation/operations-tasks';

import { transitionOperationsTaskAction } from '../app/tasks/actions';
import type { OperationsTasksCopy } from '../lib/operations-tasks-localization';
import styles from './operations.module.css';

type Person = {
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export type OperationsTaskItemData = {
  id: string;
  kind: OperationsTaskKindValue;
  status: OperationsTaskStatusValue;
  priority: OperationsTaskPriorityValue;
  title: string;
  details: string | null;
  dueOn: Date | null;
  revision: number;
  decisionNote: string | null;
  createdByUserId: string;
  assignee: Person | null;
  createdBy: Person;
  decidedBy: Person | null;
};

function personName(person: Person) {
  return (
    [person.firstName, person.lastName].filter(Boolean).join(' ') ||
    person.email
  );
}

type OperationsTaskItemProps = {
  task: OperationsTaskItemData;
  actor: OperationsTaskActor;
  copy: OperationsTasksCopy;
  locale: Locale;
  todayIso: string;
  returnTo: string;
};

export function OperationsTaskItem({
  task,
  actor,
  copy,
  locale,
  todayIso,
  returnTo,
}: OperationsTaskItemProps) {
  const role =
    task.kind === 'APPROVAL'
      ? actor.canDecide
        ? 'approver'
        : 'worker'
      : actor.canManage
        ? 'approver'
        : 'worker';
  const transitions = getOperationsTaskTransitions(
    task.kind,
    task.status,
    role,
  ).filter(
    (status) =>
      !(
        task.kind === 'APPROVAL' &&
        role === 'worker' &&
        status === 'CANCELLED' &&
        task.createdByUserId !== actor.userId
      ),
  );
  const dueIso = task.dueOn?.toISOString().slice(0, 10) ?? null;
  const overdue =
    task.status === 'OPEN' && dueIso !== null && dueIso < todayIso;
  const isDecision = task.kind === 'APPROVAL' && role === 'approver';

  return (
    <li className={styles.row}>
      <div className={styles.rowBody}>
        <h3>
          <bdi>{task.title}</bdi>
        </h3>
        <p className={styles.meta}>
          <span className={styles.chip}>{copy.kind[task.kind]}</span>
          <span className={styles.chip}>{copy.status[task.status]}</span>
          <span>{copy.priority[task.priority]}</span>
          {dueIso ? (
            <span className={overdue ? styles.warning : undefined}>
              {overdue ? `${copy.overdue} · ` : ''}
              {formatLocalizedDate(task.dueOn!, locale, {
                day: 'numeric',
                month: 'short',
                timeZone: 'UTC',
              })}
            </span>
          ) : (
            <span>{copy.noDueDate}</span>
          )}
          {task.assignee ? (
            <span>
              {copy.assignedTo} <bdi>{personName(task.assignee)}</bdi>
            </span>
          ) : (
            <span>
              {copy.requestedBy} <bdi>{personName(task.createdBy)}</bdi>
            </span>
          )}
        </p>
        {task.details ? (
          <p className={styles.note}>
            <bdi>{task.details}</bdi>
          </p>
        ) : null}
        {task.decidedBy ? (
          <p className={styles.note}>
            {copy.decidedBy} <bdi>{personName(task.decidedBy)}</bdi>
            {task.decisionNote ? (
              <>
                {' '}
                · <bdi>{task.decisionNote}</bdi>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
      {transitions.length > 0 ? (
        <form
          action={transitionOperationsTaskAction}
          className={styles.rowBody}
        >
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="revision" value={task.revision} />
          <input type="hidden" name="returnTo" value={returnTo} />
          {isDecision ? (
            <label className={styles.field}>
              <span>{copy.decisionNoteLabel}</span>
              <input type="text" name="decisionNote" maxLength={240} />
            </label>
          ) : null}
          <div className={styles.actions}>
            {transitions.map((status) => (
              <button
                key={status}
                type="submit"
                name="toStatus"
                value={status}
                className={
                  status === 'CANCELLED' || status === 'REJECTED'
                    ? styles.dangerButton
                    : status === 'APPROVED' || status === 'DONE'
                      ? styles.button
                      : styles.secondaryButton
                }
              >
                {copy.moveTo[status]}
              </button>
            ))}
          </div>
        </form>
      ) : null}
    </li>
  );
}
