import { requirePermission } from '@luminol/auth';
import Link from 'next/link';

import { getOrganizationAdminDashboard } from '../../lib/organization-admin.server';
import type { OrganizationSeatStatus } from '../../lib/organization-admin';
import {
  addOrganizationTeamMember,
  allocateOrganizationSeat,
  archiveOrganization,
  archiveOrganizationTeam,
  assignOrganizationCourse,
  createOrganization,
  createOrganizationTeam,
  deactivateOrganizationMembership,
  removeOrganizationTeamMember,
  transitionOrganizationSeat,
  unassignOrganizationCourse,
  updateOrganizationMembershipRole,
  upsertOrganizationMembership,
} from './actions';

const seatTransitions: Record<
  OrganizationSeatStatus,
  readonly OrganizationSeatStatus[]
> = {
  INVITED: ['ACTIVE', 'REVOKED'],
  ACTIVE: ['COMPLETED', 'REVOKED'],
  COMPLETED: [],
  REVOKED: [],
};

function personLabel(person: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const name = [person.firstName, person.lastName].filter(Boolean).join(' ');
  return name ? `${name} · ${person.email}` : person.email;
}

export default async function OrganizationsAdminPage() {
  await requirePermission('academy:manage');
  const dashboard = await getOrganizationAdminDashboard();

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">Milestone 16</p>
              <h1>Organizations & team learning</h1>
              <p>
                Academy-only administration for organization membership, teams,
                seats, assigned learning and bounded aggregate completion.
              </p>
            </div>
            <Link href="/">Back to administration</Link>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Create</p>
                <h2>New organization</h2>
              </div>
              <span>
                Showing at most {dashboard.limits.organizations} organizations
              </span>
            </div>
            <form action={createOrganization} className="status-form">
              <label>
                <span>Organization name</span>
                <input name="name" minLength={2} maxLength={160} required />
              </label>
              <label>
                <span>Seat limit</span>
                <input
                  name="seatLimit"
                  type="number"
                  min={1}
                  max={100000}
                  required
                />
              </label>
              <button type="submit">Create organization</button>
            </form>
          </section>

          {dashboard.organizations.length === 0 ? (
            <section className="admin-panel">
              <p className="admin-empty">
                No organizations have been created yet.
              </p>
            </section>
          ) : (
            dashboard.organizations.map((organization) => (
              <section className="admin-panel" key={organization.id}>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">{organization.status}</p>
                    <h2 dir="auto">{organization.name}</h2>
                  </div>
                  {organization.status !== 'ARCHIVED' ? (
                    <form action={archiveOrganization}>
                      <input
                        type="hidden"
                        name="organizationId"
                        value={organization.id}
                      />
                      <button type="submit">Archive organization</button>
                    </form>
                  ) : (
                    <span>Archived</span>
                  )}
                </div>

                <section
                  className="metric-grid"
                  aria-label={`${organization.name} organization summary`}
                >
                  <article>
                    <span>Seat limit</span>
                    <strong>{organization.seatLimit}</strong>
                  </article>
                  <article>
                    <span>Persisted seats</span>
                    <strong>{organization._count.seats}</strong>
                  </article>
                  <article>
                    <span>Active memberships</span>
                    <strong>{organization.memberships.length}</strong>
                  </article>
                  <article>
                    <span>Active teams</span>
                    <strong>{organization.teams.length}</strong>
                  </article>
                  <article>
                    <span>Assigned courses</span>
                    <strong>{organization.courses.length}</strong>
                  </article>
                  <article>
                    <span>Sponsored completion</span>
                    <strong>{organization.progress.completionPercent}%</strong>
                    <small>
                      {organization.progress.completedAssignments}/
                      {organization.progress.assignmentCount} completed
                    </small>
                  </article>
                </section>

                {organization.status === 'ACTIVE' ? (
                  <>
                    <div className="operations-grid">
                      <section>
                        <div className="panel-heading">
                          <h3>Memberships</h3>
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
                            <span>User</span>
                            <select name="userId" defaultValue="" required>
                              <option value="" disabled>
                                Select user
                              </option>
                              {dashboard.options.users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {personLabel(user)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span>Role</span>
                            <select name="role" defaultValue="LEARNER" required>
                              <option value="OWNER">Owner</option>
                              <option value="MANAGER">Manager</option>
                              <option value="LEARNER">Learner</option>
                            </select>
                          </label>
                          <button type="submit">Add or reactivate</button>
                        </form>

                        <div className="compact-list">
                          {organization.memberships.map((membership) => (
                            <article key={membership.id}>
                              <div>
                                <strong dir="auto">
                                  {personLabel(membership.user)}
                                </strong>
                                <small>{membership.role}</small>
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
                                  aria-label="Membership role"
                                >
                                  <option value="OWNER">Owner</option>
                                  <option value="MANAGER">Manager</option>
                                  <option value="LEARNER">Learner</option>
                                </select>
                                <button type="submit">Change role</button>
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
                                <button type="submit">Deactivate</button>
                              </form>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section>
                        <div className="panel-heading">
                          <h3>Seats</h3>
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
                            <span>Active member</span>
                            <select name="userId" defaultValue="" required>
                              <option value="" disabled>
                                Select member
                              </option>
                              {organization.memberships.map((membership) => (
                                <option
                                  key={membership.id}
                                  value={membership.user.id}
                                >
                                  {personLabel(membership.user)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button type="submit">Allocate seat</button>
                        </form>

                        <div className="compact-list">
                          {organization.seats.map((seat) => (
                            <article key={seat.id}>
                              <div>
                                <strong dir="auto">
                                  {personLabel(seat.user)}
                                </strong>
                                <small>{seat.status}</small>
                              </div>
                              {seatTransitions[seat.status].length > 0 ? (
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
                                    required
                                  >
                                    <option value="" disabled>
                                      Move to
                                    </option>
                                    {seatTransitions[seat.status].map(
                                      (status) => (
                                        <option key={status} value={status}>
                                          {status}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                  <button type="submit">Update seat</button>
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
                          <h3>Teams</h3>
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
                            <span>Team name</span>
                            <input
                              name="name"
                              minLength={2}
                              maxLength={160}
                              required
                            />
                          </label>
                          <button type="submit">Create team</button>
                        </form>

                        <div className="compact-list">
                          {organization.teams.map((team) => (
                            <article key={team.id}>
                              <div>
                                <strong dir="auto">{team.name}</strong>
                                <small>{team.memberships.length} members</small>
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
                                  required
                                >
                                  <option value="" disabled>
                                    Add member
                                  </option>
                                  {organization.memberships.map(
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
                                <button type="submit">Add</button>
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
                                  <button type="submit">Remove</button>
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
                                <button type="submit">Archive team</button>
                              </form>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section>
                        <div className="panel-heading">
                          <h3>Assigned learning</h3>
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
                            <span>Published course</span>
                            <select name="courseId" defaultValue="" required>
                              <option value="" disabled>
                                Select course
                              </option>
                              {dashboard.options.publishedCourses.map(
                                (course) => (
                                  <option key={course.id} value={course.id}>
                                    {course.title}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                          <button type="submit">Assign course</button>
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
                                <button type="submit">Unassign</button>
                              </form>
                            </article>
                          ))}
                        </div>
                      </section>
                    </div>
                  </>
                ) : (
                  <p className="admin-empty">
                    Mutations are disabled for archived organizations.
                  </p>
                )}
              </section>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
