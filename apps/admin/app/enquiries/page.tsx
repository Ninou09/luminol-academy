import { requirePermission } from '@luminol/auth';
import { db, type Prisma } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminEnumLabel } from '../../lib/admin-localization';
import { getEnquiryAttributionCopy } from '../../lib/enquiry-attribution-localization';
import { getEnquiryCampaignFilterCopy } from '../../lib/enquiry-campaign-filter-localization';
import { getEnquiryLandingPathFilterCopy } from '../../lib/enquiry-landing-path-filter-localization';
import { getEnquirySchoolFilterCopy } from '../../lib/enquiry-school-filter-localization';
import { getEnquiryContactPreferenceFilterCopy } from '../../lib/enquiry-contact-preference-filter-localization';
import { getEnquiryDeliveryPreferenceFilterCopy } from '../../lib/enquiry-delivery-preference-filter-localization';
import { getEnquiryTimingPreferenceFilterCopy } from '../../lib/enquiry-timing-preference-filter-localization';
import {
  getEnquiryCampaignAttributionWhere,
  parseEnquiryCampaignAttributionFilter,
  type EnquiryCampaignAttributionFilter,
} from '../../lib/enquiry-campaign-filter';
import {
  getEnquiryLandingPathWhere,
  parseEnquiryLandingPathFilter,
} from '../../lib/enquiry-landing-path-filter';
import {
  getEnquirySchoolWhere,
  parseEnquirySchoolFilter,
  type EnquirySchoolValue,
} from '../../lib/enquiry-school-filter';
import {
  getEnquiryContactPreferenceWhere,
  parseEnquiryContactPreferenceFilter,
  type EnquiryContactPreference,
} from '../../lib/enquiry-contact-preference-filter';
import {
  getEnquiryDeliveryPreferenceWhere,
  parseEnquiryDeliveryPreferenceFilter,
  type EnquiryDeliveryPreference,
} from '../../lib/enquiry-delivery-preference-filter';
import {
  getEnquiryTimingPreferenceWhere,
  parseEnquiryTimingPreferenceFilter,
  type EnquiryTimingPreference,
} from '../../lib/enquiry-timing-preference-filter';
import { getEnquiryContactShortcutsCopy } from '../../lib/enquiry-contact-shortcuts-localization';
import { buildEnquiryContactShortcuts } from '../../lib/enquiry-contact-shortcuts';
import {
  buildEnquiryAuditTimeline,
  ENQUIRY_AUDIT_RELATION_LIMIT,
} from '../../lib/enquiry-audit-history';
import {
  getIncompleteQualificationAttentionLabel,
  getNoRecordedContactAttentionCopy,
} from '../../lib/enquiry-attention-localization';
import {
  ACTIVE_INCOMPLETE_QUALIFICATION_WHERE,
  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,
  ACTIVE_WITHOUT_FOLLOW_UP_WHERE,
  ACTIVE_WITHOUT_RECORDED_CONTACT_WHERE,
  CLOSED_WITHOUT_OUTCOME_WHERE,
  getEnquiryAttentionWhere,
  parseEnquiryAttentionFilter,
  type EnquiryAttentionFilter,
} from '../../lib/enquiry-attention';
import {
  getEnquiryOwnerWhere,
  parseEnquiryOwnerFilter,
  type EnquiryOwnerFilter,
} from '../../lib/enquiry-owner-filter';
import { buildEnquiryFirstResponseSteps } from '../../lib/enquiry-first-response';
import {
  getEnquiryAuditActionLabel,
  getEnquiryContactPreferenceLabel,
  getEnquiryDeliveryPreferenceLabel,
  getEnquiryDeskCopy,
  getEnquiryFirstResponseStepLabel,
  getEnquiryTimingPreferenceLabel,
} from '../../lib/enquiry-desk-localization';
import {
  displayPersonName,
  enquiryStatuses,
  getEnquiryTransitions,
  type EnquiryStatusValue,
} from '../../lib/operations';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  transitionEnquiryStatus,
  updateEnquiryFollowUpPlan,
  updateEnquiryOutcome,
  updateEnquiryOwnership,
} from './actions';
import styles from './page.module.css';

type FollowUpFilter = 'due-today' | 'overdue';

