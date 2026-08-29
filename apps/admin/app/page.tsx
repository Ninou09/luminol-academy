import { UserButton } from '@clerk/nextjs';
import { requirePermission } from '@luminol/auth';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../components/admin-language-switcher';
import { getAcademyAnalyticsCopy } from '../lib/academy-analytics-localization';
import { getAdminCopy, getAdminEnumLabel } from '../lib/admin-localization';
import { getEnquiryCampaignReportingCopy } from '../lib/enquiry-campaign-reporting-localization';
import { getEnquiryProgrammeMixCopy } from '../lib/enquiry-programme-mix-localization';
import { getEnquiryWorkflowCopy } from '../lib/enquiry-workflow-localization';
import {
  displayPersonName,
  getEnrollmentTransitions,
  getEnquiryTransitions,
} from '../lib/operations';
import { getOperationsDashboard } from '../lib/operations.server';
import { getAdminRequestLocale } from '../lib/request-locale';
import {
  createEnrollment,
  transitionEnrollmentStatus,
} from './enrollments/actions';
import { transitionEnquiryStatus } from './enquiries/actions';

export default async function Page() {
  const administrator = await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getAdminCopy(locale);
  const analyticsCopy = getAcademyAnalyticsCopy(locale);
  const campaignCopy = getEnquiryCampaignReportingCopy(locale);
  const programmeMixCopy = getEnquiryProgrammeMixCopy(locale);
  const workflowCopy = getEnquiryWorkflowCopy(locale);
  const common = getCommonDictionary(locale);
  const operations = await getOperationsDashboard();
  const administratorName = displayPersonName(
    administrator.firstName,
    administrator.lastName,
    copy.shell.administrator,
  );
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const percent = (value: number) =>
    formatLocalizedNumber(value / 100, locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    });
  const date = (value: Date) => formatLocalizedDate(value, locale);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link
          className="admin-brand"
          href={localizeHref(locale, '/')}
          aria-label={copy.shell.aria}
        >
          <Wordmark />
        </Link>
        <p className="admin-label">{copy.shell.administration}</p>
        <nav aria-label={copy.shell.navigationAria}>
          <a className="active" href="#overview">
            <span>01</span> {copy.shell.overview}
          </a>
          <Link href={localizeHref(locale, '/enquiries')}>
            <span>02</span> {copy.shell.enquiries}
          </Link>
          <a href="#learners">
            <span>03</span> {copy.shell.learners}
          </a>
          <a href="#programmes">
            <span>04</span> {copy.shell.programmes}
          </a>
          <Link href={localizeHref(locale, '/search')}>
            <span>05</span> {copy.shell.search}
          </Link>
          <Link href={localizeHref(locale, '/finance')}>
            <span>06</span> {copy.shell.finance}
          </Link>
          <Link href={localizeHref(locale, '/analytics')}>
            <span>07</span> {analyticsCopy.title}
          </Link>
        </nav>
        <div className="admin-sidebar-note">
          <span>{copy.shell.protectedWorkspace}</span>
          <p>{copy.shell.protectedNote}</p>
        </div>
      </aside>

      <section className="admin-dashboard">
        <header className="admin-topbar">
          <div>
            <p>{copy.dashboard.topbarTitle}</p>
            <span>{copy.dashboard.topbarSubtitle}</span>
          </div>
          <div className="admin-account">
            <AdminLanguageSwitcher
              locale={locale}
              label={common.languageSelectorLabel}
            />
            <span dir="auto">{administratorName}</span>
            <UserButton />
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-intro" id="overview">
            <div>
              <p className="eyebrow">{copy.dashboard.eyebrow}</p>
              <h1>{copy.dashboard.title}</h1>
              <p>{copy.dashboard.intro}</p>
            </div>
            <div className="health-status">
              <span aria-hidden="true" />
              {copy.dashboard.health}
            </div>
          </section>

          <section
            className="metric-grid"
            aria-label={copy.dashboard.summaryAria}
          >
            <article>
              <span>{copy.dashboard.activePeople}</span>
              <strong>{number(operations.summary.activeUsers)}</strong>
              <small>{copy.dashboard.synchronizedAccounts}</small>
            </article>
            <article>
              <span>{copy.dashboard.activeEnrollments}</span>
              <strong>{number(operations.summary.activeEnrollments)}</strong>
              <small>{copy.dashboard.learningNow}</small>
            </article>
            <article>
              <span>{copy.dashboard.publishedCourses}</span>
              <strong>{number(operations.summary.publishedCourses)}</strong>
              <small>{copy.dashboard.availableProgrammes}</small>
            </article>
            <article>
              <span>{copy.dashboard.newEnquiries}</span>
              <strong>{number(operations.summary.newEnquiries)}</strong>
              <small>{copy.dashboard.awaitingReview}</small>
            </article>
            <article className="completion-metric">
              <span>{copy.dashboard.completionRate}</span>
              <strong>
                {formatLocalizedNumber(
                  operations.summary.completionRate / 100,
                  locale,
                  { style: 'percent', maximumFractionDigits: 1 },
                )}
              </strong>
              <div
                className="admin-progress"
                role="progressbar"
                aria-label={copy.dashboard.completionRateAria}
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

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.dashboard.growth}</p>
                <h2>{copy.dashboard.enquiryPipeline}</h2>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div
              className="metric-grid"
              aria-label={copy.dashboard.enquiryPipelineAria}
            >
              <article>
                <span>{copy.dashboard.enquiriesLast30Days}</span>
                <strong>
                  {number(operations.summary.enquiriesLast30Days)}
                </strong>
                <small>{copy.dashboard.receivedLast30Days}</small>
              </article>
              <article>
                <span>{copy.dashboard.programmeAttributedLast30Days}</span>
                <strong>
                  {number(operations.summary.programmeAttributedLast30Days)}
                </strong>
                <small>{copy.dashboard.verifiedProgrammeContext}</small>
              </article>
              <article>
                <span>{copy.dashboard.activeEnquiries}</span>
                <strong>{number(operations.summary.activeEnquiries)}</strong>
                <small>{copy.dashboard.currentlyOpen}</small>
              </article>
              <article>
                <span>{copy.dashboard.unassignedActiveEnquiries}</span>
                <strong>
                  {number(operations.summary.unassignedActiveEnquiries)}
                </strong>
                <small>{copy.dashboard.needsOwner}</small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.dashboard.rollingThirtyDays}</p>
                <h2>{copy.dashboard.enquirySchoolMix}</h2>
                <p>{copy.dashboard.enquirySchoolMixIntro}</p>
              </div>
            </div>
            {operations.enquirySchoolMixLast30Days.length > 0 ? (
              <div className="metric-grid">
                {operations.enquirySchoolMixLast30Days.map((item) => (
                  <article key={item.school}>
                    <span>{getAdminEnumLabel(locale, item.school)}</span>
                    <strong>{number(item.count)}</strong>
                    <small>{copy.dashboard.rollingThirtyDays}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{copy.dashboard.noSchoolMix}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{programmeMixCopy.eyebrow}</p>
                <h2>{programmeMixCopy.title}</h2>
                <p>{programmeMixCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            {operations.programmeEnquiryMixLast30Days.length > 0 ? (
              <div className="metric-grid" aria-label={programmeMixCopy.title}>
                {operations.programmeEnquiryMixLast30Days.map((item) => (
                  <article key={item.programmeSlug}>
                    <span dir="auto">{item.programmeTitleSnapshot}</span>
                    <strong>{number(item.count)}</strong>
                    <small>
                      {programmeMixCopy.enquiryCount(number(item.count))}
                    </small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{programmeMixCopy.noData}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{campaignCopy.eyebrow}</p>
                <h2>{campaignCopy.title}</h2>
                <p>{campaignCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div className="metric-grid" aria-label={campaignCopy.title}>
              <article>
                <span>{campaignCopy.tagged}</span>
                <strong>
                  {number(operations.campaignEnquiryMixLast30Days.taggedTotal)}
                </strong>
                <small>{campaignCopy.taggedNote}</small>
              </article>
              <article>
                <span>{campaignCopy.untagged}</span>
                <strong>
                  {number(operations.campaignEnquiryMixLast30Days.untaggedTotal)}
                </strong>
                <small>{campaignCopy.untaggedNote}</small>
              </article>
            </div>
            <div className="panel-heading">
              <div>
                <h3>{campaignCopy.sourceMix}</h3>
              </div>
            </div>
            {operations.campaignEnquiryMixLast30Days.sourceMix.length > 0 ? (
              <div className="metric-grid" aria-label={campaignCopy.sourceMix}>
                {operations.campaignEnquiryMixLast30Days.sourceMix.map((item) => (
                  <article key={item.utmSource}>
                    <span dir="auto">{item.utmSource}</span>
                    <strong>{number(item.count)}</strong>
                    <small>{campaignCopy.enquiryCount(number(item.count))}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{campaignCopy.noSources}</p>
            )}
            <div className="panel-heading">
              <div>
                <h3>{campaignCopy.campaignMix}</h3>
              </div>
            </div>
            {operations.campaignEnquiryMixLast30Days.campaignMix.length > 0 ? (
              <div className="metric-grid" aria-label={campaignCopy.campaignMix}>
                {operations.campaignEnquiryMixLast30Days.campaignMix.map((item) => (
                  <article key={`${item.utmSource}:${item.utmCampaign}`}>
                    <span dir="auto">
                      {campaignCopy.campaignPair(
                        item.utmSource,
                        item.utmCampaign,
                      )}
                    </span>
                    <strong>{number(item.count)}</strong>
                    <small>{campaignCopy.enquiryCount(number(item.count))}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{campaignCopy.noCampaigns}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{workflowCopy.eyebrow}</p>
                <h2>{workflowCopy.title}</h2>
                <p>{workflowCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div className="metric-grid" aria-label={workflowCopy.title}>
              <article>
                <span>{workflowCopy.ownerCoverage}</span>
                <strong>
                  {percent(
                    operations.enquiryWorkflowCoverageLast30Days.ownerPercent,
                  )}
                </strong>
                <small>
                  {workflowCopy.coveredOfActive(
                    number(
                      operations.enquiryWorkflowCoverageLast30Days.ownerCovered,
                    ),
                    number(
                      operations.enquiryWorkflowCoverageLast30Days.activeTotal,
                    ),
                  )}{' '}
                  · {workflowCopy.ownerCoverageNote}
                </small>
              </article>
              <article>
                <span>{workflowCopy.followUpCoverage}</span>
                <strong>
                  {percent(
                    operations.enquiryWorkflowCoverageLast30Days
                      .followUpPercent,
                  )}
                </strong>
                <small>
                  {workflowCopy.coveredOfActive(
                    number(
                      operations.enquiryWorkflowCoverageLast30Days
                        .followUpCovered,
                    ),
                    number(
                      operations.enquiryWorkflowCoverageLast30Days.activeTotal,
                    ),
                  )}{' '}
                  · {workflowCopy.followUpCoverageNote}
                </small>
              </article>
              <article>
                <span>{workflowCopy.qualificationCoverage}</span>
                <strong>
                  {percent(
                    operations.enquiryWorkflowCoverageLast30Days
                      .qualificationPercent,
                  )}
                </strong>
                <small>
                  {workflowCopy.coveredOfActive(
                    number(
                      operations.enquiryWorkflowCoverageLast30Days
                        .qualificationCovered,
                    ),
                    number(
                      operations.enquiryWorkflowCoverageLast30Days.activeTotal,
                    ),
                  )}{' '}
                  · {workflowCopy.qualificationCoverageNote}
                </small>
              </article>
            </div>
          </section>

          <div className="operations-grid">
            <section className="admin-panel enquiries-panel" id="enquiries">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{copy.dashboard.growth}</p>
                  <h2>{copy.dashboard.recentEnquiries}</h2>
                </div>
                <span>
                  {number(operations.summary.newEnquiries)}{' '}
                  {copy.dashboard.newSuffix}
                </span>
              </div>
              {operations.recentEnquiries.length > 0 ? (
                <div className="data-list">
                  {operations.recentEnquiries.map((enquiry) => (
                    <article key={enquiry.id}>
                      <div className="person-mark" aria-hidden="true">
                        {enquiry.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 dir="auto">{enquiry.name}</h3>
                        <p dir="auto">{enquiry.email}</p>
                      </div>
                      <div className="data-meta">
                        <span>{getAdminEnumLabel(locale, enquiry.school)}</span>
                        <small>{date(enquiry.createdAt)}</small>
                      </div>
                      <span
                        className={`data-status status-${enquiry.status.toLowerCase()}`}
                      >
                        {getAdminEnumLabel(locale, enquiry.status)}
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
                            {copy.dashboard.updateEnquiryStatus}: {enquiry.name}
                          </span>
                          <select
                            name="toStatus"
                            defaultValue=""
                            required
                            aria-label={`${copy.dashboard.updateEnquiryStatus}: ${enquiry.name}`}
                          >
                            <option value="" disabled>
                              {copy.dashboard.moveTo}
                            </option>
                            {getEnquiryTransitions(enquiry.status).map(
                              (status) => (
                                <option key={status} value={status}>
                                  {getAdminEnumLabel(locale, status)}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <button type="submit">{copy.dashboard.update}</button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty">{copy.dashboard.noEnquiries}</p>
              )}
            </section>

            <section className="admin-panel learners-panel" id="learners">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{copy.dashboard.learning}</p>
                  <h2>{copy.dashboard.recentEnrollments}</h2>
                </div>
              </div>
              {operations.enrollmentOptions.learners.length > 0 &&
              operations.enrollmentOptions.courses.length > 0 ? (
                <form
                  action={createEnrollment}
                  className="enrollment-create-form"
                >
                  <label>
                    <span>{copy.dashboard.learner}</span>
                    <select name="userId" defaultValue="" required>
                      <option value="" disabled>
                        {copy.dashboard.selectLearner}
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
                    <span>{copy.dashboard.publishedCourse}</span>
                    <select name="courseId" defaultValue="" required>
                      <option value="" disabled>
                        {copy.dashboard.selectCourse}
                      </option>
                      {operations.enrollmentOptions.courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit">
                    {copy.dashboard.createEnrollment}
                  </button>
                </form>
              ) : (
                <p className="enrollment-readiness">
                  {copy.dashboard.enrollmentReadiness}
                </p>
              )}
              {operations.recentEnrollments.length > 0 ? (
                <div className="compact-list">
                  {operations.recentEnrollments.map((enrollment) => (
                    <article key={enrollment.id}>
                      <div>
                        <h3 dir="auto">
                          {displayPersonName(
                            enrollment.user.firstName,
                            enrollment.user.lastName,
                            enrollment.user.email,
                          )}
                        </h3>
                        <p dir="auto">{enrollment.course.title}</p>
                      </div>
                      <div>
                        <span
                          className={`data-status status-${enrollment.status.toLowerCase()}`}
                        >
                          {getAdminEnumLabel(locale, enrollment.status)}
                        </span>
                        <small>{date(enrollment.enrolledAt)}</small>
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
                            {copy.dashboard.updateEnrollmentStatus}:{' '}
                            {enrollment.course.title}
                          </span>
                          <select
                            name="toStatus"
                            defaultValue=""
                            required
                            aria-label={`${copy.dashboard.updateEnrollmentStatus}: ${enrollment.course.title}`}
                          >
                            <option value="" disabled>
                              {copy.dashboard.moveTo}
                            </option>
                            {getEnrollmentTransitions(enrollment.status).map(
                              (status) => (
                                <option key={status} value={status}>
                                  {getAdminEnumLabel(locale, status)}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <button type="submit">{copy.dashboard.update}</button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty">{copy.dashboard.noEnrollments}</p>
              )}
            </section>
          </div>

          <section className="admin-panel portfolio-panel" id="programmes">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.dashboard.portfolio}</p>
                <h2>{copy.dashboard.programmeReadiness}</h2>
              </div>
              <span>
                {number(operations.coursePortfolio.length)}{' '}
                {copy.dashboard.recentSuffix}
              </span>
            </div>
            {operations.coursePortfolio.length > 0 ? (
              <div className="portfolio-table">
                <div className="portfolio-header" aria-hidden="true">
                  <span>{copy.dashboard.programme}</span>
                  <span>{copy.dashboard.modules}</span>
                  <span>{copy.dashboard.enrollments}</span>
                  <span>{copy.dashboard.status}</span>
                  <span>{copy.dashboard.updated}</span>
                </div>
                {operations.coursePortfolio.map((course) => (
                  <article key={course.id}>
                    <h3 dir="auto">{course.title}</h3>
                    <span>{number(course._count.modules)}</span>
                    <span>{number(course._count.enrollments)}</span>
                    <span
                      className={
                        course.published
                          ? 'data-status status-active'
                          : 'data-status status-draft'
                      }
                    >
                      {course.published
                        ? copy.dashboard.published
                        : copy.dashboard.draft}
                    </span>
                    <small>{date(course.updatedAt)}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{copy.dashboard.noCourses}</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
