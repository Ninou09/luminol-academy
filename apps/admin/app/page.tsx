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
import { getCampaignLinkBuilderCopy } from '../lib/campaign-link-builder-localization';
import { buildEnquiryCampaignAttributionQuery } from '../lib/enquiry-campaign-filter';
import { getAdminCopy, getAdminEnumLabel } from '../lib/admin-localization';
import { getEnquiryAgeCopy } from '../lib/enquiry-age-localization';
import { getUnassignedEnquiryAgeCopy } from '../lib/enquiry-unassigned-age-localization';
import { getEnquiryCampaignReportingCopy } from '../lib/enquiry-campaign-reporting-localization';
import { getEnquiryCampaignMediumCopy } from '../lib/enquiry-campaign-medium-localization';
import { getEnquiryCampaignContentCopy } from '../lib/enquiry-campaign-content-localization';
import { getEnquiryAttributionCoverageCopy } from '../lib/enquiry-attribution-coverage-localization';
import { getEnquiryLandingPathCopy } from '../lib/enquiry-landing-path-localization';
import { buildEnquiryLandingPathQuery } from '../lib/enquiry-landing-path-filter';
import { buildEnquirySchoolQuery } from '../lib/enquiry-school-filter';
import { buildEnquiryContactPreferenceQuery } from '../lib/enquiry-contact-preference-filter';
import { buildEnquiryDeliveryPreferenceQuery } from '../lib/enquiry-delivery-preference-filter';
import { buildEnquiryTimingPreferenceQuery } from '../lib/enquiry-timing-preference-filter';
import { buildEnquiryProgrammeQuery } from '../lib/enquiry-programme-filter';
import { getEnquiryContactPreferenceCopy } from '../lib/enquiry-contact-preference-localization';
import { getEnquiryDeliveryPreferenceCopy } from '../lib/enquiry-delivery-preference-localization';
import { getEnquiryTimingPreferenceCopy } from '../lib/enquiry-timing-preference-localization';
import { getEnquiryContactTurnaroundCopy } from '../lib/enquiry-contact-turnaround-localization';
import { getEnquiryFollowUpTimingCopy } from '../lib/enquiry-follow-up-timing-localization';
import { getMissingFollowUpPlanAgeCopy } from '../lib/enquiry-missing-follow-up-age-localization';
import { getIncompleteQualificationAgeCopy } from '../lib/enquiry-incomplete-qualification-age-localization';
import { getUnrecordedContactAgeCopy } from '../lib/enquiry-unrecorded-contact-age-localization';
import { getEnquiryOutcomeCoverageCopy } from '../lib/enquiry-outcome-coverage-localization';
import { getEnquiryQualificationGapCopy } from '../lib/enquiry-qualification-gap-localization';
import { getEnquiryProgrammeMixCopy } from '../lib/enquiry-programme-mix-localization';
import { getRecentEnquiryStatusMixCopy } from '../lib/enquiry-recent-status-mix-localization';
import { getEnquiryStatusMixCopy } from '../lib/enquiry-status-mix-localization';
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
  const campaignLinkBuilderCopy = getCampaignLinkBuilderCopy(locale);
  const ageCopy = getEnquiryAgeCopy(locale);
  const unassignedAgeCopy = getUnassignedEnquiryAgeCopy(locale);
  const campaignCopy = getEnquiryCampaignReportingCopy(locale);
  const campaignMediumCopy = getEnquiryCampaignMediumCopy(locale);
  const campaignContentCopy = getEnquiryCampaignContentCopy(locale);
  const attributionCoverageCopy = getEnquiryAttributionCoverageCopy(locale);
  const landingPathCopy = getEnquiryLandingPathCopy(locale);
  const contactPreferenceCopy = getEnquiryContactPreferenceCopy(locale);
  const deliveryPreferenceCopy = getEnquiryDeliveryPreferenceCopy(locale);
  const timingPreferenceCopy = getEnquiryTimingPreferenceCopy(locale);
  const contactTurnaroundCopy = getEnquiryContactTurnaroundCopy(locale);
  const followUpTimingCopy = getEnquiryFollowUpTimingCopy(locale);
  const missingFollowUpAgeCopy = getMissingFollowUpPlanAgeCopy(locale);
  const incompleteQualificationAgeCopy =
    getIncompleteQualificationAgeCopy(locale);
  const unrecordedContactAgeCopy = getUnrecordedContactAgeCopy(locale);
  const outcomeCoverageCopy = getEnquiryOutcomeCoverageCopy(locale);
  const qualificationGapCopy = getEnquiryQualificationGapCopy(locale);
  const programmeMixCopy = getEnquiryProgrammeMixCopy(locale);
  const recentStatusMixCopy = getRecentEnquiryStatusMixCopy(locale);
  const statusMixCopy = getEnquiryStatusMixCopy(locale);
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
  const attributionCoverageLabel = (field: string) => {
    if (field === 'utmSource') return attributionCoverageCopy.utmSource;
    if (field === 'utmMedium') return attributionCoverageCopy.utmMedium;
    if (field === 'utmCampaign') return attributionCoverageCopy.utmCampaign;
    if (field === 'utmContent') return attributionCoverageCopy.utmContent;
    return attributionCoverageCopy.landingPath;
  };

  const contactTurnaround = (minutes: number | null) => {
    if (minutes === null) return contactTurnaroundCopy.noMedian;
    if (minutes < 60) return contactTurnaroundCopy.minutes(number(minutes));

    return contactTurnaroundCopy.hours(
      formatLocalizedNumber(minutes / 60, locale, {
        maximumFractionDigits: 1,
      }),
    );
  };
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
          <Link href={localizeHref(locale, '/campaign-links')}>
            <span>08</span> {campaignLinkBuilderCopy.title}
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
                    <Link
                      href={localizeHref(
                        locale,
                        `/enquiries?${buildEnquirySchoolQuery(item.school)}`,
                      )}
                    >
                      <span>{getAdminEnumLabel(locale, item.school)}</span>
                    </Link>
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
                  <article
                    key={`${item.programmeSlug}:${item.programmeTitleSnapshot}`}
                  >
                    <Link
                      href={localizeHref(
                        locale,
                        `/enquiries?${buildEnquiryProgrammeQuery({
                          programmeSlug: item.programmeSlug,
                          programmeTitleSnapshot: item.programmeTitleSnapshot,
                        })}`,
                      )}
                    >
                      <span dir="auto">{item.programmeTitleSnapshot}</span>
                    </Link>
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
                  {number(
                    operations.campaignEnquiryMixLast30Days.untaggedTotal,
                  )}
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
                {operations.campaignEnquiryMixLast30Days.sourceMix.map(
                  (item) => (
                    <article key={item.utmSource}>
                      <Link
                        href={localizeHref(
                          locale,
                          `/enquiries?${buildEnquiryCampaignAttributionQuery({
                            utmSource: item.utmSource,
                            utmCampaign: null,
                            utmMedium: null,
                            utmContent: null,
                          })}`,
                        )}
                      >
                        <span dir="auto">{item.utmSource}</span>
                      </Link>
                      <strong>{number(item.count)}</strong>
                      <small>
                        {campaignCopy.enquiryCount(number(item.count))}
                      </small>
                    </article>
                  ),
                )}
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
              <div
                className="metric-grid"
                aria-label={campaignCopy.campaignMix}
              >
                {operations.campaignEnquiryMixLast30Days.campaignMix.map(
                  (item) => (
                    <article key={`${item.utmSource}:${item.utmCampaign}`}>
                      <Link
                        href={localizeHref(
                          locale,
                          `/enquiries?${buildEnquiryCampaignAttributionQuery({
                            utmSource: item.utmSource,
                            utmCampaign: item.utmCampaign,
                            utmMedium: null,
                            utmContent: null,
                          })}`,
                        )}
                      >
                        <span dir="auto">
                          {campaignCopy.campaignPair(
                            item.utmSource,
                            item.utmCampaign,
                          )}
                        </span>
                      </Link>
                      <strong>{number(item.count)}</strong>
                      <small>
                        {campaignCopy.enquiryCount(number(item.count))}
                      </small>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p className="admin-empty">{campaignCopy.noCampaigns}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{campaignMediumCopy.eyebrow}</p>
                <h2>{campaignMediumCopy.title}</h2>
                <p>{campaignMediumCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div className="metric-grid" aria-label={campaignMediumCopy.title}>
              <article>
                <span>{campaignMediumCopy.recorded}</span>
                <strong>
                  {number(
                    operations.enquiryCampaignMediumMixLast30Days.recorded,
                  )}
                </strong>
                <small>
                  {campaignMediumCopy.count(
                    number(
                      operations.enquiryCampaignMediumMixLast30Days.recorded,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{campaignMediumCopy.missing}</span>
                <strong>
                  {number(
                    operations.enquiryCampaignMediumMixLast30Days.missing,
                  )}
                </strong>
                <small>
                  {campaignMediumCopy.count(
                    number(
                      operations.enquiryCampaignMediumMixLast30Days.missing,
                    ),
                  )}
                </small>
              </article>
            </div>
            <div className="panel-heading">
              <div>
                <h3>{campaignMediumCopy.topMedia}</h3>
              </div>
            </div>
            {operations.enquiryCampaignMediumMixLast30Days.items.length > 0 ? (
              <div
                className="metric-grid"
                aria-label={campaignMediumCopy.topMedia}
              >
                {operations.enquiryCampaignMediumMixLast30Days.items.map(
                  (item) => (
                    <article key={item.utmMedium}>
                      <Link
                        href={localizeHref(
                          locale,
                          `/enquiries?${buildEnquiryCampaignAttributionQuery({
                            utmSource: null,
                            utmCampaign: null,
                            utmMedium: item.utmMedium,
                            utmContent: null,
                          })}`,
                        )}
                      >
                        <span dir="auto">{item.utmMedium}</span>
                      </Link>
                      <strong>{number(item.count)}</strong>
                      <small>
                        {campaignMediumCopy.count(number(item.count))}
                      </small>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p className="admin-empty">{campaignMediumCopy.noMedia}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{campaignContentCopy.eyebrow}</p>
                <h2>{campaignContentCopy.title}</h2>
                <p>{campaignContentCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div className="metric-grid" aria-label={campaignContentCopy.title}>
              <article>
                <span>{campaignContentCopy.recorded}</span>
                <strong>
                  {number(
                    operations.enquiryCampaignContentMixLast30Days.recorded,
                  )}
                </strong>
                <small>
                  {campaignContentCopy.count(
                    number(
                      operations.enquiryCampaignContentMixLast30Days.recorded,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{campaignContentCopy.missing}</span>
                <strong>
                  {number(
                    operations.enquiryCampaignContentMixLast30Days.missing,
                  )}
                </strong>
                <small>
                  {campaignContentCopy.count(
                    number(
                      operations.enquiryCampaignContentMixLast30Days.missing,
                    ),
                  )}
                </small>
              </article>
            </div>
            <div className="panel-heading">
              <div>
                <h3>{campaignContentCopy.topContent}</h3>
              </div>
            </div>
            {operations.enquiryCampaignContentMixLast30Days.items.length > 0 ? (
              <div
                className="metric-grid"
                aria-label={campaignContentCopy.topContent}
              >
                {operations.enquiryCampaignContentMixLast30Days.items.map(
                  (item) => (
                    <article key={item.utmContent}>
                      <Link
                        href={localizeHref(
                          locale,
                          `/enquiries?${buildEnquiryCampaignAttributionQuery({
                            utmSource: null,
                            utmCampaign: null,
                            utmMedium: null,
                            utmContent: item.utmContent,
                          })}`,
                        )}
                      >
                        <span dir="auto">{item.utmContent}</span>
                      </Link>
                      <strong>{number(item.count)}</strong>
                      <small>
                        {campaignContentCopy.count(number(item.count))}
                      </small>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p className="admin-empty">{campaignContentCopy.noContent}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{attributionCoverageCopy.eyebrow}</p>
                <h2>{attributionCoverageCopy.title}</h2>
                <p>{attributionCoverageCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div
              className="metric-grid"
              aria-label={attributionCoverageCopy.title}
            >
              {operations.enquiryAttributionCoverageLast30Days.items.map(
                (item) => (
                  <article key={item.field}>
                    <span>{attributionCoverageLabel(item.field)}</span>
                    <strong>{percent(item.percent)}</strong>
                    <small>
                      {attributionCoverageCopy.recordedOfTotal(
                        number(item.recorded),
                        number(
                          operations.enquiryAttributionCoverageLast30Days.total,
                        ),
                      )}
                    </small>
                  </article>
                ),
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{landingPathCopy.eyebrow}</p>
                <h2>{landingPathCopy.title}</h2>
                <p>{landingPathCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div className="metric-grid" aria-label={landingPathCopy.title}>
              <article>
                <span>{landingPathCopy.recorded}</span>
                <strong>
                  {number(operations.enquiryLandingPathMixLast30Days.recorded)}
                </strong>
                <small>
                  {landingPathCopy.count(
                    number(operations.enquiryLandingPathMixLast30Days.recorded),
                  )}
                </small>
              </article>
              <article>
                <span>{landingPathCopy.missing}</span>
                <strong>
                  {number(operations.enquiryLandingPathMixLast30Days.missing)}
                </strong>
                <small>
                  {landingPathCopy.count(
                    number(operations.enquiryLandingPathMixLast30Days.missing),
                  )}
                </small>
              </article>
            </div>
            <div className="panel-heading">
              <div>
                <h3>{landingPathCopy.topPaths}</h3>
              </div>
            </div>
            {operations.enquiryLandingPathMixLast30Days.items.length > 0 ? (
              <div
                className="metric-grid"
                aria-label={landingPathCopy.topPaths}
              >
                {operations.enquiryLandingPathMixLast30Days.items.map(
                  (item) => (
                    <article key={item.landingPath}>
                      <Link
                        href={localizeHref(
                          locale,
                          `/enquiries?${buildEnquiryLandingPathQuery(item.landingPath)}`,
                        )}
                      >
                        <span dir="ltr">{item.landingPath}</span>
                      </Link>
                      <strong>{number(item.count)}</strong>
                      <small>{landingPathCopy.count(number(item.count))}</small>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p className="admin-empty">{landingPathCopy.noPaths}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{recentStatusMixCopy.eyebrow}</p>
                <h2>{recentStatusMixCopy.title}</h2>
                <p>{recentStatusMixCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            {operations.enquiryRecentStatusMixLast30Days.items.length > 0 ? (
              <div
                className="metric-grid"
                aria-label={recentStatusMixCopy.title}
              >
                {operations.enquiryRecentStatusMixLast30Days.items.map(
                  (item) => (
                    <article key={item.status}>
                      <span>{getAdminEnumLabel(locale, item.status)}</span>
                      <strong>{number(item.count)}</strong>
                      <small>
                        {recentStatusMixCopy.count(number(item.count))}
                      </small>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p className="admin-empty">{recentStatusMixCopy.noData}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{qualificationGapCopy.eyebrow}</p>
                <h2>{qualificationGapCopy.title}</h2>
                <p>{qualificationGapCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div
              className="metric-grid"
              aria-label={qualificationGapCopy.title}
            >
              <article>
                <span>{qualificationGapCopy.activeTotal}</span>
                <strong>
                  {number(
                    operations.enquiryQualificationGapsLast30Days.activeTotal,
                  )}
                </strong>
                <small>{copy.dashboard.rollingThirtyDays}</small>
              </article>
              <article>
                <span>{qualificationGapCopy.city}</span>
                <strong>
                  {number(
                    operations.enquiryQualificationGapsLast30Days.cityMissing,
                  )}
                </strong>
                <small>
                  {qualificationGapCopy.count(
                    number(
                      operations.enquiryQualificationGapsLast30Days.cityMissing,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{qualificationGapCopy.preferredContact}</span>
                <strong>
                  {number(
                    operations.enquiryQualificationGapsLast30Days
                      .preferredContactMissing,
                  )}
                </strong>
                <small>
                  {qualificationGapCopy.count(
                    number(
                      operations.enquiryQualificationGapsLast30Days
                        .preferredContactMissing,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{qualificationGapCopy.deliveryPreference}</span>
                <strong>
                  {number(
                    operations.enquiryQualificationGapsLast30Days
                      .deliveryPreferenceMissing,
                  )}
                </strong>
                <small>
                  {qualificationGapCopy.count(
                    number(
                      operations.enquiryQualificationGapsLast30Days
                        .deliveryPreferenceMissing,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{qualificationGapCopy.timingPreference}</span>
                <strong>
                  {number(
                    operations.enquiryQualificationGapsLast30Days
                      .timingPreferenceMissing,
                  )}
                </strong>
                <small>
                  {qualificationGapCopy.count(
                    number(
                      operations.enquiryQualificationGapsLast30Days
                        .timingPreferenceMissing,
                    ),
                  )}
                </small>
              </article>
            </div>
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

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{contactPreferenceCopy.eyebrow}</p>
                <h2>{contactPreferenceCopy.title}</h2>
                <p>{contactPreferenceCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div
              className="metric-grid"
              aria-label={contactPreferenceCopy.title}
            >
              <article>
                <span>{contactPreferenceCopy.missing}</span>
                <strong>
                  {number(
                    operations.enquiryContactPreferenceMixLast30Days.missing,
                  )}
                </strong>
                <small>
                  {contactPreferenceCopy.count(
                    number(
                      operations.enquiryContactPreferenceMixLast30Days.missing,
                    ),
                  )}
                </small>
              </article>
              {operations.enquiryContactPreferenceMixLast30Days.items.map(
                (item) => (
                  <article key={item.preferredContact}>
                    <Link
                      href={localizeHref(
                        locale,
                        `/enquiries?${buildEnquiryContactPreferenceQuery(
                          item.preferredContact,
                        )}`,
                      )}
                    >
                      <span>
                        {item.preferredContact === 'EMAIL'
                          ? contactPreferenceCopy.email
                          : item.preferredContact === 'PHONE'
                            ? contactPreferenceCopy.phone
                            : contactPreferenceCopy.whatsapp}
                      </span>
                    </Link>
                    <strong>{number(item.count)}</strong>
                    <small>
                      {contactPreferenceCopy.count(number(item.count))}
                    </small>
                  </article>
                ),
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{deliveryPreferenceCopy.eyebrow}</p>
                <h2>{deliveryPreferenceCopy.title}</h2>
                <p>{deliveryPreferenceCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div
              className="metric-grid"
              aria-label={deliveryPreferenceCopy.title}
            >
              <article>
                <span>{deliveryPreferenceCopy.missing}</span>
                <strong>
                  {number(
                    operations.enquiryDeliveryPreferenceMixLast30Days.missing,
                  )}
                </strong>
                <small>
                  {deliveryPreferenceCopy.count(
                    number(
                      operations.enquiryDeliveryPreferenceMixLast30Days.missing,
                    ),
                  )}
                </small>
              </article>
              {operations.enquiryDeliveryPreferenceMixLast30Days.items.map(
                (item) => (
                  <article key={item.deliveryPreference}>
                    <Link
                      href={localizeHref(
                        locale,
                        `/enquiries?${buildEnquiryDeliveryPreferenceQuery(
                          item.deliveryPreference,
                        )}`,
                      )}
                    >
                      <span>
                        {item.deliveryPreference === 'IN_PERSON'
                          ? deliveryPreferenceCopy.inPerson
                          : item.deliveryPreference === 'ONLINE'
                            ? deliveryPreferenceCopy.online
                            : item.deliveryPreference === 'FLEXIBLE'
                              ? deliveryPreferenceCopy.flexible
                              : deliveryPreferenceCopy.notSure}
                      </span>
                    </Link>
                    <strong>{number(item.count)}</strong>
                    <small>
                      {deliveryPreferenceCopy.count(number(item.count))}
                    </small>
                  </article>
                ),
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{timingPreferenceCopy.eyebrow}</p>
                <h2>{timingPreferenceCopy.title}</h2>
                <p>{timingPreferenceCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div
              className="metric-grid"
              aria-label={timingPreferenceCopy.title}
            >
              <article>
                <span>{timingPreferenceCopy.missing}</span>
                <strong>
                  {number(
                    operations.enquiryTimingPreferenceMixLast30Days.missing,
                  )}
                </strong>
                <small>
                  {timingPreferenceCopy.count(
                    number(
                      operations.enquiryTimingPreferenceMixLast30Days.missing,
                    ),
                  )}
                </small>
              </article>
              {operations.enquiryTimingPreferenceMixLast30Days.items.map(
                (item) => (
                  <article key={item.timingPreference}>
                    <Link
                      href={localizeHref(
                        locale,
                        `/enquiries?${buildEnquiryTimingPreferenceQuery(
                          item.timingPreference,
                        )}`,
                      )}
                    >
                      <span>
                        {item.timingPreference === 'SOON'
                          ? timingPreferenceCopy.soon
                          : item.timingPreference === 'WITHIN_MONTH'
                            ? timingPreferenceCopy.withinMonth
                            : item.timingPreference === 'LATER'
                              ? timingPreferenceCopy.later
                              : timingPreferenceCopy.notSure}
                      </span>
                    </Link>
                    <strong>{number(item.count)}</strong>
                    <small>
                      {timingPreferenceCopy.count(number(item.count))}
                    </small>
                  </article>
                ),
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{outcomeCoverageCopy.eyebrow}</p>
                <h2>{outcomeCoverageCopy.title}</h2>
                <p>{outcomeCoverageCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div className="metric-grid" aria-label={outcomeCoverageCopy.title}>
              <article>
                <span>{outcomeCoverageCopy.recorded}</span>
                <strong>
                  {number(
                    operations.enquiryOutcomeCoverageLast30Days.recordedTotal,
                  )}
                </strong>
                <small>{outcomeCoverageCopy.recordedNote}</small>
              </article>
              <article>
                <span>{outcomeCoverageCopy.missing}</span>
                <strong>
                  {number(
                    operations.enquiryOutcomeCoverageLast30Days.missingTotal,
                  )}
                </strong>
                <small>{outcomeCoverageCopy.missingNote}</small>
              </article>
              <article>
                <span>{outcomeCoverageCopy.coverage}</span>
                <strong>
                  {percent(
                    operations.enquiryOutcomeCoverageLast30Days.coveragePercent,
                  )}
                </strong>
                <small>
                  {outcomeCoverageCopy.recordedOfClosed(
                    number(
                      operations.enquiryOutcomeCoverageLast30Days.recordedTotal,
                    ),
                    number(
                      operations.enquiryOutcomeCoverageLast30Days.closedTotal,
                    ),
                  )}{' '}
                  · {outcomeCoverageCopy.coverageNote}
                </small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{contactTurnaroundCopy.eyebrow}</p>
                <h2>{contactTurnaroundCopy.title}</h2>
                <p>{contactTurnaroundCopy.intro}</p>
              </div>
              <span>{copy.dashboard.rollingThirtyDays}</span>
            </div>
            <div
              className="metric-grid"
              aria-label={contactTurnaroundCopy.title}
            >
              <article>
                <span>{contactTurnaroundCopy.contacted}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.contacted,
                  )}
                </strong>
                <small>{contactTurnaroundCopy.contactedNote}</small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.uncontacted}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.uncontacted,
                  )}
                </strong>
                <small>{contactTurnaroundCopy.uncontactedNote}</small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.median}</span>
                <strong>
                  {contactTurnaround(
                    operations.enquiryContactTurnaroundLast30Days.medianMinutes,
                  )}
                </strong>
                <small>{contactTurnaroundCopy.medianNote}</small>
              </article>
            </div>
            <div className="panel-heading">
              <div>
                <h3>{contactTurnaroundCopy.bucketsTitle}</h3>
              </div>
            </div>
            <div
              className="metric-grid"
              aria-label={contactTurnaroundCopy.bucketsTitle}
            >
              <article>
                <span>{contactTurnaroundCopy.underOneHour}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.buckets
                      .underOneHour,
                  )}
                </strong>
                <small>
                  {contactTurnaroundCopy.recordedCount(
                    number(
                      operations.enquiryContactTurnaroundLast30Days.buckets
                        .underOneHour,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.oneToFourHours}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.buckets
                      .oneToFourHours,
                  )}
                </strong>
                <small>
                  {contactTurnaroundCopy.recordedCount(
                    number(
                      operations.enquiryContactTurnaroundLast30Days.buckets
                        .oneToFourHours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.fourToTwentyFourHours}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.buckets
                      .fourToTwentyFourHours,
                  )}
                </strong>
                <small>
                  {contactTurnaroundCopy.recordedCount(
                    number(
                      operations.enquiryContactTurnaroundLast30Days.buckets
                        .fourToTwentyFourHours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{contactTurnaroundCopy.overTwentyFourHours}</span>
                <strong>
                  {number(
                    operations.enquiryContactTurnaroundLast30Days.buckets
                      .overTwentyFourHours,
                  )}
                </strong>
                <small>
                  {contactTurnaroundCopy.recordedCount(
                    number(
                      operations.enquiryContactTurnaroundLast30Days.buckets
                        .overTwentyFourHours,
                    ),
                  )}
                </small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{ageCopy.eyebrow}</p>
                <h2>{ageCopy.title}</h2>
                <p>{ageCopy.intro}</p>
              </div>
              <span>{number(operations.activeEnquiryAge.activeTotal)}</span>
            </div>
            <div className="metric-grid" aria-label={ageCopy.title}>
              <article>
                <span>{ageCopy.under24Hours}</span>
                <strong>
                  {number(operations.activeEnquiryAge.buckets.under24Hours)}
                </strong>
                <small>
                  {ageCopy.count(
                    number(operations.activeEnquiryAge.buckets.under24Hours),
                  )}
                </small>
              </article>
              <article>
                <span>{ageCopy.oneToThreeDays}</span>
                <strong>
                  {number(operations.activeEnquiryAge.buckets.oneToThreeDays)}
                </strong>
                <small>
                  {ageCopy.count(
                    number(operations.activeEnquiryAge.buckets.oneToThreeDays),
                  )}
                </small>
              </article>
              <article>
                <span>{ageCopy.fourToSevenDays}</span>
                <strong>
                  {number(operations.activeEnquiryAge.buckets.fourToSevenDays)}
                </strong>
                <small>
                  {ageCopy.count(
                    number(operations.activeEnquiryAge.buckets.fourToSevenDays),
                  )}
                </small>
              </article>
              <article>
                <span>{ageCopy.overSevenDays}</span>
                <strong>
                  {number(operations.activeEnquiryAge.buckets.overSevenDays)}
                </strong>
                <small>
                  {ageCopy.count(
                    number(operations.activeEnquiryAge.buckets.overSevenDays),
                  )}
                </small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{unassignedAgeCopy.eyebrow}</p>
                <h2>{unassignedAgeCopy.title}</h2>
                <p>{unassignedAgeCopy.intro}</p>
              </div>
              <span>
                {number(operations.unassignedActiveEnquiryAge.activeTotal)}
              </span>
            </div>
            <div className="metric-grid" aria-label={unassignedAgeCopy.title}>
              <article>
                <span>{unassignedAgeCopy.under24Hours}</span>
                <strong>
                  {number(
                    operations.unassignedActiveEnquiryAge.buckets.under24Hours,
                  )}
                </strong>
                <small>
                  {unassignedAgeCopy.count(
                    number(
                      operations.unassignedActiveEnquiryAge.buckets
                        .under24Hours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{unassignedAgeCopy.oneToThreeDays}</span>
                <strong>
                  {number(
                    operations.unassignedActiveEnquiryAge.buckets
                      .oneToThreeDays,
                  )}
                </strong>
                <small>
                  {unassignedAgeCopy.count(
                    number(
                      operations.unassignedActiveEnquiryAge.buckets
                        .oneToThreeDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{unassignedAgeCopy.fourToSevenDays}</span>
                <strong>
                  {number(
                    operations.unassignedActiveEnquiryAge.buckets
                      .fourToSevenDays,
                  )}
                </strong>
                <small>
                  {unassignedAgeCopy.count(
                    number(
                      operations.unassignedActiveEnquiryAge.buckets
                        .fourToSevenDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{unassignedAgeCopy.overSevenDays}</span>
                <strong>
                  {number(
                    operations.unassignedActiveEnquiryAge.buckets.overSevenDays,
                  )}
                </strong>
                <small>
                  {unassignedAgeCopy.count(
                    number(
                      operations.unassignedActiveEnquiryAge.buckets
                        .overSevenDays,
                    ),
                  )}
                </small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{missingFollowUpAgeCopy.eyebrow}</p>
                <h2>{missingFollowUpAgeCopy.title}</h2>
                <p>{missingFollowUpAgeCopy.intro}</p>
              </div>
              <span>
                {number(operations.missingFollowUpPlanAge.activeTotal)}
              </span>
            </div>
            <div
              className="metric-grid"
              aria-label={missingFollowUpAgeCopy.title}
            >
              <article>
                <span>{missingFollowUpAgeCopy.under24Hours}</span>
                <strong>
                  {number(
                    operations.missingFollowUpPlanAge.buckets.under24Hours,
                  )}
                </strong>
                <small>
                  {missingFollowUpAgeCopy.count(
                    number(
                      operations.missingFollowUpPlanAge.buckets.under24Hours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{missingFollowUpAgeCopy.oneToThreeDays}</span>
                <strong>
                  {number(
                    operations.missingFollowUpPlanAge.buckets.oneToThreeDays,
                  )}
                </strong>
                <small>
                  {missingFollowUpAgeCopy.count(
                    number(
                      operations.missingFollowUpPlanAge.buckets.oneToThreeDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{missingFollowUpAgeCopy.fourToSevenDays}</span>
                <strong>
                  {number(
                    operations.missingFollowUpPlanAge.buckets.fourToSevenDays,
                  )}
                </strong>
                <small>
                  {missingFollowUpAgeCopy.count(
                    number(
                      operations.missingFollowUpPlanAge.buckets.fourToSevenDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{missingFollowUpAgeCopy.overSevenDays}</span>
                <strong>
                  {number(
                    operations.missingFollowUpPlanAge.buckets.overSevenDays,
                  )}
                </strong>
                <small>
                  {missingFollowUpAgeCopy.count(
                    number(
                      operations.missingFollowUpPlanAge.buckets.overSevenDays,
                    ),
                  )}
                </small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">
                  {incompleteQualificationAgeCopy.eyebrow}
                </p>
                <h2>{incompleteQualificationAgeCopy.title}</h2>
                <p>{incompleteQualificationAgeCopy.intro}</p>
              </div>
              <span>
                {number(operations.incompleteQualificationAge.activeTotal)}
              </span>
            </div>
            <div
              className="metric-grid"
              aria-label={incompleteQualificationAgeCopy.title}
            >
              <article>
                <span>{incompleteQualificationAgeCopy.under24Hours}</span>
                <strong>
                  {number(
                    operations.incompleteQualificationAge.buckets.under24Hours,
                  )}
                </strong>
                <small>
                  {incompleteQualificationAgeCopy.count(
                    number(
                      operations.incompleteQualificationAge.buckets
                        .under24Hours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{incompleteQualificationAgeCopy.oneToThreeDays}</span>
                <strong>
                  {number(
                    operations.incompleteQualificationAge.buckets
                      .oneToThreeDays,
                  )}
                </strong>
                <small>
                  {incompleteQualificationAgeCopy.count(
                    number(
                      operations.incompleteQualificationAge.buckets
                        .oneToThreeDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{incompleteQualificationAgeCopy.fourToSevenDays}</span>
                <strong>
                  {number(
                    operations.incompleteQualificationAge.buckets
                      .fourToSevenDays,
                  )}
                </strong>
                <small>
                  {incompleteQualificationAgeCopy.count(
                    number(
                      operations.incompleteQualificationAge.buckets
                        .fourToSevenDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{incompleteQualificationAgeCopy.overSevenDays}</span>
                <strong>
                  {number(
                    operations.incompleteQualificationAge.buckets.overSevenDays,
                  )}
                </strong>
                <small>
                  {incompleteQualificationAgeCopy.count(
                    number(
                      operations.incompleteQualificationAge.buckets
                        .overSevenDays,
                    ),
                  )}
                </small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{unrecordedContactAgeCopy.eyebrow}</p>
                <h2>{unrecordedContactAgeCopy.title}</h2>
                <p>{unrecordedContactAgeCopy.intro}</p>
              </div>
              <span>{number(operations.unrecordedContactAge.activeTotal)}</span>
            </div>
            <div
              className="metric-grid"
              aria-label={unrecordedContactAgeCopy.title}
            >
              <article>
                <span>{unrecordedContactAgeCopy.under24Hours}</span>
                <strong>
                  {number(operations.unrecordedContactAge.buckets.under24Hours)}
                </strong>
                <small>
                  {unrecordedContactAgeCopy.count(
                    number(
                      operations.unrecordedContactAge.buckets.under24Hours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{unrecordedContactAgeCopy.oneToThreeDays}</span>
                <strong>
                  {number(
                    operations.unrecordedContactAge.buckets.oneToThreeDays,
                  )}
                </strong>
                <small>
                  {unrecordedContactAgeCopy.count(
                    number(
                      operations.unrecordedContactAge.buckets.oneToThreeDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{unrecordedContactAgeCopy.fourToSevenDays}</span>
                <strong>
                  {number(
                    operations.unrecordedContactAge.buckets.fourToSevenDays,
                  )}
                </strong>
                <small>
                  {unrecordedContactAgeCopy.count(
                    number(
                      operations.unrecordedContactAge.buckets.fourToSevenDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{unrecordedContactAgeCopy.overSevenDays}</span>
                <strong>
                  {number(
                    operations.unrecordedContactAge.buckets.overSevenDays,
                  )}
                </strong>
                <small>
                  {unrecordedContactAgeCopy.count(
                    number(
                      operations.unrecordedContactAge.buckets.overSevenDays,
                    ),
                  )}
                </small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{followUpTimingCopy.eyebrow}</p>
                <h2>{followUpTimingCopy.title}</h2>
                <p>{followUpTimingCopy.intro}</p>
              </div>
              <span>
                {number(operations.activeEnquiryFollowUpTiming.activeTotal)}
              </span>
            </div>
            <div className="metric-grid" aria-label={followUpTimingCopy.title}>
              <article>
                <span>{followUpTimingCopy.missingPlan}</span>
                <strong>
                  {number(
                    operations.activeEnquiryFollowUpTiming.buckets.missingPlan,
                  )}
                </strong>
                <small>
                  {followUpTimingCopy.count(
                    number(
                      operations.activeEnquiryFollowUpTiming.buckets
                        .missingPlan,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{followUpTimingCopy.pastDue}</span>
                <strong>
                  {number(
                    operations.activeEnquiryFollowUpTiming.buckets.pastDue,
                  )}
                </strong>
                <small>
                  {followUpTimingCopy.count(
                    number(
                      operations.activeEnquiryFollowUpTiming.buckets.pastDue,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{followUpTimingCopy.next24Hours}</span>
                <strong>
                  {number(
                    operations.activeEnquiryFollowUpTiming.buckets.next24Hours,
                  )}
                </strong>
                <small>
                  {followUpTimingCopy.count(
                    number(
                      operations.activeEnquiryFollowUpTiming.buckets
                        .next24Hours,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{followUpTimingCopy.oneToThreeDays}</span>
                <strong>
                  {number(
                    operations.activeEnquiryFollowUpTiming.buckets
                      .oneToThreeDays,
                  )}
                </strong>
                <small>
                  {followUpTimingCopy.count(
                    number(
                      operations.activeEnquiryFollowUpTiming.buckets
                        .oneToThreeDays,
                    ),
                  )}
                </small>
              </article>
              <article>
                <span>{followUpTimingCopy.later}</span>
                <strong>
                  {number(operations.activeEnquiryFollowUpTiming.buckets.later)}
                </strong>
                <small>
                  {followUpTimingCopy.count(
                    number(
                      operations.activeEnquiryFollowUpTiming.buckets.later,
                    ),
                  )}
                </small>
              </article>
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{statusMixCopy.eyebrow}</p>
                <h2>{statusMixCopy.title}</h2>
                <p>{statusMixCopy.intro}</p>
              </div>
              <span>
                {number(operations.activeEnquiryStatusMix.activeTotal)}
              </span>
            </div>
            {operations.activeEnquiryStatusMix.items.length > 0 ? (
              <div className="metric-grid" aria-label={statusMixCopy.title}>
                {operations.activeEnquiryStatusMix.items.map((item) => (
                  <article key={item.status}>
                    <span>{getAdminEnumLabel(locale, item.status)}</span>
                    <strong>{number(item.count)}</strong>
                    <small>{statusMixCopy.count(number(item.count))}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{statusMixCopy.noData}</p>
            )}
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
