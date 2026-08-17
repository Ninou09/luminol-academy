import {
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../../../components/portal-header';
import { getInstructorAttendanceCopy } from '../../../../lib/instructor-attendance-localization';
import { getInstructorCohortAnalyticsCopy } from '../../../../lib/instructor-cohort-analytics-localization';
import { getInstructorCohortCopy } from '../../../../lib/instructor-cohort-localization';
import { getAuthorizedInstructorCohortTeachingView } from '../../../../lib/instructor-cohort.server';
import { getPortalRequestLocale } from '../../../../lib/request-locale';

type InstructorCohortPageProps = {
  params: Promise<{ cohort: string }>;
};

function displayLearnerName(
  firstName: string | null,
  lastName: string | null,
  fallback: string,
) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || fallback;
}

export default async function InstructorCohortPage({
  params,
}: InstructorCohortPageProps) {
  const { cohort: cohortId } = await params;
  const locale = await getPortalRequestLocale();
  const copy = getInstructorCohortCopy(locale);
  const attendanceCopy = getInstructorAttendanceCopy(locale);
  const analyticsCopy = getInstructorCohortAnalyticsCopy(locale);
  const view = await getAuthorizedInstructorCohortTeachingView(cohortId);

  if (!view) notFound();

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const sessionDate = (value: Date, timeZone: string) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    });
  const schedule = view.cohort.startsAt
    ? `${copy.starts}: ${date(view.cohort.startsAt)}${
        view.cohort.endsAt ? ` · ${copy.ends}: ${date(view.cohort.endsAt)}` : ''
      }`
    : copy.unscheduled;

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section
          className="dashboard-intro"
          aria-labelledby="instructor-cohort-title"
        >
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="instructor-cohort-title" dir="auto">
              {view.cohort.name}
            </h1>
            <p>{copy.intro}</p>
            <Link href={localizeHref(locale, '/instructor')}>{copy.back}</Link>
            {' · '}
            <Link
              href={localizeHref(
                locale,
                `/instructor/cohorts/${view.cohort.id}/analytics`,
              )}
            >
              {analyticsCopy.title}
            </Link>
          </div>
        </section>

        <section className="summary-grid" aria-label={copy.title}>
          <article>
            <span>{copy.learners}</span>
            <strong>{number(view.learners.length)}</strong>
          </article>
          <article>
            <span>{copy.assignmentRole}</span>
            <strong>{copy.roles[view.assignmentRole]}</strong>
          </article>
          <article>
            <span>{copy.cohortStatus}</span>
            <strong>{copy.cohortStatuses[view.cohort.status]}</strong>
          </article>
          <article>
            <span>{copy.course}</span>
            <strong dir="auto">{view.cohort.courseTitle}</strong>
          </article>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="cohort-schedule-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.schedule}</p>
              <h2 id="cohort-schedule-title">{copy.schedule}</h2>
            </div>
          </div>
          <p>{schedule}</p>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="cohort-sessions-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{attendanceCopy.attendance}</p>
              <h2 id="cohort-sessions-title">{attendanceCopy.sessions}</h2>
            </div>
          </div>

          {view.sessions.length > 0 ? (
            <div className="course-grid">
              {view.sessions.map((session) => (
                <article className="course-card" key={session.id}>
                  <div className="course-content">
                    <p className="eyebrow">
                      {attendanceCopy.sessionStatuses[session.status]}
                    </p>
                    <h3 dir="auto">
                      {session.title || attendanceCopy.session}
                    </h3>
                    <p>
                      {attendanceCopy.starts}:{' '}
                      {sessionDate(session.startsAt, session.timeZone)} ·{' '}
                      {attendanceCopy.ends}:{' '}
                      {sessionDate(session.endsAt, session.timeZone)}
                    </p>
                    <p>
                      {attendanceCopy.attendanceCount}:{' '}
                      {number(session.attendanceCount)}
                    </p>
                    <Link
                      className="course-link"
                      href={localizeHref(
                        locale,
                        `/instructor/cohorts/${view.cohort.id}/sessions/${session.id}`,
                      )}
                    >
                      {attendanceCopy.openAttendance}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{attendanceCopy.noSessions}</p>
            </div>
          )}
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="teaching-roster-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.learners}</p>
              <h2 id="teaching-roster-title">{copy.roster}</h2>
            </div>
          </div>

          {view.learners.length > 0 ? (
            <div className="course-grid">
              {view.learners.map((learner) => (
                <article
                  className="course-card"
                  key={learner.cohortEnrollmentId}
                >
                  <div className="course-content">
                    <p className="eyebrow">{copy.learner}</p>
                    <h3 dir="auto">
                      {displayLearnerName(
                        learner.firstName,
                        learner.lastName,
                        copy.learnerFallback,
                      )}
                    </h3>
                    <dl>
                      <div>
                        <dt>{copy.enrollmentStatus}</dt>
                        <dd>
                          {copy.enrollmentStatuses[learner.enrollmentStatus]}
                        </dd>
                      </div>
                      <div>
                        <dt>{copy.joined}</dt>
                        <dd>{date(learner.joinedAt)}</dd>
                      </div>
                      <div>
                        <dt>{copy.completedLessons}</dt>
                        <dd>{number(learner.completedLessons)}</dd>
                      </div>
                      <div>
                        <dt>{copy.inProgressLessons}</dt>
                        <dd>{number(learner.inProgressLessons)}</dd>
                      </div>
                      <div>
                        <dt>{copy.latestActivity}</dt>
                        <dd>
                          {learner.lastActivityAt
                            ? date(learner.lastActivityAt)
                            : copy.noActivity}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{copy.noLearners}</p>
            </div>
          )}
        </section>

        <section className="dashboard-section" aria-labelledby="privacy-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.privacyTitle}</p>
              <h2 id="privacy-title">{copy.privacyTitle}</h2>
            </div>
          </div>
          <p>{copy.privacyBody}</p>
        </section>
      </div>
    </main>
  );
}
