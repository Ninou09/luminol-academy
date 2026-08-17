import { requireUser } from '@luminol/auth';
import { formatLocalizedNumber, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../../components/portal-header';
import { getOrganizationAnalyticsCopy } from '../../../lib/organization-analytics-localization';
import { getOrganizationManagerAnalytics } from '../../../lib/organization-analytics.server';
import { ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE } from '../../../lib/organization-analytics';
import { getPortalRequestLocale } from '../../../lib/request-locale';

type SearchValue = string | string[] | undefined;

type OrganizationAnalyticsPageProps = {
  searchParams: Promise<Record<string, SearchValue>>;
};

function firstSearchParam(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function ProgressMetrics({
  value,
  labels,
  number,
}: {
  value: {
    assignmentCount: number;
    completedAssignments: number;
    activeAssignments: number;
    completionPercent: number;
  };
  labels: ReturnType<typeof getOrganizationAnalyticsCopy>;
  number: (value: number) => string;
}) {
  return (
    <div className="summary-grid">
      <article>
        <span>{labels.assignments}</span>
        <strong>{number(value.assignmentCount)}</strong>
      </article>
      <article>
        <span>{labels.completed}</span>
        <strong>{number(value.completedAssignments)}</strong>
      </article>
      <article>
        <span>{labels.active}</span>
        <strong>{number(value.activeAssignments)}</strong>
      </article>
      <article>
        <span>{labels.completion}</span>
        <strong>{number(value.completionPercent)}%</strong>
      </article>
    </div>
  );
}

function SuppressedNotice({
  copy,
}: {
  copy: ReturnType<typeof getOrganizationAnalyticsCopy>;
}) {
  return (
    <div className="course-card">
      <div className="course-content">
        <h3>{copy.participantsProtected}</h3>
        <p>{copy.protectedBody}</p>
      </div>
    </div>
  );
}

export default async function OrganizationAnalyticsPage({
  searchParams,
}: OrganizationAnalyticsPageProps) {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getOrganizationAnalyticsCopy(locale);
  const params = await searchParams;
  const analytics = await getOrganizationManagerAnalytics(
    user.id,
    firstSearchParam(params.organization),
  );

  if (!analytics) notFound();

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const organizationHref = `${localizeHref(locale, '/organization')}?organization=${encodeURIComponent(analytics.organization.id)}`;

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section
          className="dashboard-intro"
          aria-labelledby="organization-analytics-title"
        >
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="organization-analytics-title">{copy.title}</h1>
            <p>{copy.intro}</p>
          </div>
          <div>
            <strong dir="auto">{analytics.organization.name}</strong>
            <p>
              {copy.privacyGroup}:{' '}
              {number(ORGANIZATION_ANALYTICS_MINIMUM_GROUP_SIZE)}
            </p>
            <Link href={organizationHref}>{copy.back}</Link>
          </div>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="seat-analytics-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.seatUtilization}</p>
              <h2 id="seat-analytics-title">{copy.seatUtilization}</h2>
            </div>
          </div>
          {analytics.seatUtilization.state === 'visible' ? (
            <div className="summary-grid">
              <article>
                <span>{copy.allocatedSeats}</span>
                <strong>
                  {number(analytics.seatUtilization.value.allocatedSeats)}
                </strong>
              </article>
              <article>
                <span>{copy.availableSeats}</span>
                <strong>
                  {number(analytics.seatUtilization.value.availableSeats)}
                </strong>
              </article>
              <article>
                <span>{copy.active}</span>
                <strong>
                  {number(analytics.seatUtilization.value.activeSeats)}
                </strong>
              </article>
              <article>
                <span>{copy.utilization}</span>
                <strong>
                  {number(analytics.seatUtilization.value.utilizationPercent)}%
                </strong>
              </article>
            </div>
          ) : (
            <SuppressedNotice copy={copy} />
          )}
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="learning-analytics-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.assignedLearning}</p>
              <h2 id="learning-analytics-title">{copy.assignedLearning}</h2>
            </div>
          </div>
          {analytics.assignedLearning.state === 'visible' ? (
            <ProgressMetrics
              value={analytics.assignedLearning.value}
              labels={copy}
              number={number}
            />
          ) : (
            <SuppressedNotice copy={copy} />
          )}
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="course-analytics-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.courseAnalytics}</p>
              <h2 id="course-analytics-title">{copy.courseAnalytics}</h2>
            </div>
          </div>
          {analytics.courses.length > 0 ? (
            <div className="course-grid">
              {analytics.courses.map((course) => (
                <article className="course-card" key={course.organizationCourseId}>
                  <div className="course-content">
                    <h3 dir="auto">{course.title}</h3>
                    {course.analytics.state === 'visible' ? (
                      <p>
                        {copy.assignments}:{' '}
                        {number(course.analytics.value.assignmentCount)} ·{' '}
                        {copy.completed}:{' '}
                        {number(course.analytics.value.completedAssignments)} ·{' '}
                        {copy.completion}:{' '}
                        {number(course.analytics.value.completionPercent)}%
                      </p>
                    ) : (
                      <p>
                        {copy.participantsProtected}. {copy.protectedBody}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>{copy.noCourses}</p>
          )}
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="team-analytics-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.teamAnalytics}</p>
              <h2 id="team-analytics-title">{copy.teamAnalytics}</h2>
            </div>
          </div>
          {analytics.teams.length > 0 ? (
            <div className="course-grid">
              {analytics.teams.map((team) => (
                <article className="course-card" key={team.teamId}>
                  <div className="course-content">
                    <h3 dir="auto">{team.name}</h3>
                    {team.analytics.state === 'visible' ? (
                      <p>
                        {copy.assignments}:{' '}
                        {number(team.analytics.value.assignmentCount)} ·{' '}
                        {copy.completed}:{' '}
                        {number(team.analytics.value.completedAssignments)} ·{' '}
                        {copy.completion}:{' '}
                        {number(team.analytics.value.completionPercent)}%
                      </p>
                    ) : (
                      <p>
                        {copy.participantsProtected}. {copy.protectedBody}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>{copy.noTeams}</p>
          )}
        </section>

        <section className="dashboard-section" aria-labelledby="privacy-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.privacyGroup}</p>
              <h2 id="privacy-title">{copy.privacyTitle}</h2>
            </div>
          </div>
          <p>{copy.privacyBody}</p>
        </section>
      </div>
    </main>
  );
}
