import { requirePlatformPermission } from '@luminol/auth';
import {
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import { cookies } from 'next/headers';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminEnumLabel } from '../../lib/admin-localization';
import {
  ORGANIZATION_MEMBERSHIP_ROLES,
  ORGANIZATION_SEAT_TRANSITIONS,
} from '../../lib/organization-admin';
import { getOrganizationAdminDashboard } from '../../lib/organization-admin.server';
import { getOrganizationAdminCopy } from '../../lib/organization-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  addOrganizationTeamMember,
  allocateOrganizationSeat,
  archiveOrganization,
  archiveOrganizationTeam,
  assignOrganizationCourse,
  createOrganization,
  createOrganizationTeam,
  clearOrganizationAdministrationSearch,
  deactivateOrganizationMembership,
  removeOrganizationTeamMember,
  searchOrganizationAdministration,
  transitionOrganizationSeat,
  unassignOrganizationCourse,
  updateOrganizationMembershipRole,
  upsertOrganizationMembership,
} from './actions';

function personLabel(person: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const name = [person.firstName, person.lastName].filter(Boolean).join(' ');
  return name ? `${name} · ${person.email}` : person.email;
}

type SearchValue = string | string[] | undefined;

type OrganizationsAdminPageProps = {
  searchParams: Promise<Record<string, SearchValue>>;
};

