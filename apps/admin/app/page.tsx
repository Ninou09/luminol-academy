import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { requirePermission } from '@luminol/auth';
import { Wordmark } from '@luminol/ui';

import {
  displayPersonName,
  formatEnumLabel,
  getEnrollmentTransitions,
  getEnquiryTransitions,
} from '../lib/operations';
import { getOperationsDashboard } from '../lib/operations.server';
import {
  createEnrollment,
  transitionEnrollmentStatus,
} from './enrollments/actions';
import { transitionEnquiryStatus } from './enquiries/actions';

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default async function Page() {
  const administrator = await requirePermission('academy:manage');
  const operations = await getOperationsDashboard();
  const administratorName = displayPersonName(
    administrator.firstName,
    administrator.lastName,
    'Administrator',
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/" aria-label="Luminol administration">
          <Wordmark />
        </Link>
        <p className="admin-label">Administration</p>
        <nav aria-label="Administration navigation">
          <a className="active" href="#overview">
            <span>01</span> Overview
          </a>
          <a href="#enquiries">
            <span>02</span> Enquiries
          </a>
          <a href="#learners">
            <span>03</span> Learners
          </a>
          <a href="#programmes">
            <span>04</span> Programmes
          </a>
          <Link href="/finance">
            <span>05</span> Finance
          </Link>
        </nav>
        <div className="admin-sidebar-note">
          <span>Protected workspace</span>
          <p>Server-authorized operations for the Luminol team.</p>
        </div>
      </aside>

      <section className="admin-dashboard">
        <header className="admin-topbar">
          <div>
            <p>Academic operations</p>
            <span>Live platform overview</span>
          </div>
          <div className="admin-account">
            <span>{administratorName}</span>
            <UserButton />
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-intro" id="overview">
            <div>
              <p className="eyebrow">Operations centre</p>
              <h1>Clarity for every branch.</h1>
              <p>
                One view of people, programmes, enquiries and learning activity
                across the Luminol ecosystem.
              </p>
            </div>
            <div className="health-status">
              <span aria-hidden="true" />
              Platform data connected
            </div>
          </section>

          <section className="metric-grid" aria-label="Operations summary">
            <article>
              <span>Active people</span>
              <strong>{operations.summary.activeUsers}</strong>
              <small>Synchronized accounts</small>
            </article>
            <article>
              <span>Active enrolments</span>
              <strong>{operations.summary.activeEnrollments}</strong>
              <small>Learning now</small>
            </article>
            <article>
              <span>Published courses</span>
              <strong>{operations.summary.publishedCourses}</strong>
              <small>Available programmes</small>
            </article>
            <article>
              <span>New enquiries</span>
              <strong>{operations.summary.newEnquiries}</strong>
              <small>Awaiting review</small>
            </article>
            <article className="completion-metric">
              <span>Completion rate</span>
              <strong>{operations.summary.completionRate}%</strong>
              <div
                className="admin-progress"
                role="progressbar"
                aria-label="Programme completion rate"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={operations.summary.completionRate}
              >
                <span
                  style={{ width: `${operations.summary.completionRate}%` }}
                />
              </div>
            </article>
          </section>

          <div className="operations-grid">
            <section className="admin-panel enquiries-panel" id="enquiries">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Growth</p>
                  <h2>Recent enquiries</h2>
                </div>
                <span>{operations.summary.newEnquiries} new</span>
              </div>
              {operations.recentEnquiries.length > 0 ? (
                <div className="data-list">
                  {operations.recentEnquiries.map((enquiry) => (
                    <article key={enquiry.id}>
                      <div className="person-mark" aria-hidden="true">
                        {enquiry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{enquiry.name}</h3>
                        <p>{enquiry.email}</p>
                      </div>
                      <div className="data-meta">
                        <span>{formatEnumLabel(enquiry.school)}</span>
                        <small>{dateFormatter.format(enquiry.createdAt)}</small>
                      </div>
                      <span
                        className={`data-status status-${enquiry.status.toLowerCase()}`}
                      >
                        {formatEnumLabel(enquiry.status)}
                      </span>
                      <form
                        action={transitionEnquiryStatus}
                        className="status-form"
                      >
                        <input
                          type="hidden"
                          name="enquiryId"
                          value={enquiry.id}
                        />
                        <label>
                          <span className="sr-only">
                            Update {enquiry.name}&apos;s enquiry status
                          </span>
                          <select
                            name="toStatus"
                            defaultValue=""
                            required
                            aria-label={`Update ${enquiry.name}'s enquiry status`}
                          >
                            <option value="" disabled>
                              Move to…
                            </option>
                            {getEnquiryTransitions(enquiry.status).map(
                              (status) => (
                                <option key={status} value={status}>
                                  {formatEnumLabel(status)}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <button type="submit">Update</button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty">No enquiries have arrived yet.</p>
              )}
            </section>

            <section className="admin-panel learners-panel" id="learners">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Learning</p>
                  <h2>Recent enrolments</h2>
                </div>
              </div>
              {operations.enrollmentOptions.learners.length > 0 &&
              operations.enrollmentOptions.courses.length > 0 ? (
                <form
                  action={createEnrollment}
                  className="enrollment-create-form"
                >
                  <label>
                    <span>Learner</span>
                    <select name="userId" defaultValue="" required>
                      <option value="" disabled>
                        Select learner
                      </option>
                      {operations.enrollmentOptions.learners.map((learner) => (
                        <option key={learner.id} value={learner.id}>
                          {displayPersonName(
                            learner.firstName,
                            learner.lastName,
                            learner.email,
                          )}{' '}
                          · {learner.email}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Published course</span>
                    <select name="courseId" defaultValue="" required>
                      <option value="" disabled>
                        Select course
                      </option>
                      {operations.enrollmentOptions.courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit">Create enrolment</button>
                </form>
              ) : (
                <p className="enrollment-readiness">
                  A synchronized learner and published course are required
                  before an enrolment can be created.
                </p>
              )}
              {operations.recentEnrollments.length > 0 ? (
                <div className="compact-list">
                  {operations.recentEnrollments.map((enrollment) => (
                    <article key={enrollment.id}>
                      <div>
                        <h3>
                          {displayPersonName(
                            enrollment.user.firstName,
                            enrollment.user.lastName,
                            enrollment.user.email,
                          )}
                        </h3>
                        <p>{enrollment.course.title}</p>
                      </div>
                      <div>
                        <span
                          className={`data-status status-${enrollment.status.toLowerCase()}`}
                        >
                          {formatEnumLabel(enrollment.status)}
                        </span>
                        <small>
                          {dateFormatter.format(enrollment.enrolledAt)}
                        </small>
                      </div>
                      <form
                        action={transitionEnrollmentStatus}
                        className="status-form enrollment-status-form"
                      >
                        <input
                          type="hidden"
                          name="enrollmentId"
                          value={enrollment.id}
                        />
                        <label>
                          <span className="sr-only">
                            Update {enrollment.course.title} enrolment status
                          </span>
                          <select
                            name="toStatus"
                            defaultValue=""
                            required
                            aria-label={`Update ${enrollment.course.title} enrolment status`}
                          >
                            <option value="" disabled>
                              Move to…
                            </option>
                            {getEnrollmentTransitions(enrollment.status).map(
                              (status) => (
                                <option key={status} value={status}>
                                  {formatEnumLabel(status)}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <button type="submit">Update</button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty">No learner enrolments yet.</p>
              )}
            </section>
          </div>

          <section className="admin-panel portfolio-panel" id="programmes">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Portfolio</p>
                <h2>Programme readiness</h2>
              </div>
              <span>{operations.coursePortfolio.length} recent</span>
            </div>
            {operations.coursePortfolio.length > 0 ? (
              <div className="portfolio-table">
                <div className="portfolio-header" aria-hidden="true">
                  <span>Programme</span>
                  <span>Modules</span>
                  <span>Enrolments</span>
                  <span>Status</span>
                  <span>Updated</span>
                </div>
                {operations.coursePortfolio.map((course) => (
                  <article key={course.id}>
                    <h3>{course.title}</h3>
                    <span>{course._count.modules}</span>
                    <span>{course._count.enrollments}</span>
                    <span
                      className={
                        course.published
                          ? 'data-status status-active'
                          : 'data-status status-draft'
                      }
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                    <small>{dateFormatter.format(course.updatedAt)}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No courses have been synchronized.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
