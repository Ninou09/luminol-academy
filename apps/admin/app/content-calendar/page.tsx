import { requirePermission } from '@luminol/auth';
import { ContentCalendarStatus, db } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getContentCalendarCopy } from '../../lib/content-calendar-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  createContentCalendarItemAction,
  queueContentCalendarPublishProposalAction,
  transitionContentCalendarStatusAction,
  updateContentCalendarItemAction,
} from './actions';
import styles from './page.module.css';

const transitions: Record<ContentCalendarStatus, ContentCalendarStatus[]> = {
  DRAFT: [ContentCalendarStatus.READY, ContentCalendarStatus.ARCHIVED],
  READY: [
    ContentCalendarStatus.DRAFT,
    ContentCalendarStatus.SCHEDULED,
    ContentCalendarStatus.ARCHIVED,
  ],
  SCHEDULED: [
    ContentCalendarStatus.READY,
    ContentCalendarStatus.ARCHIVED,
  ],
  ARCHIVED: [],
};

function actorLabel(actor: { email: string } | null) {
  return actor?.email ?? '—';
}

export default async function ContentCalendarPage() {
  await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getContentCalendarCopy(locale);
  const common = getCommonDictionary(locale);

  const [items, proposals, draftCount, readyCount, scheduledCount, archivedCount] =
    await Promise.all([
      db.contentCalendarItem.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 50,
        include: {
          createdBy: { select: { email: true } },
          updatedBy: { select: { email: true } },
          events: {
            orderBy: { occurredAt: 'asc' },
            include: { actor: { select: { email: true } } },
          },
        },
      }),
      db.aiOperatorProposal.findMany({
        where: { sourceSurface: 'content_calendar' },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true,
          status: true,
          sourceReference: true,
          createdAt: true,
        },
      }),
      db.contentCalendarItem.count({
        where: { status: ContentCalendarStatus.DRAFT },
      }),
      db.contentCalendarItem.count({
        where: { status: ContentCalendarStatus.READY },
      }),
      db.contentCalendarItem.count({
        where: { status: ContentCalendarStatus.SCHEDULED },
      }),
      db.contentCalendarItem.count({
        where: { status: ContentCalendarStatus.ARCHIVED },
      }),
    ]);

  const proposalBySource = new Map(
    proposals.map((proposal) => [proposal.sourceReference, proposal]),
  );
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) => formatLocalizedDate(value, locale);
  const scheduledDate = (value: Date, timezone: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(value);

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
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <Link href={localizeHref(locale, '/ai-operator')}>
                {copy.aiQueue}
              </Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="metric-grid" aria-label={copy.lifecycle}>
            <article>
              <span>{copy.statusLabel.DRAFT}</span>
              <strong>{number(draftCount)}</strong>
            </article>
            <article>
              <span>{copy.statusLabel.READY}</span>
              <strong>{number(readyCount)}</strong>
            </article>
            <article>
              <span>{copy.statusLabel.SCHEDULED}</span>
              <strong>{number(scheduledCount)}</strong>
            </article>
            <article>
              <span>{copy.statusLabel.ARCHIVED}</span>
              <strong>{number(archivedCount)}</strong>
            </article>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.createTitle}</h2>
                <p>{copy.createIntro}</p>
              </div>
            </div>
            <form action={createContentCalendarItemAction} className={styles.form}>
              <div className={styles.grid}>
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>{copy.titleLabel}</span>
                  <input type="text" name="title" maxLength={160} required />
                </label>
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>{copy.captionLabel}</span>
                  <textarea name="caption" rows={5} maxLength={5000} required />
                </label>
                <label className={styles.field}>
                  <span>{copy.platformLabel}</span>
                  <select name="platform" defaultValue="INSTAGRAM">
                    <option value="INSTAGRAM">{copy.platformName.INSTAGRAM}</option>
                    <option value="FACEBOOK">{copy.platformName.FACEBOOK}</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>{copy.accountRefLabel}</span>
                  <input type="text" name="accountRef" maxLength={255} required />
                </label>
                <label className={styles.field}>
                  <span>{copy.formatFieldLabel}</span>
                  <select name="format" defaultValue="REEL">
                    {Object.entries(copy.formatName).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>{copy.assetReferenceLabel}</span>
                  <input type="text" name="assetReference" maxLength={1000} />
                </label>
                <label className={styles.field}>
                  <span>{copy.scheduledUtcLabel}</span>
                  <input type="datetime-local" name="scheduledUtc" />
                </label>
                <label className={styles.field}>
                  <span>{copy.timezoneLabel}</span>
                  <input
                    type="text"
                    name="timezone"
                    maxLength={100}
                    placeholder="Africa/Algiers"
                  />
                </label>
              </div>
              <small>{copy.scheduleHelp}</small>
              <button type="submit">{copy.create}</button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.recentTitle}</h2>
                <p>{copy.recentIntro}</p>
              </div>
              <span>{number(items.length)}</span>
            </div>

            {items.length ? (
              <div className="compact-list">
                {items.map((item) => {
                  const sourceReference = `${item.id}:r${item.revision}`;
                  const proposal = proposalBySource.get(sourceReference);
                  const canPropose =
                    item.status === ContentCalendarStatus.READY ||
                    item.status === ContentCalendarStatus.SCHEDULED;
                  const nextStatuses = transitions[item.status].filter(
                    (status) =>
                      status !== ContentCalendarStatus.SCHEDULED ||
                      Boolean(item.scheduledFor && item.timezone),
                  );

                  return (
                    <article key={item.id} style={{ alignItems: 'start' }}>
                      <div className={styles.itemBody}>
                        <div className={styles.itemHeader}>
                          <div>
                            <h3 dir="auto">{item.title}</h3>
                            <div className={styles.itemMeta}>
                              <span className="data-status">
                                {copy.statusLabel[item.status]}
                              </span>
                              <span>
                                {copy.revision}: {number(item.revision)}
                              </span>
                              <span>{copy.platformName[item.platform]}</span>
                              <span>{copy.formatName[item.format]}</span>
                            </div>
                          </div>
                        </div>

                        <p className={styles.caption} dir="auto">
                          {item.caption}
                        </p>
                        <p dir="auto">
                          {copy.accountRefLabel}: {item.accountRef}
                        </p>
                        {item.assetReference ? (
                          <p dir="auto">
                            {copy.assetReferenceLabel}: {item.assetReference}
                          </p>
                        ) : null}
                        <p>
                          {copy.schedule}:{' '}
                          {item.scheduledFor && item.timezone
                            ? `${scheduledDate(item.scheduledFor, item.timezone)} · ${item.timezone}`
                            : copy.unscheduled}
                        </p>
                        <p dir="auto">
                          {copy.created}: {date(item.createdAt)} {copy.by}{' '}
                          {actorLabel(item.createdBy)} · {copy.updated}:{' '}
                          {date(item.updatedAt)} {copy.by}{' '}
                          {actorLabel(item.updatedBy)}
                        </p>

                        {item.status !== ContentCalendarStatus.ARCHIVED ? (
                          <details>
                            <summary>{copy.edit}</summary>
                            <form
                              action={updateContentCalendarItemAction}
                              className={styles.form}
                            >
                              <input type="hidden" name="itemId" value={item.id} />
                              <input
                                type="hidden"
                                name="revision"
                                value={item.revision}
                              />
                              <div className={styles.grid}>
                                <label className={`${styles.field} ${styles.wide}`}>
                                  <span>{copy.titleLabel}</span>
                                  <input
                                    type="text"
                                    name="title"
                                    defaultValue={item.title}
                                    maxLength={160}
                                    required
                                  />
                                </label>
                                <label className={`${styles.field} ${styles.wide}`}>
                                  <span>{copy.captionLabel}</span>
                                  <textarea
                                    name="caption"
                                    defaultValue={item.caption}
                                    rows={5}
                                    maxLength={5000}
                                    required
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>{copy.platformLabel}</span>
                                  <select name="platform" defaultValue={item.platform}>
                                    <option value="INSTAGRAM">
                                      {copy.platformName.INSTAGRAM}
                                    </option>
                                    <option value="FACEBOOK">
                                      {copy.platformName.FACEBOOK}
                                    </option>
                                  </select>
                                </label>
                                <label className={styles.field}>
                                  <span>{copy.accountRefLabel}</span>
                                  <input
                                    type="text"
                                    name="accountRef"
                                    defaultValue={item.accountRef}
                                    maxLength={255}
                                    required
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>{copy.formatFieldLabel}</span>
                                  <select name="format" defaultValue={item.format}>
                                    {Object.entries(copy.formatName).map(
                                      ([value, label]) => (
                                        <option value={value} key={value}>
                                          {label}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                </label>
                                <label className={styles.field}>
                                  <span>{copy.assetReferenceLabel}</span>
                                  <input
                                    type="text"
                                    name="assetReference"
                                    defaultValue={item.assetReference ?? ''}
                                    maxLength={1000}
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>{copy.scheduledUtcLabel}</span>
                                  <input
                                    type="datetime-local"
                                    name="scheduledUtc"
                                    defaultValue={
                                      item.scheduledFor
                                        ? item.scheduledFor.toISOString().slice(0, 16)
                                        : ''
                                    }
                                  />
                                </label>
                                <label className={styles.field}>
                                  <span>{copy.timezoneLabel}</span>
                                  <input
                                    type="text"
                                    name="timezone"
                                    defaultValue={item.timezone ?? ''}
                                    maxLength={100}
                                  />
                                </label>
                              </div>
                              <small>{copy.scheduleHelp}</small>
                              <button type="submit">{copy.save}</button>
                            </form>
                          </details>
                        ) : null}

                        {nextStatuses.length ? (
                          <div className={styles.actions}>
                            <span>{copy.moveTo}:</span>
                            {nextStatuses.map((status) => (
                              <form
                                action={transitionContentCalendarStatusAction}
                                className={styles.lifecycleForm}
                                key={status}
                              >
                                <input
                                  type="hidden"
                                  name="itemId"
                                  value={item.id}
                                />
                                <input
                                  type="hidden"
                                  name="revision"
                                  value={item.revision}
                                />
                                <input
                                  type="hidden"
                                  name="toStatus"
                                  value={status}
                                />
                                <button type="submit">
                                  {copy.statusLabel[status]}
                                </button>
                              </form>
                            ))}
                          </div>
                        ) : null}

                        <section aria-label={copy.proposal}>
                          <h4>{copy.proposal}</h4>
                          <p>{copy.proposalHelp}</p>
                          {proposal ? (
                            <p>
                              {copy.proposalExists}{' '}
                              <Link href={localizeHref(locale, '/ai-operator')}>
                                {copy.aiQueue}
                              </Link>{' '}
                              · {proposal.status}
                            </p>
                          ) : canPropose ? (
                            <form action={queueContentCalendarPublishProposalAction}>
                              <input
                                type="hidden"
                                name="itemId"
                                value={item.id}
                              />
                              <input
                                type="hidden"
                                name="revision"
                                value={item.revision}
                              />
                              <button type="submit">{copy.proposePublish}</button>
                            </form>
                          ) : null}
                        </section>

                        <details>
                          <summary>{copy.auditHistory}</summary>
                          <div className={styles.auditList}>
                            {item.events.map((event) => (
                              <div className={styles.auditItem} key={event.id}>
                                <span>
                                  {event.eventType} · {event.fromStatus ?? '—'} →{' '}
                                  {event.toStatus} · r{event.fromRevision ?? '—'} → r
                                  {event.toRevision}
                                </span>
                                <span dir="auto">
                                  {date(event.occurredAt)} ·{' '}
                                  {actorLabel(event.actor)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="admin-empty">{copy.noItems}</p>
            )}
          </section>

          <section className="admin-panel">
            <p className={styles.boundary}>{copy.noExternalPublish}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
