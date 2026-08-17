import {
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../components/portal-header';
import { getInstructorWorkspaceCopy } from '../../lib/instructor-workspace-localization';
import { getAuthorizedInstructorWorkspace } from '../../lib/instructor-workspace.server';
import { getPortalRequestLocale } from '../../lib/request-locale';

export default async function InstructorWorkspacePage() {
  const locale = await getPortalRequestLocale();
  const copy = getInstructorWorkspaceCopy(locale);
  const workspace = await getAuthorizedInstructorWorkspace();

  if (workspace.cohorts.length === 0) notFound();

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const activeCohorts = workspace.cohorts.filter(
    ({ status }) => status === 'ACTIVE',
  ).length;
  const plannedCohorts = workspace.cohorts.filter(
    ({ status }) => status === 'PLANNED',
  ).length;

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section
          className="dashboard-intro"
          aria-labelledby="instructor-workspace-title"
        >
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="instructor-workspace-title">{copy.title}</h1>
            <p>{copy.intro}</p>
          </div>
        </section>

        <section className="summary-grid" aria-label={copy.assignedCohorts}>
          <article>
            <span>{copy.assignedCohorts}</span>
            <strong>{number(workspace.cohorts.length)}</strong>
          </article>
          <article>
            <span>{copy.activeCohorts}</span>
            <strong>{number(activeCohorts)}</strong>
          </article>
          <article>
            <span>{copy.plannedCohorts}</span>
            <strong>{number(plannedCohorts)}</strong>
          </article>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="assigned-cohorts-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h2 id="assigned-cohorts-title">{copy.assignedCohorts}</h2>
            </div>
          </div>

          <div className="course-grid">
            {workspace.cohorts.map((cohort) => {
              const schedule = cohort.startsAt
                ? `${copy.starts}: ${date(cohort.startsAt)}${
                    cohort.endsAt
                      ? ` · ${copy.ends}: ${date(cohort.endsAt)}`
                      : ''
                  }`
                : copy.unscheduled;

              return (
                <article className="course-card" key={cohort.cohortId}>
                  <div className="course-content">
                    <p className="eyebrow">{copy.course}</p>
                    <h3 dir="auto">{cohort.name}</h3>
                    <p dir="auto">{cohort.courseTitle}</p>
                    <dl>
                      <div>
                        <dt>{copy.role}</dt>
                        <dd>{copy.roles[cohort.role]}</dd>
                      </div>
                      <div>
                        <dt>{copy.status}</dt>
                        <dd>{copy.statuses[cohort.status]}</dd>
                      </div>
                      <div>
                        <dt>{copy.schedule}</dt>
                        <dd>{schedule}</dd>
                      </div>
                    </dl>
                    <Link
                      className="course-link"
                      href={localizeHref(
                        locale,
                        `/instructor/cohorts/${cohort.cohortId}`,
                      )}
                    >
                      {copy.openCohort}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="privacy-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.privacyTitle}</p>
              <h2 id="privacy-title">{copy.privacyTitle}</h2>
            </div>
          </div>
          <div className="empty-state">
            <div>
              <p>{copy.privacyBody}</p>
            </div>
            <Link className="course-link" href={localizeHref(locale, '/')}>
              {copy.assignedCohorts}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