type EnquiryPageProps = {
  searchParams?: Promise<{
    status?: string | string[] | undefined;
    followUp?: string | string[] | undefined;
    attention?: string | string[] | undefined;
    owner?: string | string[] | undefined;
    utmSource?: string | string[] | undefined;
    utmCampaign?: string | string[] | undefined;
    utmMedium?: string | string[] | undefined;
    utmContent?: string | string[] | undefined;
    landingPath?: string | string[] | undefined;
    school?: string | string[] | undefined;
    preferredContact?: string | string[] | undefined;
    deliveryPreference?: string | string[] | undefined;
    timingPreference?: string | string[] | undefined;
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(
  value: string | string[] | undefined,
): EnquiryStatusValue | null {
  const candidate = firstParam(value);
  if (!candidate) return null;

  return (enquiryStatuses as readonly string[]).includes(candidate)
    ? (candidate as EnquiryStatusValue)
    : null;
}

function parseFollowUp(
  value: string | string[] | undefined,
): FollowUpFilter | null {
  const candidate = firstParam(value);
  return candidate === 'due-today' || candidate === 'overdue'
    ? candidate
    : null;
}

function buildEnquiryHref(
  locale: Locale,
  status: EnquiryStatusValue | null,
  followUp: FollowUpFilter | null,
  attention: EnquiryAttentionFilter | null,
  owner: EnquiryOwnerFilter | null,
  campaignAttribution: EnquiryCampaignAttributionFilter | null = null,
  landingPath: string | null = null,
  school: EnquirySchoolValue | null = null,
  preferredContact: EnquiryContactPreference | null = null,
  deliveryPreference: EnquiryDeliveryPreference | null = null,
  timingPreference: EnquiryTimingPreference | null = null,
) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (followUp) query.set('followUp', followUp);
  if (attention) query.set('attention', attention);
  if (owner) query.set('owner', owner);
  if (campaignAttribution) {
    query.set('utmSource', campaignAttribution.utmSource);
    if (campaignAttribution.utmCampaign) {
      query.set('utmCampaign', campaignAttribution.utmCampaign);
    }
    if (campaignAttribution.utmMedium) {
      query.set('utmMedium', campaignAttribution.utmMedium);
    }
    if (campaignAttribution.utmContent) {
      query.set('utmContent', campaignAttribution.utmContent);
    }
  }
  if (landingPath) query.set('landingPath', landingPath);
  if (school) query.set('school', school);
  if (preferredContact) query.set('preferredContact', preferredContact);
  if (deliveryPreference) query.set('deliveryPreference', deliveryPreference);
  if (timingPreference) query.set('timingPreference', timingPreference);
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return localizeHref(locale, `/enquiries${suffix}`);
}

function dateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : '';
}

