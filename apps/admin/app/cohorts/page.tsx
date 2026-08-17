import { requirePlatformPermission } from '@luminol/auth';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminEnumLabel } from '../../lib/admin-localization';
import {
  COHORT_INSTRUCTOR_ROLES,
  displayCohortPersonName,
  getCohortStatusTransitions,
} from '../../lib/cohort-operations';
import { getCohortOperationsCopy } from '../../lib/cohort-operations-localization';
import { getCohortOperationsDashboard } from '../../lib/cohort-operations.server';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  assignCohortInstructor,
  createCohort,
  endCohortInstructorAssignment,
  placeEnrollmentInCohort,
  reassignCohortInstructor,
  removeEnrollmentFromCohort,
  transitionCohortStatus,
} from './actions';
import { updateCohortSchedule } from './schedule-actions';

function dateTimeInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 16) : '';
}

export default async function CohortOperationsPage() {
  await requirePlatformPermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getCohortOperationsCopy(locale);
  const common = getCommonDictionary(locale);
  const dashboard = await getCohortOperationsDashboard();
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const enumLabel = (value: string) => getAdminEnumLabel(locale, value);

  const renderOperationalList = (
    items: typeof dashboard.operational.upcoming,
    empty: string,
  ) =>
    items.length === 0 ? (
      <p className="admin-empty">{empty}</p>
    ) : (
      <div className="data-list">
        {items.map((cohort) => (
          <article key={cohort.id}>
            <div>
              <h3 dir="auto">{cohort.name}</h3>
              <p dir="auto">{cohort.course.title}</p>
            </div>
            <div className="data-meta">
              <span>{enumLabel(cohort.status)}</span>
              <small>
                {cohort.startsAt ? date(cohort.startsAt) : copy.noSchedule}
              </small>
            </div>
          </article>
        ))}
      </div>
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
              <p className="eyebrow">{copy.eyebrow}</p>
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
                <p className="eyebrow">{copy.createTitle}</p>
                <h2>{copy.createTitle}</h2>
              </div>
              <span>
                {number(dashboard.cohorts.length)} /{' '}
                {number(dashboard.limits.cohorts)}
              </span>
            </div>
            <form action={createCohort} className="status-form">
              <label>
                <span>{copy.cohortName}</span>
                <input name="name" minLength={2} maxLength={160} required />
              </label>
              <label>
                <span>{copy.programme}</span>
                <select name="courseId" defaultValue="" required>
                  <option value="" disabled>
                    {copy.programme}
                  </option>
                  {dashboard.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{copy.startsAt}</span>
                <input name="startsAt" type="datetime-local" />
              </label>
              <label>
                <span>{copy.endsAt}</span>
                <input name="endsAt" type="datetime-local" />
              </label>
              <button type="submit">{copy.create}</button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.operationalTitle}</p>
                <h2>{copy.operationalTitle}</h2>
              </div>
            </div>
            <p className="admin-empty">{copy.boundedNotice}</p>
            <div className="operations-grid">
              <section>
                <h3>{copy.upcoming}</h3>
                {renderOperationalList(
                  dashboard.operational.upcoming,
                  copy.noUpcoming,
                )}
              </section>
              <section>
                <h3>{copy.unscheduled}</h3>
                {renderOperationalList(
                  dashboard.operational.unscheduled,
                  copy.noUnscheduled,
                )}
              </section>
              <section>
                <h3>{copy.past}</h3>
                {renderOperationalList(dashboard.operational.past, copy.noPast)}
              </section>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.cohortsTitle}</p>
                <h2>{copy.cohortsTitle}</h2>
              </div>
            </div>
            <p className="admin-empty">{copy.historyNotice}</p>
          </section>

          {dashboard.cohorts.map((cohort) => {
            const transitions = getCohortStatusTransitions(cohort.status);
            const eligibleEnrollments = dashboard.enrollments.filter(
              (enrollment) => enrollment.courseId === cohort.courseId,
            );

            return (
              <section className="admin-panel" key={cohort.id}>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">{enumLabel(cohort.status)}</p>
                    <h2 dir="auto">{cohort.name}</h2>
                    <p dir="auto">{cohort.course.title}</p>
                  </div>
                  <span>
                    {copy.learners}: {number(cohort._count.enrollments)} ·{' '}
                    {copy.instructors}:{' '}
                    {number(cohort._count.instructorAssignments)}
                  </span>
                </div>

                <div className="operations-grid">
                  <section>
                    <h3>{copy.status}</h3>
                    <p className="admin-empty">
                      {copy.current}: {enumLabel(cohort.status)}
                    </p>
                    {transitions.length > 0 ? (
                      <form
                        action={transitionCohortStatus}
                        className="status-form"
                      >
                        <input
                          type="hidden"
                          name="cohortId"
                          value={cohort.id}
                        />
                        <label>
                          <span>{copy.transition}</span>
                          <select name="toStatus" defaultValue="" required>
                            <option value="" disabled>
                              {copy.transition}
                            </option>
                            {transitions.map((status) => (
                              <option key={status} value={status}>
                                {enumLabel(status)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button type="submit">{copy.update}</button>
                      </form>
                    ) : null}
                  </section>

                  <section>
                    <h3>{copy.schedule}</h3>
                    <p className="admin-empty">
                      {cohort.startsAt
                        ? date(cohort.startsAt)
                        : copy.noSchedule}
                      {cohort.endsAt ? ` · ${date(cohort.endsAt)}` : ''}
                    </p>
                    {cohort.status === 'PLANNED' ||
                    cohort.status === 'ACTIVE' ? (
                      <form
                        action={updateCohortSchedule}
                        className="status-form"
                      >
                        <input
                          type="hidden"
                          name="cohortId"
                          value={cohort.id}
                        />
                        <label>
                          <span>{copy.startsAt}</span>
                          <input
                            name="startsAt"
                            type="datetime-local"
                            defaultValue={dateTimeInputValue(cohort.startsAt)}
                          />
                        </label>
                        <label>
                          <span>{copy.endsAt}</span>
                          <input
                            name="endsAt"
                            type="datetime-local"
                            defaultValue={dateTimeInputValue(cohort.endsAt)}
                          />
                        </label>
                        <button type="submit">{copy.update}</button>
                      </form>
                    ) : null}
                  </section>
                </div>

                <section>
                  <h3>{copy.instructors}</h3>
                  {cohort.instructorAssignments.length === 0 ? (
                    <p className="admin-empty">{copy.none}</p>
                  ) : (
                    <div className="data-list">
                      {cohort.instructorAssignments.map((assignment) => (
                        <article key={assignment.id}>
                          <div>
                            <h3 dir="auto">
                              {displayCohortPersonName(assignment.instructor)}
                            </h3>
                            <p>
                              {enumLabel(assignment.role)} ·{' '}
                              {date(assignment.assignedAt)}
                            </p>
                          </div>
                          {cohort.status === 'PLANNED' ||
                          cohort.status === 'ACTIVE' ? (
                            <>
                              <form
                                action={reassignCohortInstructor}
                                className="status-form"
                              >
                                <input
                                  type="hidden"
                                  name="cohortId"
                                  value={cohort.id}
                                />
                                <input
                                  type="hidden"
                                  name="assignmentId"
                                  value={assignment.id}
                                />
                                <label>
                                  <span>{copy.reassignInstructor}</span>
                                  <select
                                    name="instructorUserId"
                                    defaultValue=""
                                    required
                                  >
                                    <option value="" disabled>
                                      {copy.instructor}
                                    </option>
                                    {dashboard.instructors
                                      .filter(
                                        (instructor) =>
                                          instructor.id !==
                                          assignment.instructorUserId,
                                      )
                                      .map((instructor) => (
                                        <option
                                          key={instructor.id}
                                          value={instructor.id}
                                        >
                                          {displayCohortPersonName(instructor)}
                                        </option>
                                      ))}
                                  </select>
                                </label>
                                <label>
                                  <span>{copy.role}</span>
                                  <select
                                    name="role"
                                    defaultValue={assignment.role}
                                    required
                                  >
                                    {COHORT_INSTRUCTOR_ROLES.map((role) => (
                                      <option key={role} value={role}>
                                        {enumLabel(role)}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <button type="submit">
                                  {copy.reassignInstructor}
                                </button>
                              </form>
                              <form action={endCohortInstructorAssignment}>
                                <input
                                  type="hidden"
                                  name="cohortId"
                                  value={cohort.id}
                                />
                                <input
                                  type="hidden"
                                  name="assignmentId"
                                  value={assignment.id}
                                />
                                <button type="submit">
                                  {copy.endAssignment}
                                </button>
                              </form>
                            </>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  )}

                  {cohort.status === 'PLANNED' || cohort.status === 'ACTIVE' ? (
                    <form
                      action={assignCohortInstructor}
                      className="status-form"
                    >
                      <input type="hidden" name="cohortId" value={cohort.id} />
                      <label>
                        <span>{copy.instructor}</span>
                        <select
                          name="instructorUserId"
                          defaultValue=""
                          required
                        >
                          <option value="" disabled>
                            {copy.instructor}
                          </option>
                          {dashboard.instructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>
                              {displayCohortPersonName(instructor)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>{copy.role}</span>
                        <select name="role" defaultValue="LEAD" required>
                          {COHORT_INSTRUCTOR_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {enumLabel(role)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="submit">{copy.assignInstructor}</button>
                    </form>
                  ) : null}
                </section>

                <section>
                  <h3>{copy.learners}</h3>
                  {cohort.enrollments.length === 0 ? (
                    <p className="admin-empty">{copy.none}</p>
                  ) : (
                    <div className="data-list">
                      {cohort.enrollments.map((membership) => (
                        <article key={membership.id}>
                          <div>
                            <h3 dir="auto">
                              {displayCohortPersonName(
                                membership.enrollment.user,
                              )}
                            </h3>
                            <p>
                              {enumLabel(membership.enrollment.status)} ·{' '}
                              {copy.joined}: {date(membership.joinedAt)}
                            </p>
                          </div>
                          {cohort.status === 'PLANNED' ||
                          cohort.status === 'ACTIVE' ? (
                            <form action={removeEnrollmentFromCohort}>
                              <input
                                type="hidden"
                                name="cohortId"
                                value={cohort.id}
                              />
                              <input
                                type="hidden"
                                name="enrollmentId"
                                value={membership.enrollmentId}
                              />
                              <input
                                type="hidden"
                                name="cohortEnrollmentId"
                                value={membership.id}
                              />
                              <button type="submit">
                                {copy.removeLearner}
                              </button>
                            </form>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  )}

                  {(cohort.status === 'PLANNED' ||
                    cohort.status === 'ACTIVE') &&
                  eligibleEnrollments.length > 0 ? (
                    <form
                      action={placeEnrollmentInCohort}
                      className="status-form"
                    >
                      <input type="hidden" name="cohortId" value={cohort.id} />
                      <label>
                        <span>{copy.learner}</span>
                        <select name="enrollmentId" defaultValue="" required>
                          <option value="" disabled>
                            {copy.learner}
                          </option>
                          {eligibleEnrollments.map((enrollment) => (
                            <option key={enrollment.id} value={enrollment.id}>
                              {displayCohortPersonName(enrollment.user)} ·{' '}
                              {enumLabel(enrollment.status)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button type="submit">{copy.addOrMoveLearner}</button>
                    </form>
                  ) : null}
                </section>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
