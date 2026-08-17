import {
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../../../../components/portal-header';
import { getInstructorCohortAnalyticsCopy } from '../../../../../lib/instructor-cohort-analytics-localization';
import { getAuthorizedInstructorCohortAnalytics } from '../../../../../lib/instructor-cohort-analytics.server';
import { getPortalRequestLocale } from '../../../../../lib/request-locale';

type InstructorCohortAnalyticsPageProps = {
  params: Promise<{ cohort: string }>;
};

export default async function InstructorCohortAnalyticsPage({
  params,
}: InstructorCohortAnalyticsPageProps) {
  const { cohort: cohortId } = await params;
  const locale = await getPortalRequestLocale();
  const copy = getInstructorCohortAnalyticsCopy(locale);
  const view = await getAuthorizedInstructorCohortAnalytics(cohortId);

  if (!view) notFound();

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const cohortHref = localizeHref(locale, `/instructor/cohorts/${view.cohort.id}`);

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section
          className="dashboard-intro"
          aria-labelledby="instructor-cohort-analytics-title"
        >
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="instructor-cohort-analytics-title" dir="auto">
              {view.cohort.name}
            </h1>
            <p>{copy.intro}</p>
            <Link href={cohortHref}>{copy.back}</Link>
          </div>
        </section>

        {view.analytics.state === 'suppressed' ? (
          <section
            className="dashboard-section"
            aria-labelledby="analytics-suppressed-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.privacyTitle}</p>
                <h2 id="analytics-suppressed-title">
                  {copy.suppressedTitle}
                </h2>
              </div>
            </div>
            <div className="empty-state">
              <p>
                {copy.suppressedBody(view.analytics.minimumGroupSize)}
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className="summary-grid" aria-label={copy.title}>
              <article>
                <span>{copy.participantCount}</span>
                <strong>{number(view.analytics.value.participantCount)}</strong>
              </article>
              <article>
                <span>{copy.completion}</span>
                <strong>
                  {number(view.analytics.value.completionPercent)}%
                </strong>
              </article>
              <article>
                <span>{copy.recentActivity}</span>
                <strong>
                  {number(view.analytics.value.recentActivityPercent)}%
                </strong>
              </article>
              <article>
                <span>{copy.activeCertificates}</span>
                <strong>
                  {number(view.analytics.value.certificatePercent)}%
                </strong>
              </article>
            </section>

            <section
              className="dashboard-section"
              aria-labelledby="cohort-analytics-details-title"
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{copy.title}</p>
                  <h2 id="cohort-analytics-details-title">{copy.title}</h2>
                </div>
              </div>
              <div className="course-grid">
                <article className="course-card">
                  <div className="course-content">
                    <h3>{copy.completion}</h3>
                    <dl>
                      <div>
                        <dt>{copy.completedEnrollments}</dt>
                        <dd>
                          {number(view.analytics.value.completedEnrollments)}
                        </dd>
                      </div>
                      <div>
                        <dt>{copy.percent}</dt>
                        <dd>
                          {number(view.analytics.value.completionPercent)}%
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>

                <article className="course-card">
                  <div className="course-content">
                    <h3>{copy.recentActivity}</h3>
                    <p>
                      {copy.recentActivityBody(
                        view.analytics.value.activityWindowDays,
                      )}
                    </p>
                    <dl>
                      <div>
                        <dt>{copy.participantCount}</dt>
                        <dd>
                          {number(view.analytics.value.recentlyActiveLearners)}
                        </dd>
                      </div>
                      <div>
                        <dt>{copy.percent}</dt>
                        <dd>
                          {number(view.analytics.value.recentActivityPercent)}%
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>

                <article className="course-card">
                  <div className="course-content">
                    <h3>{copy.activeCertificates}</h3>
                    <dl>
                      <div>
                        <dt>{copy.activeCertificates}</dt>
                        <dd>
                          {number(view.analytics.value.activeCertificates)}
                        </dd>
                      </div>
                      <div>
                        <dt>{copy.percent}</dt>
                        <dd>
                          {number(view.analytics.value.certificatePercent)}%
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>

                <article className="course-card">
                  <div className="course-content">
                    <h3>{copy.reviewWorkload}</h3>
                    <dl>
                      <div>
                        <dt>{copy.reviewRequiredAttempts}</dt>
                        <dd>
                          {number(view.analytics.value.reviewRequiredAttempts)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </div>
            </section>
          </>
        )}

        <section
          className="dashboard-section"
          aria-labelledby="analytics-source-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.sourceTitle}</p>
              <h2 id="analytics-source-title">{copy.sourceTitle}</h2>
            </div>
          </div>
          <p>{copy.sourceBody}</p>
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
