import { randomUUID } from 'node:crypto';
import { requirePermission } from '@luminol/auth';
import { db, museAttentionScore } from '@luminol/database';
import {
  getLocaleDirection,
  localizeHref,
  formatLocalizedDate,
} from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import { museAgentSchema } from '@luminol/validation/muse';
import { z } from 'zod';
import Link from 'next/link';
import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { MuseCommand } from '../../components/muse-command';
import { AiProviderRunPanel } from '../../components/ai-provider-run-panel';
import { getAiProviderCopy } from '../../lib/ai-provider-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { getMuseCopy } from '../../lib/muse-copy';
import {
  archiveKnowledgeAction,
  completeTaskAction,
  draftApprovalAction,
  followUpAction,
  knowledgeAction,
  taskAction,
  whatsappHandoffAction,
} from './actions';
import './muse.css';

export const dynamic = 'force-dynamic';
const responseSchema = z.object({
  agent: museAgentSchema,
  text: z.string(),
  mode: z.literal('local'),
  evidence: z.array(
    z.object({
      label: z.string(),
      reference: z.string(),
      observedAt: z.string(),
    }),
  ),
});

export default async function MusePage() {
  const actor = await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getMuseCopy(locale);
  const aiCopy = getAiProviderCopy(locale);
  const canFinance = actor.roles.some(({ role }) =>
    role.permissions.some(
      ({ permission }) => permission.key === 'finance:manage',
    ),
  );
  const now = new Date();
  const [runs, leads, tasks, knowledge, events, pending, approved] =
    await Promise.all([
      db.museRun.findMany({
        where: {
          actorId: actor.id,
          ...(!canFinance ? { intent: { not: 'revenue' } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      db.enquiry.findMany({
        where: { status: { in: ['NEW', 'IN_REVIEW', 'CONTACTED'] } },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true,
          name: true,
          programmeTitleSnapshot: true,
          createdAt: true,
          nextFollowUpAt: true,
          ownerUserId: true,
          consent: true,
          preferredContact: true,
          phone: true,
        },
      }),
      db.museTask.findMany({
        where: {
          actorId: actor.id,
          done: false,
          ...(!canFinance ? { agent: { not: 'revenue' } } : {}),
        },
        orderBy: { dueAt: 'asc' },
        take: 50,
      }),
      db.museKnowledge.findMany({
        where: {
          active: true,
          locale,
          ...(!canFinance ? { agent: { not: 'revenue' } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      db.museEvent.findMany({
        where: { actorId: actor.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.aiOperatorProposal.count({ where: { status: 'PENDING_APPROVAL' } }),
      db.aiOperatorProposal.findMany({
        where: {
          status: 'APPROVED',
          actionId: { startsWith: 'muse-message:' },
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: { id: true, actionId: true },
      }),
    ]);
  const ranked = leads
    .map((lead) => ({ ...lead, attention: museAttentionScore(lead, now) }))
    .sort(
      (a, b) =>
        b.attention.score - a.attention.score ||
        a.createdAt.getTime() - b.createdAt.getTime(),
    )
    .slice(0, 20);
  const drafts = await db.museDraft.findMany({
    where: {
      requestId: {
        in: approved.map((item) => item.actionId.replace('muse-message:', '')),
      },
    },
  });
  const date = (value: Date) => formatLocalizedDate(value, locale);
  const agentOptions = Object.entries(copy.agents)
    .filter(([key]) => key !== 'revenue' || canFinance)
    .map(([key, label]) => (
      <option value={key} key={key}>
        {label}
      </option>
    ));

  return (
    <main className="muse-shell" dir={getLocaleDirection(locale)}>
      <aside className="muse-sidebar">
        <Link href={localizeHref(locale, '/')} className="muse-brand">
          <Wordmark />
        </Link>
        <p className="muse-product">
          LUMINOL MUSE <span>OS / 01</span>
        </p>
        <nav aria-label={copy.home}>
          <Link href={localizeHref(locale, '/muse')} aria-current="page">
            ✦ {copy.conversation}
          </Link>
          <Link href={localizeHref(locale, '/ai-operator')}>
            ◎ {copy.approvals} <b>{pending}</b>
          </Link>
          <a href="#memory">◈ {copy.knowledge}</a>
          <a href="#tasks">☷ {copy.tasks}</a>
          <a href="#activity">◷ {copy.activity}</a>
          <a href="#connectors">⇄ {copy.connectors}</a>
          <Link href={localizeHref(locale, '/')}>↗ {copy.home}</Link>
        </nav>
        <div className="muse-agents">
          <p>{copy.agent}</p>
          {Object.entries(copy.agents).map(([key, label], index) => (
            <div key={key}>
              <span className="muse-agent-dot" />
              {label}
              <small>{String(index).padStart(2, '0')}</small>
            </div>
          ))}
        </div>
        <p className="muse-sidebar-note">{copy.safety}</p>
      </aside>
      <section className="muse-main">
        <header className="muse-topbar">
          <span>
            LUMINOL OS <span aria-hidden="true">/</span> MUSE
          </span>
          <AdminLanguageSwitcher
            locale={locale}
            label="العربية · Français · English"
          />
        </header>
        <div className="muse-content">
          <div className="muse-heading">
            <p className="muse-kicker">✦ LUMINOL MUSE</p>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
            <span className="muse-badge">{copy.local}</span>
          </div>
          <section
            className="muse-notifications"
            aria-label={copy.notifications}
          >
            <strong>{copy.notifications}</strong>
            <Link href={localizeHref(locale, '/ai-operator')}>
              {pending} · {copy.approvalCount} ↗
            </Link>
            <a href="#tasks">
              {tasks.filter((task) => task.dueAt <= now).length} ·{' '}
              {copy.dueTasks} ↗
            </a>
            <Link href={localizeHref(locale, '/notifications')}>
              {copy.all} ↗
            </Link>
          </section>
          <div className="muse-workspace">
            <section className="muse-card muse-chat">
              <MuseCommand locale={locale} canFinance={canFinance} />
              <div className="muse-history" aria-live="polite">
                {runs.length === 0 && (
                  <p className="muse-empty">{copy.empty}</p>
                )}
                {runs.map((run) => {
                  const parsed = responseSchema.safeParse(run.response);
                  return (
                    <article key={run.id}>
                      <div className="muse-user">
                        <span>{date(run.createdAt)}</span>
                        <p dir="auto">{run.prompt}</p>
                      </div>
                      {parsed.success && (
                        <div className="muse-answer">
                          <strong>✦ {copy.agents[parsed.data.agent]}</strong>
                          <p dir="auto">{parsed.data.text}</p>
                          <div className="muse-evidence">
                            {parsed.data.evidence.map((item) => (
                              <span key={item.reference}>
                                {item.label} · {date(new Date(item.observedAt))}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
            <aside className="muse-card muse-priority">
              <p className="muse-kicker">CRM / LEADS</p>
              <h2>{copy.leads}</h2>
              <p className="muse-muted">{copy.leadScope}</p>
              {ranked.length === 0 && <p>{copy.empty}</p>}
              {ranked.map((lead) => (
                <details key={lead.id} className="muse-lead">
                  <summary>
                    <span>
                      <strong dir="auto">{lead.name}</strong>
                      <small dir="auto">
                        {lead.programmeTitleSnapshot ?? 'Luminol Academy'}
                      </small>
                    </span>
                    <b aria-label={copy.score}>{lead.attention.score}</b>
                  </summary>
                  <p>
                    {copy.reasons}:{' '}
                    {[
                      lead.attention.overdue && copy.overdue,
                      lead.attention.unassigned && copy.unassigned,
                      lead.attention.waiting && copy.waiting,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </p>
                  <Link href={localizeHref(locale, '/enquiries')}>
                    {copy.all} ↗
                  </Link>
                  <form action={followUpAction}>
                    <input
                      type="hidden"
                      name="requestId"
                      value={randomUUID()}
                    />
                    <input type="hidden" name="enquiryId" value={lead.id} />
                    <label>
                      {copy.nextAction}
                      <input
                        name="nextAction"
                        maxLength={240}
                        defaultValue={copy.nextDefault}
                        required
                      />
                    </label>
                    <label>
                      {copy.due}
                      <input type="date" name="nextFollowUpOn" required />
                    </label>
                    <button>{copy.planApprove}</button>
                  </form>
                  <form action={draftApprovalAction}>
                    <input
                      type="hidden"
                      name="requestId"
                      value={randomUUID()}
                    />
                    <input type="hidden" name="enquiryId" value={lead.id} />
                    <label>
                      {copy.draft}
                      <textarea
                        name="text"
                        defaultValue={copy.draftText}
                        rows={4}
                        maxLength={2000}
                        required
                      />
                    </label>
                    <button
                      disabled={
                        !lead.consent ||
                        lead.preferredContact !== 'WHATSAPP' ||
                        !/^\+[1-9]\d{6,14}$/.test(
                          lead.phone?.replace(/[\s()-]/g, '') ?? '',
                        )
                      }
                    >
                      {copy.draftApprove}
                    </button>
                    <p className="muse-muted">WhatsApp · {copy.manual}</p>
                  </form>
                </details>
              ))}
            </aside>
          </div>
          {approved.length > 0 && (
            <section className="muse-card">
              <h2>{copy.handoff}</h2>
              <p>{copy.handoffNote}</p>
              {approved.map((proposal) => {
                const draft = drafts.find(
                  (item) =>
                    `muse-message:${item.requestId}` === proposal.actionId,
                );
                return draft ? (
                  <article key={proposal.id}>
                    <p dir="auto">{draft.text}</p>
                    <form action={whatsappHandoffAction}>
                      <input
                        type="hidden"
                        name="proposalId"
                        value={proposal.id}
                      />
                      <button>{copy.handoff}</button>
                    </form>
                  </article>
                ) : null;
              })}
            </section>
          )}
          <section className="muse-card">
            <Link href={localizeHref(locale, '/ai-provider')}>
              {aiCopy.title} ↗
            </Link>
            <p className="muse-muted">{aiCopy.privacy}</p>
            <AiProviderRunPanel
              title={aiCopy.runTitle}
              summary={{
                title: aiCopy.summaryTitle,
                intro: aiCopy.summaryIntro,
                action: aiCopy.summaryAction,
              }}
              recommendations={{
                title: aiCopy.recommendationsTitle,
                intro: aiCopy.recommendationsIntro,
                action: aiCopy.recommendationsAction,
              }}
              campaignAnalysis={{
                title: aiCopy.campaignAnalysisTitle,
                intro: aiCopy.campaignAnalysisIntro,
                action: aiCopy.campaignAnalysisAction,
              }}
              running={aiCopy.running}
              advisoryLabel={aiCopy.advisoryLabel}
              noSideEffects={aiCopy.noSideEffects}
              blockedResult={aiCopy.blockedResult}
              failedResult={aiCopy.failedResult}
              errorCodeLabel={aiCopy.errorCode}
            />
          </section>
          <div className="muse-bottom-grid">
            <section className="muse-card" id="tasks">
              <p className="muse-kicker">PLAN / DO</p>
              <h2>{copy.tasks}</h2>
              {tasks.map((task) => (
                <article className="muse-task" key={task.id}>
                  <div>
                    <strong dir="auto">{task.title}</strong>
                    <p dir="auto">{task.goal}</p>
                    <small>
                      {date(task.dueAt)} ·{' '}
                      {copy.agents[museAgentSchema.parse(task.agent)]}
                    </small>
                  </div>
                  <form action={completeTaskAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <button>{copy.complete}</button>
                  </form>
                </article>
              ))}
              <form action={taskAction}>
                <label>
                  {copy.titleLabel}
                  <input name="title" required minLength={3} maxLength={240} />
                </label>
                <label>
                  {copy.goal}
                  <input name="goal" maxLength={500} />
                </label>
                <div className="muse-form-row">
                  <label>
                    {copy.due}
                    <input name="dueOn" type="date" required />
                  </label>
                  <label>
                    {copy.agent}
                    <select name="agent">{agentOptions}</select>
                  </label>
                </div>
                <button>{copy.saveTask}</button>
              </form>
            </section>
            <section className="muse-card" id="memory">
              <p className="muse-kicker">KNOW / GROW</p>
              <h2>{copy.knowledge}</h2>
              <p className="muse-muted">{copy.knowledgeNote}</p>
              {knowledge.map((item) => (
                <details key={item.id} className="muse-memory">
                  <summary dir="auto">{item.title}</summary>
                  <p dir="auto">{item.content}</p>
                  <small dir="auto">
                    {copy.source}: {item.source} · {date(item.createdAt)}
                  </small>
                  <form action={archiveKnowledgeAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button>{copy.archive}</button>
                  </form>
                </details>
              ))}
              <form action={knowledgeAction}>
                <label>
                  {copy.titleLabel}
                  <input name="title" required minLength={3} maxLength={160} />
                </label>
                <label>
                  {copy.source}
                  <input name="source" required minLength={3} maxLength={500} />
                </label>
                <label>
                  {copy.content}
                  <textarea
                    name="content"
                    rows={4}
                    required
                    minLength={10}
                    maxLength={6000}
                  />
                </label>
                <label>
                  {copy.agent}
                  <select name="agent">{agentOptions}</select>
                </label>
                <button>{copy.approveKnowledge}</button>
              </form>
            </section>
          </div>
          <section className="muse-card" id="connectors">
            <p className="muse-kicker">CONNECT / CONTROL</p>
            <h2>{copy.connectors}</h2>
            <div className="muse-connector-grid">
              {[
                ['Website / CRM / Courses', copy.connected, '/enquiries'],
                [
                  'Content calendar / Meta publishing',
                  copy.all,
                  '/content-calendar',
                ],
                [
                  'Finance',
                  canFinance ? copy.connected : copy.needsCredentials,
                  canFinance ? '/finance' : '/muse',
                ],
                ['Academy analytics', copy.connected, '/analytics'],
                ['Gmail / Google Calendar', copy.needsCredentials, null],
                ['Tally / Telegram', copy.needsCredentials, null],
                ['Facebook / Instagram insights', copy.needsCredentials, null],
                ['WhatsApp', copy.manual, null],
                ['Consultations / bookings', copy.needsCredentials, null],
              ].map(([name, status, href]) => (
                <div key={name}>
                  <strong dir="auto">{name}</strong>
                  <span>{status}</span>
                  {href && (
                    <Link href={localizeHref(locale, href)}>{copy.all} ↗</Link>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="muse-card" id="activity">
            <p className="muse-kicker">TRACE / TRUST</p>
            <h2>{copy.activity}</h2>
            <p className="muse-muted">{copy.activityNote}</p>
            {events.length === 0 && <p>{copy.empty}</p>}
            <ol className="muse-timeline">
              {events.map((event) => (
                <li key={event.id}>
                  <span className="muse-agent-dot" />
                  <div>
                    <strong>
                      {copy.events[event.kind as keyof typeof copy.events] ??
                        event.kind}
                    </strong>
                    <small>
                      {date(event.createdAt)} · <bdi>{event.reference}</bdi>
                    </small>
                  </div>
                </li>
              ))}
            </ol>
            <Link href={localizeHref(locale, '/ai-operator')}>
              {copy.approvals} ↗
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
