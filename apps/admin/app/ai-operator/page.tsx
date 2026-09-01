import { requirePermission } from '@luminol/auth';
import {
  AiOperatorProposalStatus,
  db,
  evaluateAiOperatorExecutionReadiness,
} from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import { aiOperatorActionSchema } from '@luminol/validation/ai-operator';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAiOperatorProposalQueueCopy } from '../../lib/ai-operator-proposal-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { decideAiOperatorProposalAction } from './actions';

function actorLabel(actor: { email: string } | null, fallback: string) {
  return actor?.email ?? fallback;
}

function actionSummary(
  action: ReturnType<typeof aiOperatorActionSchema.parse>,
) {
  if (action.kind === 'UPDATE_ENQUIRY_WORKFLOW') {
    return {
      target: `${action.target.surface} · ${action.target.enquiryId}`,
      payload: action.payload.operation,
    };
  }
  if (action.kind === 'SEND_OUTBOUND_MESSAGE') {
    return {
      target: `${action.target.channel} · ${action.target.recipientRef}`,
      payload: action.payload.templateKey,
    };
  }
  if (action.kind === 'PUBLISH_SOCIAL_CONTENT') {
    return {
      target: `${action.target.platform} · ${action.target.accountRef}`,
      payload: action.payload.contentCalendarItemId,
    };
  }
  return {
    target: action.target.surface,
    payload: action.payload.query,
  };
}

