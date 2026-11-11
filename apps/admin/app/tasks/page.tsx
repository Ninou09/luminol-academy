import { db } from '@luminol/database';
import {
  listTaskAssignees,
  operationsTaskScopeWhere,
} from '@luminol/database/operations-tasks';
import { getCommonDictionary, localizeHref } from '@luminol/localization';
import { utcToZonedLocal } from '@luminol/validation/consultations';
import { operationsTaskPriorities } from '@luminol/validation/operations-tasks';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { OperationsTaskItem } from '../../components/operations-task-item';
import styles from '../../components/operations.module.css';
import { StaffNavigation } from '../../components/staff-navigation';
import { requireOperationsTaskActor } from '../../lib/operations-task-actor.server';
import {
  getOperationsTasksCopy,
  parseOperationsTaskFeedback,
} from '../../lib/operations-tasks-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { createOperationsTaskAction } from './actions';

type TasksPageProps = {
  searchParams?: Promise<{
    error?: string | string[] | undefined;
    saved?: string | string[] | undefined;
  }>;
};

const personSelect = {
  select: { email: true, firstName: true, lastName: true },
} as const;

function personName(person: {
  email: string;
  firstName: string | null;
  lastName: string | null;
}) {
  return (
    [person.firstName, person.lastName].filter(Boolean).join(' ') ||
    person.email
  );
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { user, actor } = await requireOperationsTaskActor();
  const locale = await getAdminRequestLocale();
  const copy = getOperationsTasksCopy(locale);
  const common = getCommonDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const feedback = parseOperationsTaskFeedback(params?.error);
  const saved = params?.saved === '1';
  const todayIso = utcToZonedLocal(new Date()).slice(0, 10);
  const returnTo = localizeHref(locale, '/tasks');
  const scope = operationsTaskScopeWhere(actor);
  const include = {
    assignee: personSelect,
    createdBy: personSelect,
    decidedBy: personSelect,
  } as const;

  const [openTasks, approvals, closed, assignees] = await Promise.all([
    db.operationsTask.findMany({
      where: { ...scope, kind: 'TASK', status: 'OPEN' },
      orderBy: [
        { dueOn: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'asc' },
      ],
      take: 200,
      include,
    }),
    db.operationsTask.findMany({
      where: { ...scope, kind: 'APPROVAL', status: 'OPEN' },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include,
    }),
    db.operationsTask.findMany({
      where: { ...scope, status: { not: 'OPEN' } },
      orderBy: { updatedAt: 'desc' },
      take: 25,
      include,
    }),
    actor.canManage ? listTaskAssignees(db) : Promise.resolve([]),
  ]);

  const itemProps = { actor, copy, locale, todayIso, returnTo };

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
            </div>
            <div className={styles.toolbar}>
              <StaffNavigation
                locale={locale}
                roles={user.roles}
                current="tasks"
              />
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          {feedback ? (
            <p className={styles.warning} role="alert">
              {copy.feedback[feedback]}
            </p>
          ) : saved ? (
            <p className={styles.success} role="status">
              {copy.saved}
            </p>
          ) : null}

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.approvalsTitle}</h2>
            </div>
            <p className={styles.note}>{copy.approvalBoundary}</p>
            {approvals.length === 0 ? (
              <p className={styles.empty}>{copy.noApprovals}</p>
            ) : (
              <ul className={styles.list}>
                {approvals.map((task) => (
                  <OperationsTaskItem
                    key={task.id}
                    task={task}
                    {...itemProps}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.openTasksTitle}</h2>
            </div>
            {openTasks.length === 0 ? (
              <p className={styles.empty}>{copy.noOpenTasks}</p>
            ) : (
              <ul className={styles.list}>
                {openTasks.map((task) => (
                  <OperationsTaskItem
                    key={task.id}
                    task={task}
                    {...itemProps}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.createTaskTitle}</h2>
            </div>
            <form action={createOperationsTaskAction} className={styles.form}>
              <input type="hidden" name="kind" value="TASK" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <div className={styles.grid}>
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>{copy.titleLabel}</span>
                  <input
                    type="text"
                    name="title"
                    minLength={3}
                    maxLength={160}
                    required
                  />
                </label>
                {actor.canManage ? (
                  <label className={styles.field}>
                    <span>{copy.assigneeLabel}</span>
                    <select name="assigneeUserId" defaultValue={user.id}>
                      {assignees.map((assignee) => (
                        <option key={assignee.id} value={assignee.id}>
                          {personName(assignee)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <label className={styles.field}>
                  <span>{copy.dueLabel}</span>
                  <input type="date" name="dueOn" min={todayIso} />
                </label>
                <label className={styles.field}>
                  <span>{copy.priorityLabel}</span>
                  <select name="priority" defaultValue="NORMAL">
                    {operationsTaskPriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {copy.priority[priority]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>{copy.detailsLabel}</span>
                  <textarea name="details" rows={2} maxLength={1000} />
                </label>
              </div>
              <div>
                <button type="submit" className={styles.button}>
                  {copy.createTask}
                </button>
              </div>
            </form>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.requestApprovalTitle}</h2>
                <p className={styles.note}>{copy.requestApprovalIntro}</p>
              </div>
            </div>
            <form action={createOperationsTaskAction} className={styles.form}>
              <input type="hidden" name="kind" value="APPROVAL" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <label className={styles.field}>
                <span>{copy.titleLabel}</span>
                <input
                  type="text"
                  name="title"
                  minLength={3}
                  maxLength={160}
                  required
                />
              </label>
              <label className={styles.field}>
                <span>{copy.detailsLabel}</span>
                <textarea name="details" rows={4} maxLength={1000} required />
              </label>
              <div>
                <button type="submit" className={styles.button}>
                  {copy.requestApproval}
                </button>
              </div>
            </form>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.closedTitle}</h2>
            </div>
            {closed.length === 0 ? (
              <p className={styles.empty}>{copy.noClosed}</p>
            ) : (
              <ul className={styles.list}>
                {closed.map((task) => (
                  <OperationsTaskItem
                    key={task.id}
                    task={task}
                    {...itemProps}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
