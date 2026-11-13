import { db } from '@luminol/database';
import { operationsTaskScopeWhere } from '@luminol/database/operations-tasks';
import { localizeHref } from '@luminol/localization';
import { utcToZonedLocal } from '@luminol/validation/consultations';

import { CrmShell } from '../../components/crm-shell';
import { OperationsTaskItem } from '../../components/operations-task-item';
import styles from '../../components/operations.module.css';
import { requireOperationsTaskActor } from '../../lib/operations-task-actor.server';
import {
  getOperationsTasksCopy,
  parseOperationsTaskFeedback,
} from '../../lib/operations-tasks-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { createOperationsTaskAction } from '../tasks/actions';

type ApprovalsPageProps = {
  searchParams?: Promise<{
    error?: string | string[] | undefined;
    saved?: string | string[] | undefined;
  }>;
};

const personSelect = {
  select: { email: true, firstName: true, lastName: true },
} as const;

/** Owner approval requests: decide, request, and review recent decisions. */
export default async function ApprovalsPage({
  searchParams,
}: ApprovalsPageProps) {
  const { user, actor } = await requireOperationsTaskActor();
  const locale = await getAdminRequestLocale();
  const copy = getOperationsTasksCopy(locale);
  const params = searchParams ? await searchParams : undefined;
  const feedback = parseOperationsTaskFeedback(params?.error);
  const saved = params?.saved === '1';
  const todayIso = utcToZonedLocal(new Date()).slice(0, 10);
  const returnTo = localizeHref(locale, '/approvals');
  const scope = operationsTaskScopeWhere(actor);
  const include = {
    assignee: personSelect,
    createdBy: personSelect,
    decidedBy: personSelect,
  } as const;

  const [open, decided] = await Promise.all([
    db.operationsTask.findMany({
      where: { ...scope, kind: 'APPROVAL', status: 'OPEN' },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include,
    }),
    db.operationsTask.findMany({
      where: { ...scope, kind: 'APPROVAL', status: { not: 'OPEN' } },
      orderBy: { updatedAt: 'desc' },
      take: 30,
      include,
    }),
  ]);
  const itemProps = { actor, copy, locale, todayIso, returnTo };

  return (
    <CrmShell locale={locale} user={user} current="approvals">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.approvalsTitle}</h1>
          <p>{copy.approvalBoundary}</p>
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
        {open.length === 0 ? (
          <p className={styles.empty}>{copy.noApprovals}</p>
        ) : (
          <ul className={styles.list}>
            {open.map((task) => (
              <OperationsTaskItem key={task.id} task={task} {...itemProps} />
            ))}
          </ul>
        )}
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
        {decided.length === 0 ? (
          <p className={styles.empty}>{copy.noClosed}</p>
        ) : (
          <ul className={styles.list}>
            {decided.map((task) => (
              <OperationsTaskItem key={task.id} task={task} {...itemProps} />
            ))}
          </ul>
        )}
      </section>
    </CrmShell>
  );
}