function firstSearchParam(value: SearchValue) {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function dashboardHref(
  locale: Locale,
  input: {
    organizationQuery: string;
    organizationPage: number;
    teamQuery: string;
    courseQuery: string;
  },
) {
  const params = new URLSearchParams();
  if (input.organizationQuery) params.set('q', input.organizationQuery);
  if (input.organizationPage > 1)
    params.set('page', String(input.organizationPage));
  if (input.teamQuery) params.set('team', input.teamQuery);
  if (input.courseQuery) params.set('course', input.courseQuery);
  const query = params.toString();
  const pathname = localizeHref(locale, '/organizations');
  return query ? `${pathname}?${query}` : pathname;
}

export default async function OrganizationsAdminPage({
  searchParams,
}: OrganizationsAdminPageProps) {
  await requirePlatformPermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getOrganizationAdminCopy(locale);
  const common = getCommonDictionary(locale);
  const params = await searchParams;
  const cookieStore = await cookies();
  const userQuery = (
    cookieStore.get('luminol-organization-admin-user-search')?.value ?? ''
  ).slice(0, 160);
  const dashboard = await getOrganizationAdminDashboard({
    organizationQuery: firstSearchParam(params.q),
    organizationPage: firstSearchParam(params.page) || 1,
    userQuery,
    teamQuery: firstSearchParam(params.team),
    courseQuery: firstSearchParam(params.course),
  });
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const percent = (value: number) =>
    formatLocalizedNumber(value / 100, locale, {
      style: 'percent',
      maximumFractionDigits: 0,
    });
  const enumLabel = (value: string) =>
    copy.enumLabels[value] ?? getAdminEnumLabel(locale, value);
  const selectorLimit = copy.selectorLimit.replace(
    '{count}',
    number(dashboard.limits.optionSearchResults),
  );
  const collectionLimit = copy.collectionLimit.replace(
    '{count}',
    number(dashboard.limits.collectionResults),
  );

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">{copy.milestoneEyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
            </div>
            <div className="admin-account">
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.findEyebrow}</p>
                <h2>{copy.findTitle}</h2>
              </div>
              <span>
                {copy.page} {number(dashboard.pagination.page)} {copy.of}{' '}
                {number(dashboard.pagination.pageCount)} ·{' '}
                {number(dashboard.pagination.total)} {copy.organizationsCount}
              </span>
            </div>
            <form
              action={searchOrganizationAdministration}
              className="status-form"
              autoComplete="off"
            >
              <input type="hidden" name="locale" value={locale} />
              <label>
                <span>{copy.organizationName}</span>
                <input
                  name="organizationQuery"
                  defaultValue={dashboard.query.organizationQuery}
                  maxLength={160}
                />
              </label>
              <label>
                <span>{copy.userSearch}</span>
                <input
                  name="userQuery"
                  type="search"
                  defaultValue={dashboard.query.userQuery}
                  maxLength={160}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <label>
                <span>{copy.teamName}</span>
                <input
                  name="teamQuery"
                  defaultValue={dashboard.query.teamQuery}
                  maxLength={160}
                />
              </label>
              <label>
                <span>{copy.courseSearch}</span>
                <input
                  name="courseQuery"
                  defaultValue={dashboard.query.courseQuery}
                  maxLength={160}
                />
              </label>
              <button type="submit">{copy.search}</button>
              <button
                type="submit"
                formAction={clearOrganizationAdministrationSearch}
                formNoValidate
              >
                {copy.clearFilters}
              </button>
            </form>
            <p className="admin-empty">{selectorLimit}</p>
            <p className="admin-empty">{collectionLimit}</p>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.createEyebrow}</p>
                <h2>{copy.newOrganization}</h2>
              </div>
              <span>
                {copy.page} {number(dashboard.pagination.page)} {copy.of}{' '}
                {number(dashboard.pagination.pageCount)}
              </span>
            </div>
            <form action={createOrganization} className="status-form">
              <label>
                <span>{copy.organizationName}</span>
                <input name="name" minLength={2} maxLength={160} required />
              </label>
              <label>
                <span>{copy.seatLimit}</span>
                <input
                  name="seatLimit"
                  type="number"
                  min={1}
                  max={100000}
                  required
                />
              </label>
              <button type="submit">{copy.createOrganization}</button>
            </form>
          </section>

          {dashboard.organizations.length === 0 ? (
            <section className="admin-panel">
              <p className="admin-empty">{copy.noOrganizations}</p>
            </section>
          ) : (
            dashboard.organizations.map((organization) => (
              <section className="admin-panel" key={organization.id}>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">{enumLabel(organization.status)}</p>
                    <h2 dir="auto">{organization.name}</h2>
                  </div>
                  {organization.status !== 'ARCHIVED' ? (
                    <form action={archiveOrganization}>
                      <input
                        type="hidden"
                        name="organizationId"
                        value={organization.id}
                      />
                      <button type="submit">{copy.archived}</button>
                    </form>
                  ) : (
                    <span>{copy.archived}</span>
                  )}
                </div>

                <section
                  className="metric-grid"
                  aria-label={`${organization.name} · ${copy.summaryAria}`}
                >
                  <article>
                    <span>{copy.seatLimit}</span>
                    <strong>{number(organization.seatLimit)}</strong>
                  </article>
                  <article>
                    <span>{copy.persistedSeats}</span>
                    <strong>{number(organization._count.seats)}</strong>
                  </article>
                  <article>
                    <span>{copy.activeMemberships}</span>
                    <strong>{number(organization._count.memberships)}</strong>
                  </article>
                  <article>
                    <span>{copy.activeTeams}</span>
                    <strong>{number(organization._count.teams)}</strong>
                  </article>
                  <article>
                    <span>{copy.assignedCourses}</span>
                    <strong>{number(organization._count.courses)}</strong>
                  </article>
                  <article>
                    <span>{copy.sponsoredCompletion}</span>
                    <strong>
                      {percent(organization.progress.completionPercent)}
                    </strong>
                    <small>
                      {number(organization.progress.completedAssignments)}/
                      {number(organization.progress.assignmentCount)}{' '}
                      {copy.completed}
                    </small>
                  </article>
                </section>

                {organization.status === 'ACTIVE' ? (
                  <>
                    <div className="operations-grid">
                      <section>
                        <div className="panel-heading">
                          <h3>{copy.memberships}</h3>
                        </div>
                        <form
                          action={upsertOrganizationMembership}
                          className="status-form"
                        >
                          <input
                            type="hidden"
                            name="organizationId"
                            value={organization.id}
                          />
                          <label>
                            <span>{copy.user}</span>
                            <select name="userId" defaultValue="" required>
                              <option value="" disabled>
                                {copy.selectUser}
                              </option>
                              {organization.availableMembershipUsers.map(
                                (user) => (
                                  <option key={user.id} value={user.id}>
                                    {personLabel(user)}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                          <label>
                            <span>{copy.role}</span>
                            <select name="role" defaultValue="LEARNER" required>
                              {ORGANIZATION_MEMBERSHIP_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {enumLabel(role)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button type="submit">{copy.addOrReactivate}</button>
                        </form>

                        <div className="compact-list">
                          {organization.memberships.map((membership) => (
                            <article key={membership.id}>
                              <div>
                                <strong dir="auto">
                                  {personLabel(membership.user)}
                                </strong>
                                <small>{enumLabel(membership.role)}</small>
                              </div>
                              <form
                                action={updateOrganizationMembershipRole}
                                className="status-form"
                              >
                                <input
                                  type="hidden"
                                  name="organizationId"
                                  value={organization.id}
                                />
                                <input
                                  type="hidden"
                                  name="membershipId"
                                  value={membership.id}
                                />
                                <select
                                  name="role"
                                  defaultValue={membership.role}
                                  aria-label={copy.role}
                                >
                                  {ORGANIZATION_MEMBERSHIP_ROLES.map((role) => (
                                    <option key={role} value={role}>
                                      {enumLabel(role)}
                                    </option>
                                  ))}
                                </select>
                                <button type="submit">{copy.changeRole}</button>
                              </form>
                              <form action={deactivateOrganizationMembership}>
                                <input
                                  type="hidden"
                                  name="organizationId"
                                  value={organization.id}
                                />
                                <input
                                  type="hidden"
                                  name="membershipId"
                                  value={membership.id}
                                />
                                <button type="submit">{copy.deactivate}</button>
                              </form>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section>
                        <div className="panel-heading">
                          <h3>{copy.seats}</h3>
                        </div>
                        <form
                          action={allocateOrganizationSeat}
                          className="status-form"
                        >
                          <input
                            type="hidden"
                            name="organizationId"
                            value={organization.id}
                          />
                          <label>
                            <span>{copy.activeMember}</span>
                            <select name="userId" defaultValue="" required>
                              <option value="" disabled>
                                {copy.selectMember}
                              </option>
                              {organization.availableSeatMemberships.map(
                                (membership) => (
                                  <option
                                    key={membership.id}
                                    value={membership.user.id}
                                  >
                                    {personLabel(membership.user)}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                          <button type="submit">{copy.allocateSeat}</button>
                        </form>

                        <div className="compact-list">
                          {organization.seats.map((seat) => (
                            <article key={seat.id}>
                              <div>
                                <strong dir="auto">
                                  {personLabel(seat.user)}
                                </strong>
                                <small>{enumLabel(seat.status)}</small>
                              </div>
                              {ORGANIZATION_SEAT_TRANSITIONS[seat.status]
                                .length > 0 ? (
                                <form
                                  action={transitionOrganizationSeat}
                                  className="status-form"
                                >
                                  <input
                                    type="hidden"
                                    name="organizationId"
                                    value={organization.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="seatId"
                                    value={seat.id}
                                  />
                                  <select
                                    name="toStatus"
                                    defaultValue=""
                                    aria-label={copy.nextSeatStatus}
                                    required
                                  >
                                    <option value="" disabled>
                                      {copy.moveTo}
                                    </option>
                                    {ORGANIZATION_SEAT_TRANSITIONS[
                                      seat.status
                                    ].map((status) => (
                                      <option key={status} value={status}>
                                        {enumLabel(status)}
                                      </option>
                                    ))}
                                  </select>
                                  <button type="submit">
                                    {copy.updateSeat}
                                  </button>
                                </form>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="operations-grid">
                      <section>
                        <div className="panel-heading">
                          <h3>{copy.teams}</h3>
                        </div>
                        <form
                          action={createOrganizationTeam}
                          className="status-form"
                        >
                          <input
                            type="hidden"
                            name="organizationId"
                            value={organization.id}
                          />
                          <label>
                            <span>{copy.teamName}</span>
                            <input
                              name="name"
                              minLength={2}
                              maxLength={160}
                              required
                            />
                          </label>
                          <button type="submit">{copy.createTeam}</button>
                        </form>

                        <div className="compact-list">
                          {organization.teams.map((team) => (
                            <article key={team.id}>
                              <div>
                                <strong dir="auto">{team.name}</strong>
                                <small>
                                  {number(team._count.memberships)}{' '}
                                  {copy.members}
                                </small>
                              </div>
                              <form
                                action={addOrganizationTeamMember}
                                className="status-form"
                              >
                                <input
                                  type="hidden"
                                  name="organizationId"
                                  value={organization.id}
                                />
                                <input
                                  type="hidden"
                                  name="teamId"
                                  value={team.id}
                                />
                                <select
                                  name="membershipId"
                                  defaultValue=""
                                  aria-label={`${copy.addMember}: ${team.name}`}
                                  required
                                >
                                  <option value="" disabled>
                                    {copy.addMember}
                                  </option>
                                  {team.availableMemberships.map(
                                    (membership) => (
                                      <option
                                        key={membership.id}
                                        value={membership.id}
                                      >
                                        {personLabel(membership.user)}
                                      </option>
                                    ),
                                  )}
                                </select>
                                <button type="submit">{copy.add}</button>
                              </form>
                              {team.memberships.map((teamMembership) => (
                                <form
                                  key={teamMembership.id}
                                  action={removeOrganizationTeamMember}
                                  className="status-form"
                                >
                                  <input
                                    type="hidden"
                                    name="organizationId"
                                    value={organization.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="teamId"
                                    value={team.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="teamMembershipId"
                                    value={teamMembership.id}
                                  />
                                  <span dir="auto">
                                    {personLabel(
                                      teamMembership.organizationMembership
                                        .user,
                                    )}
                                  </span>
                                  <button type="submit">{copy.remove}</button>
                                </form>
                              ))}
                              <form action={archiveOrganizationTeam}>
                                <input
                                  type="hidden"
                                  name="organizationId"
                                  value={organization.id}
                                />
                                <input
                                  type="hidden"
                                  name="teamId"
                                  value={team.id}
                                />
                                <button type="submit">
                                  {copy.archiveTeam}
                                </button>
                              </form>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section>
                        <div className="panel-heading">
                          <h3>{copy.assignedLearning}</h3>
                        </div>
                        <form
                          action={assignOrganizationCourse}
                          className="status-form"
                        >
                          <input
                            type="hidden"
                            name="organizationId"
                            value={organization.id}
                          />
                          <label>
                            <span>{copy.publishedCourse}</span>
                            <select name="courseId" defaultValue="" required>
                              <option value="" disabled>
                                {copy.selectCourse}
                              </option>
                              {organization.availablePublishedCourses.map(
                                (course) => (
                                  <option key={course.id} value={course.id}>
                                    {course.title}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                          <button type="submit">{copy.assignCourse}</button>
                        </form>

                        <div className="compact-list">
                          {organization.courses.map((organizationCourse) => (
                            <article key={organizationCourse.id}>
                              <strong dir="auto">
                                {organizationCourse.course.title}
                              </strong>
                              <form action={unassignOrganizationCourse}>
                                <input
                                  type="hidden"
                                  name="organizationId"
                                  value={organization.id}
                                />
                                <input
                                  type="hidden"
                                  name="organizationCourseId"
                                  value={organizationCourse.id}
                                />
                                <button type="submit">
                                  {copy.unassignCourse}
                                </button>
                              </form>
                            </article>
                          ))}
                        </div>
                      </section>
                    </div>
                  </>
                ) : (
                  <p className="admin-empty">{copy.mutationsDisabled}</p>
                )}
              </section>
            ))
          )}

          <section className="admin-panel">
            <div className="panel-heading">
              <span>
                {copy.page} {number(dashboard.pagination.page)} {copy.of}{' '}
                {number(dashboard.pagination.pageCount)} ·{' '}
                {number(dashboard.pagination.total)} {copy.organizationsCount}
              </span>
              <div className="status-form">
                {dashboard.pagination.hasPreviousPage ? (
                  <Link
                    href={dashboardHref(locale, {
                      organizationQuery: dashboard.query.organizationQuery,
                      organizationPage: dashboard.pagination.page - 1,
                      teamQuery: dashboard.query.teamQuery,
                      courseQuery: dashboard.query.courseQuery,
                    })}
                  >
                    {copy.previousOrganizations}
                  </Link>
                ) : null}
                {dashboard.pagination.hasNextPage ? (
                  <Link
                    href={dashboardHref(locale, {
                      organizationQuery: dashboard.query.organizationQuery,
                      organizationPage: dashboard.pagination.page + 1,
                      teamQuery: dashboard.query.teamQuery,
                      courseQuery: dashboard.query.courseQuery,
                    })}
                  >
                    {copy.nextOrganizations}
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
