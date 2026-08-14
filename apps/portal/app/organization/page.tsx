import { requireUser } from '@luminol/auth';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../components/portal-header';
import { getOrganizationManagerCopy } from '../../lib/organization-manager-localization';
import { getOrganizationManagerDashboard } from '../../lib/organization-manager.server';
import { getPortalRequestLocale } from '../../lib/request-locale';

type SearchValue = string | string[] | undefined;

type OrganizationManagerPageProps = {
  searchParams: Promise<Record<string, SearchValue>>;
};

function firstSearchParam(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function workspaceHref(
  locale: 'ar' | 'fr' | 'en',
  state: {
    organizationId?: string;
    organizationPage?: number;
    teamId?: string;
    rosterPage?: number;
    teamPage?: number;
    coursePage?: number;
  },
) {
  const params = new URLSearchParams();
  if (state.organizationId) params.set('organization', state.organizationId);
  if ((state.organizationPage ?? 1) > 1)
    params.set('organizationPage', String(state.organizationPage));
  if (state.teamId) params.set('team', state.teamId);
  if ((state.rosterPage ?? 1) > 1)
    params.set('rosterPage', String(state.rosterPage));
  if ((state.teamPage ?? 1) > 1)
    params.set('teamPage', String(state.teamPage));
  if ((state.coursePage ?? 1) > 1)
    params.set('coursePage', String(state.coursePage));

  const pathname = localizeHref(locale, '/organization');
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function personLabel(person: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  return [person.firstName, person.lastName].filter(Boolean).join(' ') || person.email;
}

export default async function OrganizationManagerPage({
  searchParams,
}: OrganizationManagerPageProps) {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getOrganizationManagerCopy(locale);
  const params = await searchParams;
  const dashboard = await getOrganizationManagerDashboard(user.id, {
    organizationId: firstSearchParam(params.organization),
    organizationPage: firstSearchParam(params.organizationPage) ?? 1,
    teamId: firstSearchParam(params.team),
    rosterPage: firstSearchParam(params.rosterPage) ?? 1,
    teamPage: firstSearchParam(params.teamPage) ?? 1,
    coursePage: firstSearchParam(params.coursePage) ?? 1,
  });

  if (!dashboard) notFound();

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) => formatLocalizedDate(value, locale);
  const organization = dashboard.membership.organization;
  const baseState = {
    organizationId: organization.id,
    organizationPage: dashboard.pagination.organizations.page,
    teamId: dashboard.selectedTeam?.id,
    rosterPage: dashboard.pagination.roster.page,
    teamPage: dashboard.pagination.teams.page,
    coursePage: dashboard.pagination.courses.page,
  };

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="organization-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="organization-title">{copy.title}</h1>
            <p>{copy.intro}</p>
          </div>
          <div>
            <strong dir="auto">{organization.name}</strong>
            <p>
              {copy.organizationStatus}:{' '}
              {copy.statusLabels[organization.status] ?? organization.status}
              {' · '}
              {copy.yourRole}:{' '}
              {copy.roleLabels[dashboard.membership.role] ??
                dashboard.membership.role}
            </p>
          </div>
        </section>

        <section className="summary-grid" aria-label={copy.seatUtilization}>
          <article>
            <span>{copy.seatLimit}</span>
            <strong>{number(dashboard.seatUtilization.seatLimit)}</strong>
          </article>
          <article>
            <span>{copy.allocatedSeats}</span>
            <strong>{number(dashboard.seatUtilization.allocatedSeats)}</strong>
          </article>
          <article>
            <span>{copy.availableSeats}</span>
            <strong>{number(dashboard.seatUtilization.availableSeats)}</strong>
          </article>
          <article>
            <span>{copy.completion}</span>
            <strong>{number(dashboard.progress.completionPercent)}%</strong>
          </article>
        </section>

        <section className="dashboard-section" aria-labelledby="seat-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.seatUtilization}</p>
              <h2 id="seat-title">{copy.seatUtilization}</h2>
            </div>
          </div>
          <div className="summary-grid">
            <article>
              <span>{copy.invitedSeats}</span>
              <strong>{number(dashboard.seatUtilization.invitedSeats)}</strong>
            </article>
            <article>
              <span>{copy.activeSeats}</span>
              <strong>{number(dashboard.seatUtilization.activeSeats)}</strong>
            </article>
            <article>
              <span>{copy.completedSeats}</span>
              <strong>{number(dashboard.seatUtilization.completedSeats)}</strong>
            </article>
            <article>
              <span>{copy.sponsoredProgress}</span>
              <strong>{number(dashboard.progress.assignmentCount)}</strong>
              <small>
                {number(dashboard.progress.completedAssignments)}{' '}
                {copy.completedAssignments}
              </small>
            </article>
          </div>
        </section>

        {dashboard.pagination.organizations.total > 1 ? (
          <section
            className="dashboard-section"
            aria-labelledby="managed-organizations-title"
          >
            <div className="section-heading">
              <h2 id="managed-organizations-title">{copy.organizations}</h2>
              <span>
                {copy.page} {number(dashboard.pagination.organizations.page)}{' '}
                {copy.of} {number(dashboard.pagination.organizations.pageCount)}
              </span>
            </div>
            <div className="course-grid">
              {dashboard.organizations.map((membership) => (
                <article className="course-card" key={membership.id}>
                  <div className="course-content">
                    <h3 dir="auto">{membership.organization.name}</h3>
                    <p>
                      {copy.roleLabels[membership.role] ?? membership.role}
                      {' · '}
                      {copy.statusLabels[membership.organization.status] ??
                        membership.organization.status}
                    </p>
                    <Link
                      href={workspaceHref(locale, {
                        organizationId: membership.organizationId,
                        organizationPage:
                          dashboard.pagination.organizations.page,
                      })}
                    >
                      {membership.organizationId === organization.id
                        ? copy.roster
                        : copy.organizations}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <nav aria-label={copy.organizations}>
              {dashboard.pagination.organizations.page > 1 ? (
                <Link
                  href={workspaceHref(locale, {
                    ...baseState,
                    organizationPage:
                      dashboard.pagination.organizations.page - 1,
                  })}
                >
                  {copy.previous}
                </Link>
              ) : null}{' '}
              {dashboard.pagination.organizations.page <
              dashboard.pagination.organizations.pageCount ? (
                <Link
                  href={workspaceHref(locale, {
                    ...baseState,
                    organizationPage:
                      dashboard.pagination.organizations.page + 1,
                  })}
                >
                  {copy.next}
                </Link>
              ) : null}
            </nav>
          </section>
        ) : null}

        <section className="dashboard-section" aria-labelledby="teams-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.teams}</p>
              <h2 id="teams-title">{copy.teams}</h2>
            </div>
            <span>
              {copy.page} {number(dashboard.pagination.teams.page)} {copy.of}{' '}
              {number(dashboard.pagination.teams.pageCount)}
            </span>
          </div>
          {dashboard.teams.length > 0 ? (
            <div className="course-grid">
              {dashboard.teams.map((team) => (
                <article className="course-card" key={team.id}>
                  <div className="course-content">
                    <h3 dir="auto">{team.name}</h3>
                    <p>
                      {number(team._count.memberships)} {copy.members}
                    </p>
                    <Link
                      href={workspaceHref(locale, {
                        ...baseState,
                        teamId: team.id,
                        rosterPage: 1,
                      })}
                    >
                      {copy.filterTeam}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>{copy.noTeams}</p>
          )}
          <nav aria-label={copy.teams}>
            {dashboard.pagination.teams.page > 1 ? (
              <Link
                href={workspaceHref(locale, {
                  ...baseState,
                  teamPage: dashboard.pagination.teams.page - 1,
                })}
              >
                {copy.previous}
              </Link>
            ) : null}{' '}
            {dashboard.pagination.teams.page <
            dashboard.pagination.teams.pageCount ? (
              <Link
                href={workspaceHref(locale, {
                  ...baseState,
                  teamPage: dashboard.pagination.teams.page + 1,
                })}
              >
                {copy.next}
              </Link>
            ) : null}
          </nav>
        </section>

        <section className="dashboard-section" aria-labelledby="roster-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.roster}</p>
              <h2 id="roster-title" dir="auto">
                {dashboard.selectedTeam?.name ?? copy.allMembers}
              </h2>
            </div>
            <span>
              {number(dashboard.pagination.roster.total)} {copy.members}
            </span>
          </div>
          {dashboard.selectedTeam ? (
            <p>
              <Link
                href={workspaceHref(locale, {
                  ...baseState,
                  teamId: undefined,
                  rosterPage: 1,
                })}
              >
                {copy.allMembers}
              </Link>
            </p>
          ) : null}
          {dashboard.roster.length > 0 ? (
            <div className="course-grid">
              {dashboard.roster.map((membership) => (
                <article className="course-card" key={membership.id}>
                  <div className="course-content">
                    <h3>
                      <bdi dir="auto">{personLabel(membership.user)}</bdi>
                    </h3>
                    <p>
                      {copy.roleLabels[membership.role] ?? membership.role}
                    </p>
                    <p>
                      {copy.email}:{' '}
                      <bdi dir="ltr">{membership.user.email}</bdi>
                    </p>
                    <p>
                      {copy.joined}: {date(membership.joinedAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>{copy.noRoster}</p>
          )}
          <nav aria-label={copy.roster}>
            {dashboard.pagination.roster.page > 1 ? (
              <Link
                href={workspaceHref(locale, {
                  ...baseState,
                  rosterPage: dashboard.pagination.roster.page - 1,
                })}
              >
                {copy.previous}
              </Link>
            ) : null}{' '}
            {dashboard.pagination.roster.page <
            dashboard.pagination.roster.pageCount ? (
              <Link
                href={workspaceHref(locale, {
                  ...baseState,
                  rosterPage: dashboard.pagination.roster.page + 1,
                })}
              >
                {copy.next}
              </Link>
            ) : null}
          </nav>
        </section>

        <section className="dashboard-section" aria-labelledby="learning-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.assignedLearning}</p>
              <h2 id="learning-title">{copy.assignedLearning}</h2>
            </div>
            <span>
              {copy.page} {number(dashboard.pagination.courses.page)} {copy.of}{' '}
              {number(dashboard.pagination.courses.pageCount)}
            </span>
          </div>
          {dashboard.courses.length > 0 ? (
            <div className="course-grid">
              {dashboard.courses.map((assignment) => (
                <article className="course-card" key={assignment.id}>
                  <div className="course-content">
                    <h3 dir="auto">{assignment.course.title}</h3>
                    <p>
                      {copy.assigned}: {date(assignment.assignedAt)}
                    </p>
                    <p>
                      {copy.sponsoredLearners}:{' '}
                      {number(assignment.progress.assignmentCount)}
                    </p>
                    <p>
                      {copy.completedAssignments}:{' '}
                      {number(assignment.progress.completedAssignments)}
                    </p>
                    <strong>
                      {copy.completion}:{' '}
                      {number(assignment.progress.completionPercent)}%
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>{copy.noCourses}</p>
          )}
          <nav aria-label={copy.assignedLearning}>
            {dashboard.pagination.courses.page > 1 ? (
              <Link
                href={workspaceHref(locale, {
                  ...baseState,
                  coursePage: dashboard.pagination.courses.page - 1,
                })}
              >
                {copy.previous}
              </Link>
            ) : null}{' '}
            {dashboard.pagination.courses.page <
            dashboard.pagination.courses.pageCount ? (
              <Link
                href={workspaceHref(locale, {
                  ...baseState,
                  coursePage: dashboard.pagination.courses.page + 1,
                })}
              >
                {copy.next}
              </Link>
            ) : null}
          </nav>
        </section>

        <section className="dashboard-section" aria-label={copy.privacy}>
          <p>{copy.privacy}</p>
        </section>
      </div>
    </main>
  );
}