export default async function AiOperatorApprovalQueuePage() {
  await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getAiOperatorProposalQueueCopy(locale);
  const common = getCommonDictionary(locale);

  const [proposals, pending, approved, rejected, cancelled] = await Promise.all(
    [
      db.aiOperatorProposal.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          proposedBy: { select: { email: true } },
          decidedBy: { select: { email: true } },
          events: {
            orderBy: { occurredAt: 'asc' },
            include: { actor: { select: { email: true } } },
          },
        },
      }),
      db.aiOperatorProposal.count({
        where: { status: AiOperatorProposalStatus.PENDING_APPROVAL },
      }),
      db.aiOperatorProposal.count({
        where: { status: AiOperatorProposalStatus.APPROVED },
      }),
      db.aiOperatorProposal.count({
        where: { status: AiOperatorProposalStatus.REJECTED },
      }),
      db.aiOperatorProposal.count({
        where: { status: AiOperatorProposalStatus.CANCELLED },
      }),
    ],
  );

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) => formatLocalizedDate(value, locale);

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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="metric-grid" aria-label={copy.title}>
            <article>
              <span>{copy.pending}</span>
              <strong>{number(pending)}</strong>
            </article>
            <article>
              <span>{copy.approved}</span>
              <strong>{number(approved)}</strong>
            </article>
            <article>
              <span>{copy.rejected}</span>
              <strong>{number(rejected)}</strong>
            </article>
            <article>
              <span>{copy.cancelled}</span>
              <strong>{number(cancelled)}</strong>
            </article>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.proposal}</h2>
                <p>{copy.noExecution}</p>
              </div>
              <span>
                {number(proposals.length)} {copy.recent}
              </span>
            </div>

            {proposals.length ? (
              <div className="compact-list">
                {proposals.map((proposal) => {
                  const parsed = aiOperatorActionSchema.safeParse(
                    proposal.actionEnvelope,
                  );
                  const action = parsed.success ? parsed.data : null;
                  const summary = action ? actionSummary(action) : null;
                  const readiness =
                    evaluateAiOperatorExecutionReadiness(proposal);
                  const readinessChecks = [
                    ['envelopeValid', readiness.checks.envelopeValid],
                    ['metadataMatches', readiness.checks.metadataMatches],
                    ['approvalState', readiness.checks.approvalState],
                    ['policyRegistered', readiness.checks.policyRegistered],
                  ] as const;
                  const isPending =
                    proposal.status ===
                    AiOperatorProposalStatus.PENDING_APPROVAL;

                  return (
                    <article key={proposal.id} style={{ alignItems: 'start' }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 dir="auto">
                          {action && action.kind !== 'OPEN_ENQUIRY_QUEUE'
                            ? copy.kindLabel[action.kind]
                            : proposal.actionKind}
                        </h3>
                        <p>
                          {copy.policy}: {proposal.executionPolicy}
                        </p>
                        <p dir="auto">
                          {copy.source}: {proposal.sourceSurface} ·{' '}
                          {proposal.sourceReference}
                        </p>
                        {summary ? (
                          <>
                            <p dir="auto">
                              {copy.target}: {summary.target}
                            </p>
                            <p dir="auto">
                              {copy.payload}: {summary.payload}
                            </p>
                          </>
                        ) : (
                          <p>{copy.invalidEnvelope}</p>
                        )}
                        <p dir="auto">
                          {copy.proposedBy}:{' '}
                          {actorLabel(proposal.proposedBy, copy.noActor)} ·{' '}
                          {copy.created}: {date(proposal.createdAt)}
                        </p>
                        {proposal.decidedAt ? (
                          <p dir="auto">
                            {copy.decidedBy}:{' '}
                            {actorLabel(proposal.decidedBy, copy.noActor)} ·{' '}
                            {copy.decided}: {date(proposal.decidedAt)}
                          </p>
                        ) : null}

                        <section
                          aria-label={copy.readinessTitle}
                          style={{ marginTop: '1rem' }}
                        >
                          <h4>{copy.readinessTitle}</h4>
                          <p>{copy.readinessIntro}</p>
                          <p>
                            <strong>
                              {copy.readinessStatus[readiness.status]}
                            </strong>
                          </p>
                          <div className="compact-list">
                            {readinessChecks.map(([key, passed]) => (
                              <article key={key}>
                                <span>{copy.readinessCheck[key]}</span>
                                <strong>
                                  {passed
                                    ? copy.readinessPassed
                                    : copy.readinessFailed}
                                </strong>
                              </article>
                            ))}
                          </div>
                        </section>

                        <details>
                          <summary>{copy.exactEnvelope}</summary>
                          <pre
                            dir="ltr"
                            style={{
                              whiteSpace: 'pre-wrap',
                              overflowWrap: 'anywhere',
                              maxWidth: '100%',
                            }}
                          >
                            {JSON.stringify(proposal.actionEnvelope, null, 2)}
                          </pre>
                        </details>

                        <details>
                          <summary>{copy.auditHistory}</summary>
                          <div className="compact-list">
                            {proposal.events.map((event) => (
                              <article key={event.id}>
                                <div>
                                  <strong>{event.eventType}</strong>
                                  <p dir="auto">
                                    {actorLabel(event.actor, copy.noActor)}
                                  </p>
                                </div>
                                <div>
                                  <small>{date(event.occurredAt)}</small>
                                  <span>
                                    {event.fromStatus ?? '—'} → {event.toStatus}
                                  </span>
                                </div>
                              </article>
                            ))}
                          </div>
                        </details>

                        {isPending &&
                        action &&
                        action.kind !== 'OPEN_ENQUIRY_QUEUE' ? (
                          <form
                            action={decideAiOperatorProposalAction}
                            style={{
                              display: 'grid',
                              gap: '0.75rem',
                              marginTop: '1rem',
                            }}
                          >
                            <input
                              type="hidden"
                              name="proposalId"
                              value={proposal.id}
                            />
                            <label>
                              <span>{copy.rejectionNote}</span>
                              <textarea
                                name="note"
                                maxLength={500}
                                placeholder={copy.rejectionPlaceholder}
                                rows={2}
                              />
                            </label>
                            <div
                              style={{
                                display: 'flex',
                                gap: '0.75rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <button
                                type="submit"
                                name="decision"
                                value="APPROVED"
                              >
                                {copy.approve}
                              </button>
                              <button
                                type="submit"
                                name="decision"
                                value="REJECTED"
                              >
                                {copy.reject}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p>{copy.pendingOnly}</p>
                        )}
                      </div>
                      <div>
                        <span className="data-status">
                          {copy.statusLabel[proposal.status]}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="admin-empty">{copy.noProposals}</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
