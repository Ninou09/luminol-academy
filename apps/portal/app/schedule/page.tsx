import { formatLocalizedDate, localizeHref } from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../../components/portal-header';
import { getLearnerSessionScheduleCopy } from '../../lib/learner-session-schedule-localization';
import { getLearnerSessionSchedule } from '../../lib/learner-session-schedule.server';
import type { LearnerSessionScheduleItem } from '../../lib/learner-session-schedule';
import { getPortalRequestLocale } from '../../lib/request-locale';

export default async function LearnerSessionSchedulePage() {
  const locale = await getPortalRequestLocale();
  const copy = getLearnerSessionScheduleCopy(locale);
  const schedule = await getLearnerSessionSchedule();

  const dateTime = (value: Date, timeZone: string) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    });

  const renderSessions = (sessions: readonly LearnerSessionScheduleItem[]) =>
    sessions.length > 0 ? (
      <div className="course-grid">
        {sessions.map((session) => (
          <article className="course-card" key={session.id}>
            <div className="course-content">
              <div className="course-meta">
                <span>{copy.sessionStatuses[session.status]}</span>
                <span>{session.timeZone}</span>
              </div>
              <h3 dir="auto">{session.title || copy.session}</h3>
              <p dir="auto">
                {copy.programme}: {session.course.title}
              </p>
              <p dir="auto">
                {copy.cohort}: {session.cohort.name}
              </p>
              <dl>
                <div>
                  <dt>{copy.starts}</dt>
                  <dd>{dateTime(session.startsAt, session.timeZone)}</dd>
                </div>
                <div>
                  <dt>{copy.ends}</dt>
                  <dd>{dateTime(session.endsAt, session.timeZone)}</dd>
                </div>
                <div>
                  <dt>{copy.attendance}</dt>
                  <dd>
                    {session.attendanceStatus
                      ? copy.attendanceLabels[session.attendanceStatus]
                      : copy.notRecorded}
                  </dd>
                </div>
                {session.attendanceRecordedAt ? (
                  <div>
                    <dt>{copy.attendanceRecordedAt}</dt>
                    <dd>
                      {dateTime(session.attendanceRecordedAt, session.timeZone)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </article>
        ))}
      </div>
    ) : null;

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="schedule-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="schedule-title">{copy.title}</h1>
            <p>{copy.intro}</p>
            <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="upcoming-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.status}</p>
              <h2 id="upcoming-title">{copy.upcoming}</h2>
            </div>
          </div>
          {schedule.upcoming.length > 0 ? (
            renderSessions(schedule.upcoming)
          ) : (
            <div className="empty-state">
              <p>{copy.noUpcoming}</p>
            </div>
          )}
        </section>

        <section className="dashboard-section" aria-labelledby="past-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.attendance}</p>
              <h2 id="past-title">{copy.past}</h2>
            </div>
          </div>
          {schedule.past.length > 0 ? (
            renderSessions(schedule.past)
          ) : (
            <div className="empty-state">
              <p>{copy.noPast}</p>
            </div>
          )}
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="schedule-privacy-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.privacyTitle}</p>
              <h2 id="schedule-privacy-title">{copy.privacyTitle}</h2>
            </div>
          </div>
          <p>{copy.privacyBody}</p>
          <p>{copy.boundedNotice}</p>
        </section>
      </div>
    </main>
  );
}
