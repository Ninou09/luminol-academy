import { requirePlatformPermission } from '@luminol/auth';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../../components/admin-language-switcher';
import { getAdminEnumLabel } from '../../../lib/admin-localization';
import { formatSessionDateTimeInput } from '../../../lib/cohort-session-operations';
import { getCohortOperationsCopy } from '../../../lib/cohort-operations-localization';
import { getCohortOperationsDashboard } from '../../../lib/cohort-operations.server';
import { getAdminRequestLocale } from '../../../lib/request-locale';
import {
  cancelCohortSession,
  createCohortSession,
  rescheduleCohortSession,
} from '../session-actions';

const DEFAULT_TIME_ZONE = 'Africa/Algiers';

export default async function CohortSessionOperationsPage() {
  await requirePlatformPermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getCohortOperationsCopy(locale);
  const common = getCommonDictionary(locale);
  const dashboard = await getCohortOperationsDashboard();
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const enumLabel = (value: string) => getAdminEnumLabel(locale, value);
  const date = (value: Date, timeZone: string) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    });

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
              <h1>{copy.sessions}</h1>
              <p>{copy.sessionNotice}</p>
            </div>
            <div className="admin-account">
              <Link href={localizeHref(locale, '/cohorts')}>
                {copy.cohortsTitle}
              </Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          {dashboard.cohorts.map((cohort) => {
            const mutable =
              cohort.status === 'PLANNED' || cohort.status === 'ACTIVE';

            return (
              <section className="admin-panel" key={cohort.id}>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">{enumLabel(cohort.status)}</p>
                    <h2 dir="auto">{cohort.name}</h2>
                    <p dir="auto">{cohort.course.title}</p>
                  </div>
                  <span>
                    {copy.sessions}: {number(cohort._count.sessions)}
                  </span>
                </div>

                {cohort.sessions.length === 0 ? (
                  <p className="admin-empty">{copy.noSessions}</p>
                ) : (
                  <div className="data-list">
                    {cohort.sessions.map((session) => (
                      <article key={session.id}>
                        <div>
                          <h3 dir="auto">{session.title || copy.sessions}</h3>
                          <p>
                            {enumLabel(session.status)} ·{' '}
                            {date(session.startsAt, session.timeZone)} —{' '}
                            {date(session.endsAt, session.timeZone)} ·{' '}
                            {session.timeZone}
                          </p>
                          <small>
                            {copy.attendanceRecords}:{' '}
                            {number(session._count.attendance)}
                          </small>
                        </div>

                        {mutable && session.status === 'SCHEDULED' ? (
                          <div>
                            <form
                              action={rescheduleCohortSession}
                              className="status-form"
                            >
                              <input
                                type="hidden"
                                name="cohortId"
                                value={cohort.id}
                              />
                              <input
                                type="hidden"
                                name="sessionId"
                                value={session.id}
                              />
                              <label>
                                <span>{copy.sessionTitle}</span>
                                <input
                                  name="title"
                                  maxLength={160}
                                  defaultValue={session.title ?? ''}
                                />
                              </label>
                              <label>
                                <span>{copy.startsAt}</span>
                                <input
                                  name="startsAt"
                                  type="datetime-local"
                                  required
                                  defaultValue={formatSessionDateTimeInput(
                                    session.startsAt,
                                    session.timeZone,
                                  )}
                                />
                              </label>
                              <label>
                                <span>{copy.endsAt}</span>
                                <input
                                  name="endsAt"
                                  type="datetime-local"
                                  required
                                  defaultValue={formatSessionDateTimeInput(
                                    session.endsAt,
                                    session.timeZone,
                                  )}
                                />
                              </label>
                              <label>
                                <span>{copy.timeZone}</span>
                                <input
                                  name="timeZone"
                                  maxLength={100}
                                  required
                                  defaultValue={session.timeZone}
                                />
                              </label>
                              <button type="submit">
                                {copy.rescheduleSession}
                              </button>
                            </form>

                            {session._count.attendance === 0 ? (
                              <form action={cancelCohortSession}>
                                <input
                                  type="hidden"
                                  name="cohortId"
                                  value={cohort.id}
                                />
                                <input
                                  type="hidden"
                                  name="sessionId"
                                  value={session.id}
                                />
                                <button type="submit">
                                  {copy.cancelSession}
                                </button>
                              </form>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}

                {mutable ? (
                  <form action={createCohortSession} className="status-form">
                    <input type="hidden" name="cohortId" value={cohort.id} />
                    <label>
                      <span>{copy.sessionTitle}</span>
                      <input name="title" maxLength={160} />
                    </label>
                    <label>
                      <span>{copy.startsAt}</span>
                      <input name="startsAt" type="datetime-local" required />
                    </label>
                    <label>
                      <span>{copy.endsAt}</span>
                      <input name="endsAt" type="datetime-local" required />
                    </label>
                    <label>
                      <span>{copy.timeZone}</span>
                      <input
                        name="timeZone"
                        maxLength={100}
                        required
                        defaultValue={DEFAULT_TIME_ZONE}
                      />
                    </label>
                    <button type="submit">{copy.createSession}</button>
                  </form>
                ) : null}
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
