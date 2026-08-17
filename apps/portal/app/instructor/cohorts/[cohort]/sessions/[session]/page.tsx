import { formatLocalizedDate, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../../../../../components/portal-header';
import { getInstructorAttendanceCopy } from '../../../../../../lib/instructor-attendance-localization';
import { getInstructorCohortCopy } from '../../../../../../lib/instructor-cohort-localization';
import { getAuthorizedInstructorSessionAttendanceView } from '../../../../../../lib/instructor-cohort.server';
import { getPortalRequestLocale } from '../../../../../../lib/request-locale';
import { recordInstructorAttendance } from '../../../../attendance-actions';

type InstructorSessionAttendancePageProps = {
  params: Promise<{ cohort: string; session: string }>;
};

function displayLearnerName(
  firstName: string | null,
  lastName: string | null,
  fallback: string,
) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || fallback;
}

export default async function InstructorSessionAttendancePage({
  params,
}: InstructorSessionAttendancePageProps) {
  const { cohort: cohortId, session: sessionId } = await params;
  const locale = await getPortalRequestLocale();
  const copy = getInstructorAttendanceCopy(locale);
  const cohortCopy = getInstructorCohortCopy(locale);
  const view = await getAuthorizedInstructorSessionAttendanceView(
    cohortId,
    sessionId,
  );

  if (!view) notFound();

  const dateTime = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: view.session.timeZone,
    });
  const canMutate =
    view.assignmentRole !== 'REVIEWER' && view.session.startsAt <= new Date();
  const backHref = localizeHref(
    locale,
    `/instructor/cohorts/${view.cohort.id}`,
  );

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section
          className="dashboard-intro"
          aria-labelledby="instructor-attendance-title"
        >
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="instructor-attendance-title" dir="auto">
              {view.session.title || copy.title}
            </h1>
            <p dir="auto">{view.cohort.name}</p>
            <Link href={backHref}>{copy.back}</Link>
          </div>
        </section>

        <section className="summary-grid" aria-label={copy.title}>
          <article>
            <span>{copy.course}</span>
            <strong dir="auto">{view.cohort.courseTitle}</strong>
          </article>
          <article>
            <span>{copy.role}</span>
            <strong>{cohortCopy.roles[view.assignmentRole]}</strong>
          </article>
          <article>
            <span>{copy.sessionStatus}</span>
            <strong>{copy.sessionStatuses[view.session.status]}</strong>
          </article>
          <article>
            <span>{copy.timeZone}</span>
            <strong>{view.session.timeZone}</strong>
          </article>
        </section>

        <section className="dashboard-section" aria-labelledby="session-time-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.session}</p>
              <h2 id="session-time-title">{copy.session}</h2>
            </div>
          </div>
          <p>
            {copy.starts}: {dateTime(view.session.startsAt)} · {copy.ends}:{' '}
            {dateTime(view.session.endsAt)}
          </p>
        </section>

        {view.assignmentRole === 'REVIEWER' ? (
          <section className="dashboard-section" aria-labelledby="readonly-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.attendance}</p>
                <h2 id="readonly-title">{copy.readonlyTitle}</h2>
              </div>
            </div>
            <p>{copy.readonlyBody}</p>
          </section>
        ) : view.session.startsAt > new Date() ? (
          <section className="dashboard-section">
            <p>{copy.futureSession}</p>
          </section>
        ) : null}

        <section className="dashboard-section" aria-labelledby="attendance-roster-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.attendance}</p>
              <h2 id="attendance-roster-title">{copy.roster}</h2>
            </div>
          </div>

          {view.learners.length > 0 ? (
            <div className="course-grid">
              {view.learners.map((learner) => (
                <article className="course-card" key={learner.cohortEnrollmentId}>
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
                        <dt>{copy.currentAttendance}</dt>
                        <dd>
                          {learner.attendanceStatus
                            ? copy.statusLabels[learner.attendanceStatus]
                            : copy.notRecorded}
                        </dd>
                      </div>
                      {learner.attendanceRecordedAt ? (
                        <div>
                          <dt>{copy.recordedAt}</dt>
                          <dd>{dateTime(learner.attendanceRecordedAt)}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {canMutate ? (
                      <form action={recordInstructorAttendance}>
                        <input type="hidden" name="cohortId" value={view.cohort.id} />
                        <input type="hidden" name="sessionId" value={view.session.id} />
                        <input
                          type="hidden"
                          name="cohortEnrollmentId"
                          value={learner.cohortEnrollmentId}
                        />
                        <label>
                          <span>{copy.attendance}</span>
                          <select
                            name="status"
                            defaultValue={learner.attendanceStatus ?? 'PRESENT'}
                          >
                            {Object.entries(copy.statusLabels).map(
                              ([status, label]) => (
                                <option key={status} value={status}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <button type="submit">{copy.save}</button>
                      </form>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{copy.noEligibleLearners}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