export default async function EnquiriesAdminPage({
  searchParams,
}: EnquiryPageProps) {
  const administrator = await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getEnquiryDeskCopy(locale);
  const attributionCopy = getEnquiryAttributionCopy(locale);
  const campaignFilterCopy = getEnquiryCampaignFilterCopy(locale);
  const landingPathFilterCopy = getEnquiryLandingPathFilterCopy(locale);
  const schoolFilterCopy = getEnquirySchoolFilterCopy(locale);
  const contactPreferenceFilterCopy =
    getEnquiryContactPreferenceFilterCopy(locale);
  const deliveryPreferenceFilterCopy =
    getEnquiryDeliveryPreferenceFilterCopy(locale);
  const timingPreferenceFilterCopy =
    getEnquiryTimingPreferenceFilterCopy(locale);
  const contactShortcutsCopy = getEnquiryContactShortcutsCopy(locale);
  const incompleteQualificationLabel =
    getIncompleteQualificationAttentionLabel(locale);
  const noRecordedContactCopy = getNoRecordedContactAttentionCopy(locale);
  const common = getCommonDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const activeStatus = parseStatus(params?.status);
  const activeFollowUp = parseFollowUp(params?.followUp);
  const activeAttention = parseEnquiryAttentionFilter(params?.attention);
  const activeOwner = parseEnquiryOwnerFilter(params?.owner);
  const activeCampaignAttribution = parseEnquiryCampaignAttributionFilter(
    params?.utmSource,
    params?.utmCampaign,
    params?.utmMedium,
    params?.utmContent,
  );
  const activeLandingPath = parseEnquiryLandingPathFilter(params?.landingPath);
  const activeSchool = parseEnquirySchoolFilter(params?.school);
  const activeContactPreference = parseEnquiryContactPreferenceFilter(
    params?.preferredContact,
  );
  const activeDeliveryPreference = parseEnquiryDeliveryPreferenceFilter(
    params?.deliveryPreference,
  );
  const activeTimingPreference = parseEnquiryTimingPreferenceFilter(
    params?.timingPreference,
  );
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const tomorrowUtc = new Date(todayUtc.getTime() + 86_400_000);
  const filters: Prisma.EnquiryWhereInput[] = [];
  if (activeStatus) filters.push({ status: activeStatus });
  if (activeFollowUp === 'overdue') {
    filters.push({ nextFollowUpAt: { lt: todayUtc } });
  } else if (activeFollowUp === 'due-today') {
    filters.push({ nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } });
  }
  const attentionWhere = getEnquiryAttentionWhere(activeAttention);
  if (attentionWhere) filters.push(attentionWhere);
  const ownerWhere = getEnquiryOwnerWhere(activeOwner, administrator.id);
  if (ownerWhere) filters.push(ownerWhere);
  const campaignAttributionWhere = getEnquiryCampaignAttributionWhere(
    activeCampaignAttribution,
  );
  if (campaignAttributionWhere) filters.push(campaignAttributionWhere);
  const landingPathWhere = getEnquiryLandingPathWhere(activeLandingPath);
  if (landingPathWhere) filters.push(landingPathWhere);
  const schoolWhere = getEnquirySchoolWhere(activeSchool);
  if (schoolWhere) filters.push(schoolWhere);
  const contactPreferenceWhere = getEnquiryContactPreferenceWhere(
    activeContactPreference,
  );
  if (contactPreferenceWhere) filters.push(contactPreferenceWhere);
  const deliveryPreferenceWhere = getEnquiryDeliveryPreferenceWhere(
    activeDeliveryPreference,
  );
  if (deliveryPreferenceWhere) filters.push(deliveryPreferenceWhere);
  const timingPreferenceWhere = getEnquiryTimingPreferenceWhere(
    activeTimingPreference,
  );
  if (timingPreferenceWhere) filters.push(timingPreferenceWhere);
  const enquiryWhere = filters.length > 0 ? { AND: filters } : null;
  const hrefFor = (
    status: EnquiryStatusValue | null,
    followUp: FollowUpFilter | null,
    attention: EnquiryAttentionFilter | null,
    owner: EnquiryOwnerFilter | null,
  ) =>
    buildEnquiryHref(
      locale,
      status,
      followUp,
      attention,
      owner,
      activeCampaignAttribution,
      activeLandingPath,
      activeSchool,
      activeContactPreference,
      activeDeliveryPreference,
      activeTimingPreference,
    );

  const [
    enquiries,
    unassignedActiveCount,
    activeWithoutFollowUpCount,
    incompleteQualificationCount,
    noRecordedContactCount,
    dueTodayCount,
    overdueCount,
    closedWithoutOutcomeCount,
    assignedToMeCount,
  ] = await Promise.all([
    db.enquiry.findMany({
      ...(enquiryWhere ? { where: enquiryWhere } : {}),
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        preferredContact: true,
        deliveryPreference: true,
        timingPreference: true,
        school: true,
        programmeSlug: true,
        programmeTitleSnapshot: true,
        message: true,
        locale: true,
        status: true,
        source: true,
        landingPath: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        createdAt: true,
        nextFollowUpAt: true,
        nextAction: true,
        outcome: true,
        outcomeAt: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        statusEvents: {
          take: ENQUIRY_AUDIT_RELATION_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            createdAt: true,
            actor: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        ownershipEvents: {
          take: ENQUIRY_AUDIT_RELATION_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fromOwnerUserId: true,
            toOwnerUserId: true,
            createdAt: true,
            actor: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        followUpEvents: {
          take: ENQUIRY_AUDIT_RELATION_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fromNextFollowUpAt: true,
            toNextFollowUpAt: true,
            createdAt: true,
            actor: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        outcomeEvents: {
          take: ENQUIRY_AUDIT_RELATION_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fromOutcomeAt: true,
            toOutcomeAt: true,
            createdAt: true,
            actor: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),
    db.enquiry.count({ where: ACTIVE_UNASSIGNED_ENQUIRY_WHERE }),
    db.enquiry.count({ where: ACTIVE_WITHOUT_FOLLOW_UP_WHERE }),
    db.enquiry.count({ where: ACTIVE_INCOMPLETE_QUALIFICATION_WHERE }),
    db.enquiry.count({ where: ACTIVE_WITHOUT_RECORDED_CONTACT_WHERE }),
    db.enquiry.count({
      where: { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } },
    }),
    db.enquiry.count({ where: { nextFollowUpAt: { lt: todayUtc } } }),
    db.enquiry.count({ where: CLOSED_WITHOUT_OUTCOME_WHERE }),
    db.enquiry.count({ where: { ownerUserId: administrator.id } }),
  ]);
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) => formatLocalizedDate(value, locale);

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
            <div className={styles.toolbar}>
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
                <p className="eyebrow">{copy.filterByStatus}</p>
                <h2>
                  {number(enquiries.length)} {copy.enquiries}
                </h2>
              </div>
            </div>

            {activeCampaignAttribution ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {campaignFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  {activeCampaignAttribution.utmSource ? (
                    <span className={styles.filterLink} dir="auto">
                      {campaignFilterCopy.source}:{' '}
                      {activeCampaignAttribution.utmSource}
                    </span>
                  ) : null}
                  {activeCampaignAttribution.utmCampaign ? (
                    <span className={styles.filterLink} dir="auto">
                      {campaignFilterCopy.campaign}:{' '}
                      {activeCampaignAttribution.utmCampaign}
                    </span>
                  ) : null}
                  {activeCampaignAttribution.utmMedium ? (
                    <span className={styles.filterLink} dir="auto">
                      {campaignFilterCopy.medium}:{' '}
                      {activeCampaignAttribution.utmMedium}
                    </span>
                  ) : null}
                  {activeCampaignAttribution.utmContent ? (
                    <span className={styles.filterLink} dir="auto">
                      {campaignFilterCopy.content}:{' '}
                      {activeCampaignAttribution.utmContent}
                    </span>
                  ) : null}
                  <Link
                    className={styles.filterLink}
                    href={buildEnquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      activeOwner,
                      null,
                      activeLandingPath,
                      activeSchool,
                      activeContactPreference,
                      activeDeliveryPreference,
                      activeTimingPreference,
                    )}
                  >
                    <span>{campaignFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>{campaignFilterCopy.intro}</p>
              </div>
            ) : null}

            {activeLandingPath ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {landingPathFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink} dir="ltr">
                    {landingPathFilterCopy.path}: {activeLandingPath}
                  </span>
                  <Link
                    className={styles.filterLink}
                    href={buildEnquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      activeOwner,
                      activeCampaignAttribution,
                      null,
                      activeSchool,
                      activeContactPreference,
                      activeDeliveryPreference,
                      activeTimingPreference,
                    )}
                  >
                    <span>{landingPathFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>
                  {landingPathFilterCopy.intro}
                </p>
              </div>
            ) : null}

            {activeSchool ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {schoolFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink}>
                    {schoolFilterCopy.school}:{' '}
                    {getAdminEnumLabel(locale, activeSchool)}
                  </span>
                  <Link
                    className={styles.filterLink}
                    href={buildEnquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      activeOwner,
                      activeCampaignAttribution,
                      activeLandingPath,
                      null,
                      activeContactPreference,
                      activeDeliveryPreference,
                      activeTimingPreference,
                    )}
                  >
                    <span>{schoolFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>{schoolFilterCopy.intro}</p>
              </div>
            ) : null}

            {activeContactPreference ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {contactPreferenceFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink}>
                    {contactPreferenceFilterCopy.preference}:{' '}
                    {getEnquiryContactPreferenceLabel(
                      locale,
                      activeContactPreference,
                    )}
                  </span>
                  <Link
                    className={styles.filterLink}
                    href={buildEnquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      activeOwner,
                      activeCampaignAttribution,
                      activeLandingPath,
                      activeSchool,
                      null,
                      activeDeliveryPreference,
                      activeTimingPreference,
                    )}
                  >
                    <span>{contactPreferenceFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>
                  {contactPreferenceFilterCopy.intro}
                </p>
              </div>
            ) : null}

            {activeDeliveryPreference ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {deliveryPreferenceFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink}>
                    {deliveryPreferenceFilterCopy.preference}:{' '}
                    {getEnquiryDeliveryPreferenceLabel(
                      locale,
                      activeDeliveryPreference,
                    )}
                  </span>
                  <Link
                    className={styles.filterLink}
                    href={buildEnquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      activeOwner,
                      activeCampaignAttribution,
                      activeLandingPath,
                      activeSchool,
                      activeContactPreference,
                      null,
                      activeTimingPreference,
                    )}
                  >
                    <span>{deliveryPreferenceFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>
                  {deliveryPreferenceFilterCopy.intro}
                </p>
              </div>
            ) : null}

            {activeTimingPreference ? (
              <div className={styles.attentionSection}>
                <span className={styles.filterLabel}>
                  {timingPreferenceFilterCopy.eyebrow}
                </span>
                <div className={styles.filters}>
                  <span className={styles.filterLink}>
                    {timingPreferenceFilterCopy.preference}:{' '}
                    {getEnquiryTimingPreferenceLabel(
                      locale,
                      activeTimingPreference,
                    )}
                  </span>
                  <Link
                    className={styles.filterLink}
                    href={buildEnquiryHref(
                      locale,
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      activeOwner,
                      activeCampaignAttribution,
                      activeLandingPath,
                      activeSchool,
                      activeContactPreference,
                      activeDeliveryPreference,
                      null,
                    )}
                  >
                    <span>{timingPreferenceFilterCopy.clear}</span>
                  </Link>
                </div>
                <p className={styles.filterLabel}>
                  {timingPreferenceFilterCopy.intro}
                </p>
              </div>
            ) : null}

            <div className={styles.attentionSection}>
              <span className={styles.filterLabel}>{copy.attentionQueue}</span>
              <div className={styles.attentionGrid}>
                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'unassigned'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={hrefFor(null, null, 'unassigned', null)}
                  aria-current={
                    activeAttention === 'unassigned' ? 'page' : undefined
                  }
                >
                  <span>{copy.unassignedActive}</span>
                  <strong>{number(unassignedActiveCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'active-without-follow-up'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={hrefFor(null, null, 'active-without-follow-up', null)}
                  aria-current={
                    activeAttention === 'active-without-follow-up'
                      ? 'page'
                      : undefined
                  }
                >
                  <span>{copy.activeWithoutFollowUp}</span>
                  <strong>{number(activeWithoutFollowUpCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'active-incomplete-qualification'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={hrefFor(
                    null,
                    null,
                    'active-incomplete-qualification',
                    null,
                  )}
                  aria-current={
                    activeAttention === 'active-incomplete-qualification'
                      ? 'page'
                      : undefined
                  }
                >
                  <span>{incompleteQualificationLabel}</span>
                  <strong>{number(incompleteQualificationCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'active-without-recorded-contact'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={hrefFor(
                    null,
                    null,
                    'active-without-recorded-contact',
                    null,
                  )}
                  aria-current={
                    activeAttention === 'active-without-recorded-contact'
                      ? 'page'
                      : undefined
                  }
                >
                  <span>{noRecordedContactCopy.label}</span>
                  <strong>{number(noRecordedContactCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeFollowUp === 'due-today'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={hrefFor(null, 'due-today', null, null)}
                  aria-current={
                    activeFollowUp === 'due-today' ? 'page' : undefined
                  }
                >
                  <span>{copy.dueToday}</span>
                  <strong>{number(dueTodayCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeFollowUp === 'overdue'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={hrefFor(null, 'overdue', null, null)}
                  aria-current={
                    activeFollowUp === 'overdue' ? 'page' : undefined
                  }
                >
                  <span>{copy.overdue}</span>
                  <strong>{number(overdueCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeAttention === 'closed-without-outcome'
                      ? styles.activeAttentionCard
                      : ''
                  }`}
                  href={hrefFor(null, null, 'closed-without-outcome', null)}
                  aria-current={
                    activeAttention === 'closed-without-outcome'
                      ? 'page'
                      : undefined
                  }
                >
                  <span>{copy.closedWithoutOutcome}</span>
                  <strong>{number(closedWithoutOutcomeCount)}</strong>
                </Link>
                <Link
                  className={`${styles.attentionCard} ${
                    activeOwner === 'mine' ? styles.activeAttentionCard : ''
                  }`}
                  href={hrefFor(null, null, null, 'mine')}
                  aria-current={activeOwner === 'mine' ? 'page' : undefined}
                >
                  <span>{copy.myEnquiries}</span>
                  <strong>{number(assignedToMeCount)}</strong>
                </Link>
              </div>
              <p className={styles.filterLabel}>{noRecordedContactCopy.note}</p>
            </div>

            <div className={styles.filterGroups}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>
                  {copy.filterByStatus}
                </span>
                <nav
                  className={styles.filters}
                  aria-label={copy.filterByStatus}
                >
                  <Link
                    className={`${styles.filterLink} ${
                      activeStatus === null ? styles.activeFilter : ''
                    }`}
                    href={hrefFor(
                      null,
                      activeFollowUp,
                      activeAttention,
                      activeOwner,
                    )}
                    aria-current={activeStatus === null ? 'page' : undefined}
                  >
                    <span>{copy.all}</span>
                  </Link>
                  {enquiryStatuses.map((status) => (
                    <Link
                      key={status}
                      className={`${styles.filterLink} ${
                        activeStatus === status ? styles.activeFilter : ''
                      }`}
                      href={hrefFor(
                        status,
                        activeFollowUp,
                        activeAttention,
                        activeOwner,
                      )}
                      aria-current={
                        activeStatus === status ? 'page' : undefined
                      }
                    >
                      <span>{getAdminEnumLabel(locale, status)}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>
                  {copy.filterByFollowUp}
                </span>
                <nav
                  className={styles.filters}
                  aria-label={copy.filterByFollowUp}
                >
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === null ? styles.activeFilter : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      null,
                      activeAttention,
                      activeOwner,
                    )}
                    aria-current={activeFollowUp === null ? 'page' : undefined}
                  >
                    <span>{copy.allFollowUps}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === 'due-today' ? styles.activeFilter : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      'due-today',
                      activeAttention,
                      activeOwner,
                    )}
                    aria-current={
                      activeFollowUp === 'due-today' ? 'page' : undefined
                    }
                  >
                    <span>{copy.dueToday}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === 'overdue' ? styles.activeFilter : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      'overdue',
                      activeAttention,
                      activeOwner,
                    )}
                    aria-current={
                      activeFollowUp === 'overdue' ? 'page' : undefined
                    }
                  >
                    <span>{copy.overdue}</span>
                  </Link>
                </nav>
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>{copy.filterByOwner}</span>
                <nav className={styles.filters} aria-label={copy.filterByOwner}>
                  <Link
                    className={`${styles.filterLink} ${
                      activeOwner === null ? styles.activeFilter : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      null,
                    )}
                    aria-current={activeOwner === null ? 'page' : undefined}
                  >
                    <span>{copy.anyOwner}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeOwner === 'mine' ? styles.activeFilter : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      activeFollowUp,
                      activeAttention,
                      'mine',
                    )}
                    aria-current={activeOwner === 'mine' ? 'page' : undefined}
                  >
                    <span>{copy.myEnquiries}</span>
                  </Link>
                </nav>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>
                  {copy.filterByAttention}
                </span>
                <nav
                  className={styles.filters}
                  aria-label={copy.filterByAttention}
                >
                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === null ? styles.activeFilter : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      activeFollowUp,
                      null,
                      activeOwner,
                    )}
                    aria-current={activeAttention === null ? 'page' : undefined}
                  >
                    <span>{copy.allAttention}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === 'unassigned'
                        ? styles.activeFilter
                        : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      activeFollowUp,
                      'unassigned',
                      activeOwner,
                    )}
                    aria-current={
                      activeAttention === 'unassigned' ? 'page' : undefined
                    }
                  >
                    <span>{copy.unassignedActive}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === 'active-without-follow-up'
                        ? styles.activeFilter
                        : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      activeFollowUp,
                      'active-without-follow-up',
                      activeOwner,
                    )}
                    aria-current={
                      activeAttention === 'active-without-follow-up'
                        ? 'page'
                        : undefined
                    }
                  >
                    <span>{copy.activeWithoutFollowUp}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === 'active-incomplete-qualification'
                        ? styles.activeFilter
                        : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      activeFollowUp,
                      'active-incomplete-qualification',
                      activeOwner,
                    )}
                    aria-current={
                      activeAttention === 'active-incomplete-qualification'
                        ? 'page'
                        : undefined
                    }
                  >
                    <span>{incompleteQualificationLabel}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeAttention === 'closed-without-outcome'
                        ? styles.activeFilter
                        : ''
                    }`}
                    href={hrefFor(
                      activeStatus,
                      activeFollowUp,
                      'closed-without-outcome',
                      activeOwner,
                    )}
                    aria-current={
                      activeAttention === 'closed-without-outcome'
                        ? 'page'
                        : undefined
                    }
                  >
                    <span>{copy.closedWithoutOutcome}</span>
                  </Link>
                </nav>
              </div>
            </div>
          </section>

          {enquiries.length > 0 ? (
            <section className={styles.list} aria-live="polite">
              {enquiries.map((enquiry) => {
                const ownerName = enquiry.owner
                  ? displayPersonName(
                      enquiry.owner.firstName,
                      enquiry.owner.lastName,
                      enquiry.owner.email,
                    )
                  : copy.unassigned;
                const ownedByAdministrator =
                  enquiry.owner?.id === administrator.id;
                const hasFollowUpPlan = Boolean(
                  enquiry.nextFollowUpAt && enquiry.nextAction,
                );
                const hasOutcome = Boolean(
                  enquiry.outcome && enquiry.outcomeAt,
                );
                const campaignAttribution = [
                  enquiry.utmSource
                    ? `${attributionCopy.source}: ${enquiry.utmSource}`
                    : null,
                  enquiry.utmMedium
                    ? `${attributionCopy.medium}: ${enquiry.utmMedium}`
                    : null,
                  enquiry.utmCampaign
                    ? `${attributionCopy.campaign}: ${enquiry.utmCampaign}`
                    : null,
                  enquiry.utmContent
                    ? `${attributionCopy.content}: ${enquiry.utmContent}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ');
                const contactShortcuts = buildEnquiryContactShortcuts({
                  email: enquiry.email,
                  phone: enquiry.phone,
                  preferredContact: enquiry.preferredContact,
                });
                const firstResponseSteps = buildEnquiryFirstResponseSteps({
                  programmeTitleSnapshot: enquiry.programmeTitleSnapshot,
                  city: enquiry.city,
                  preferredContact: enquiry.preferredContact,
                  deliveryPreference: enquiry.deliveryPreference,
                  timingPreference: enquiry.timingPreference,
                  phone: enquiry.phone,
                });
                const auditTimeline = buildEnquiryAuditTimeline({
                  statusEvents: enquiry.statusEvents,
                  ownershipEvents: enquiry.ownershipEvents,
                  followUpEvents: enquiry.followUpEvents,
                  outcomeEvents: enquiry.outcomeEvents,
                });

                return (
                  <article className={styles.card} key={enquiry.id}>
                    <header className={styles.cardHeader}>
                      <div className={styles.identity}>
                        <h2 dir="auto">{enquiry.name}</h2>
                        <p dir="auto">{enquiry.email}</p>
                      </div>
                      <div>
                        <span
                          className={`data-status status-${enquiry.status.toLowerCase()}`}
                        >
                          {getAdminEnumLabel(locale, enquiry.status)}
                        </span>
                      </div>
                    </header>

                    <div className={styles.metaGrid}>
                      <div className={styles.metaItem}>
                        <span>{copy.received}</span>
                        <p>{date(enquiry.createdAt)}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.school}</span>
                        <p>{getAdminEnumLabel(locale, enquiry.school)}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.programmeContext}</span>
                        <p dir="auto">
                          {enquiry.programmeTitleSnapshot ?? copy.notProvided}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.language}</span>
                        <p dir="auto">{enquiry.locale.toUpperCase()}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.source}</span>
                        <p dir="auto">{enquiry.source}</p>
                      </div>
                      {campaignAttribution ? (
                        <div className={styles.metaItem}>
                          <span>{attributionCopy.campaignAttribution}</span>
                          <p dir="auto">{campaignAttribution}</p>
                        </div>
                      ) : null}
                      {enquiry.landingPath ? (
                        <div className={styles.metaItem}>
                          <span>{attributionCopy.landingPath}</span>
                          <p dir="auto">{enquiry.landingPath}</p>
                        </div>
                      ) : null}
                      <div className={styles.metaItem}>
                        <span>{copy.contact}</span>
                        <p dir="auto">{enquiry.phone || copy.noPhone}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.city}</span>
                        <p dir="auto">{enquiry.city || copy.notProvided}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.preferredContact}</span>
                        <p>
                          {getEnquiryContactPreferenceLabel(
                            locale,
                            enquiry.preferredContact,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.deliveryPreference}</span>
                        <p>
                          {getEnquiryDeliveryPreferenceLabel(
                            locale,
                            enquiry.deliveryPreference,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.timingPreference}</span>
                        <p>
                          {getEnquiryTimingPreferenceLabel(
                            locale,
                            enquiry.timingPreference,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.owner}</span>
                        <p dir="auto">
                          {ownedByAdministrator
                            ? copy.assignedToYou
                            : ownerName}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.nextFollowUp}</span>
                        <p>
                          {enquiry.nextFollowUpAt
                            ? date(enquiry.nextFollowUpAt)
                            : copy.noFollowUp}
                        </p>
                      </div>
                    </div>

                    <section className={styles.contactShortcutBlock}>
                      <div className={styles.contactShortcutHeading}>
                        <span className={styles.messageLabel}>
                          {contactShortcutsCopy.eyebrow}
                        </span>
                        <h3>{contactShortcutsCopy.title}</h3>
                        <p className={styles.privacyNote}>
                          {contactShortcutsCopy.intro}
                        </p>
                      </div>
                      {contactShortcuts.length > 0 ? (
                        <div className={styles.contactShortcutList}>
                          {contactShortcuts.map((shortcut) => (
                            <a
                              key={shortcut.kind}
                              className={`${styles.contactLink} ${
                                shortcut.preferred
                                  ? styles.preferredContactLink
                                  : ''
                              }`}
                              href={shortcut.href}
                              target={
                                shortcut.kind === 'whatsapp'
                                  ? '_blank'
                                  : undefined
                              }
                              rel={
                                shortcut.kind === 'whatsapp'
                                  ? 'noopener noreferrer'
                                  : undefined
                              }
                            >
                              <span>
                                {contactShortcutsCopy.label(shortcut.kind)}
                              </span>
                              {shortcut.preferred ? (
                                <small className={styles.contactShortcutBadge}>
                                  {contactShortcutsCopy.preferred}
                                </small>
                              ) : null}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.privacyNote}>
                          {contactShortcutsCopy.unavailable}
                        </p>
                      )}
                      <p className={styles.privacyNote}>
                        {contactShortcutsCopy.boundary}
                      </p>
                    </section>

                    <div className={styles.messageBlock}>
                      <span className={styles.messageLabel}>
                        {copy.message}
                      </span>
                      <p className={styles.messageBody} dir="auto">
                        {enquiry.message}
                      </p>
                      <p className={styles.privacyNote}>
                        {copy.protectedMessage}
                      </p>
                    </div>

                    <section className={styles.responseGuideBlock}>
                      <div>
                        <span className={styles.messageLabel}>
                          {copy.firstResponseGuide}
                        </span>
                        <p className={styles.privacyNote}>
                          {copy.firstResponseGuideIntro}
                        </p>
                      </div>
                      <ol className={styles.responseGuideList}>
                        {firstResponseSteps.map((step) => (
                          <li key={step}>
                            {getEnquiryFirstResponseStepLabel(locale, step)}
                          </li>
                        ))}
                      </ol>
                      <p className={styles.privacyNote}>
                        {copy.firstResponseBoundary}
                      </p>
                    </section>

                    <section className={styles.followUpBlock}>
                      <div className={styles.followUpHeading}>
                        <div>
                          <span className={styles.messageLabel}>
                            {copy.followUpPlan}
                          </span>
                          <p dir="auto">
                            {enquiry.nextAction || copy.noNextAction}
                          </p>
                        </div>
                      </div>
                      <form
                        action={updateEnquiryFollowUpPlan}
                        className={styles.followUpForm}
                      >
                        <input
                          type="hidden"
                          name="enquiryId"
                          value={enquiry.id}
                        />
                        <input type="hidden" name="operation" value="save" />
                        <label className={styles.followUpField}>
                          <span>{copy.nextFollowUp}</span>
                          <input
                            type="date"
                            name="nextFollowUpOn"
                            defaultValue={dateInputValue(
                              enquiry.nextFollowUpAt,
                            )}
                            required
                          />
                        </label>
                        <label className={styles.followUpField}>
                          <span>{copy.nextAction}</span>
                          <input
                            type="text"
                            name="nextAction"
                            defaultValue={enquiry.nextAction ?? ''}
                            maxLength={240}
                            required
                            dir="auto"
                          />
                        </label>
                        <button type="submit">{copy.saveFollowUp}</button>
                      </form>
                      {hasFollowUpPlan ? (
                        <form action={updateEnquiryFollowUpPlan}>
                          <input
                            type="hidden"
                            name="enquiryId"
                            value={enquiry.id}
                          />
                          <input type="hidden" name="operation" value="clear" />
                          <button
                            className={styles.clearFollowUpButton}
                            type="submit"
                          >
                            {copy.clearFollowUp}
                          </button>
                        </form>
                      ) : null}
                    </section>

                    <section className={styles.followUpBlock}>
                      <div className={styles.followUpHeading}>
                        <div>
                          <span className={styles.messageLabel}>
                            {copy.outcome}
                          </span>
                          <p dir="auto">{enquiry.outcome || copy.noOutcome}</p>
                          {enquiry.outcomeAt ? (
                            <p className={styles.privacyNote}>
                              {copy.outcomeRecorded}: {date(enquiry.outcomeAt)}
                            </p>
                          ) : null}
                          <p className={styles.privacyNote}>
                            {copy.outcomeGuidance}
                          </p>
                        </div>
                      </div>
                      <form
                        action={updateEnquiryOutcome}
                        className={styles.followUpForm}
                      >
                        <input
                          type="hidden"
                          name="enquiryId"
                          value={enquiry.id}
                        />
                        <input type="hidden" name="operation" value="save" />
                        <label className={styles.followUpField}>
                          <span>{copy.outcome}</span>
                          <input
                            type="text"
                            name="outcome"
                            defaultValue={enquiry.outcome ?? ''}
                            maxLength={240}
                            required
                            dir="auto"
                          />
                        </label>
                        <button type="submit">{copy.saveOutcome}</button>
                      </form>
                      {hasOutcome ? (
                        <form action={updateEnquiryOutcome}>
                          <input
                            type="hidden"
                            name="enquiryId"
                            value={enquiry.id}
                          />
                          <input type="hidden" name="operation" value="clear" />
                          <button
                            className={styles.clearFollowUpButton}
                            type="submit"
                          >
                            {copy.clearOutcome}
                          </button>
                        </form>
                      ) : null}
                    </section>

                    <section className={styles.auditBlock}>
                      <div>
                        <span className={styles.messageLabel}>
                          {copy.recentAuditChanges}
                        </span>
                        <p className={styles.privacyNote}>
                          {copy.recentAuditIntro}
                        </p>
                      </div>
                      {auditTimeline.length > 0 ? (
                        <ol className={styles.auditList}>
                          {auditTimeline.map((event) => {
                            const actorName = displayPersonName(
                              event.actor.firstName,
                              event.actor.lastName,
                              event.actor.email,
                            );
                            return (
                              <li key={event.id}>
                                <div className={styles.auditEventHeading}>
                                  <strong>
                                    {getEnquiryAuditActionLabel(
                                      locale,
                                      event.action,
                                    )}
                                  </strong>
                                  <small>
                                    {date(event.createdAt)} · {copy.auditBy}{' '}
                                    <span dir="auto">{actorName}</span>
                                  </small>
                                </div>
                                {event.action === 'status-changed' &&
                                event.fromStatus &&
                                event.toStatus ? (
                                  <span>
                                    {getAdminEnumLabel(
                                      locale,
                                      event.fromStatus,
                                    )}{' '}
                                    →{' '}
                                    {getAdminEnumLabel(locale, event.toStatus)}
                                  </span>
                                ) : event.followUpAt ? (
                                  <span>{date(event.followUpAt)}</span>
                                ) : null}
                              </li>
                            );
                          })}
                        </ol>
                      ) : (
                        <p className={styles.privacyNote}>
                          {copy.auditNoChanges}
                        </p>
                      )}
                    </section>

                    <div className={styles.statusRow}>
                      <div className={styles.actions}>
                        {!ownedByAdministrator ? (
                          <form action={updateEnquiryOwnership}>
                            <input
                              type="hidden"
                              name="enquiryId"
                              value={enquiry.id}
                            />
                            <input
                              type="hidden"
                              name="operation"
                              value="assign-to-me"
                            />
                            <button
                              className={styles.ownershipButton}
                              type="submit"
                            >
                              {copy.assignToMe}
                            </button>
                          </form>
                        ) : null}
                        {enquiry.owner ? (
                          <form action={updateEnquiryOwnership}>
                            <input
                              type="hidden"
                              name="enquiryId"
                              value={enquiry.id}
                            />
                            <input
                              type="hidden"
                              name="operation"
                              value="unassign"
                            />
                            <button
                              className={styles.ownershipButton}
                              type="submit"
                            >
                              {copy.unassign}
                            </button>
                          </form>
                        ) : null}
                      </div>

                      <form
                        action={transitionEnquiryStatus}
                        className={styles.statusForm}
                      >
                        <input
                          type="hidden"
                          name="enquiryId"
                          value={enquiry.id}
                        />
                        <label>
                          <span className="sr-only">
                            {copy.updateStatus}: {enquiry.name}
                          </span>
                          <select
                            name="toStatus"
                            defaultValue=""
                            required
                            aria-label={`${copy.updateStatus}: ${enquiry.name}`}
                          >
                            <option value="" disabled>
                              {copy.moveTo}
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
                        <button type="submit">{copy.update}</button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="admin-panel">
              <p className="admin-empty">{copy.noMatches}</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
