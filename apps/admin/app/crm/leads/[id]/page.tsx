import { hasPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  localizeHref,
} from '@luminol/localization';
import { utcToZonedLocal } from '@luminol/validation/consultations';
import {
  crmBookableOfferStatuses,
  crmSectionForSchool,
  scoreCrmLead,
  type CrmSectionValue,
} from '@luminol/validation/crm-sections';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CrmActivityForm } from '../../../../components/crm-activity-form';
import { CrmOpportunities } from '../../../../components/crm-opportunities';
import { CrmShell } from '../../../../components/crm-shell';
import styles from '../../../../components/operations.module.css';
import { getAdminEnumLabel } from '../../../../lib/admin-localization';
import { requireCrmActor } from '../../../../lib/crm-actor.server';
import { crmDealTimelineItems } from '../../../../lib/crm-deal-timeline';
import { getCrmCopy, parseCrmFeedback } from '../../../../lib/crm-localization';
import { getCrmSectionsCopy } from '../../../../lib/crm-sections-localization';
import {
  buildCrmTimeline,
  personLabel,
  type CrmTimelineItem,
} from '../../../../lib/crm-timeline';
import {
  getEnquiryContactPreferenceLabel,
  getEnquiryDeliveryPreferenceLabel,
  getEnquiryTimingPreferenceLabel,
} from '../../../../lib/enquiry-desk-localization';
import { getEnquiryTransitions } from '../../../../lib/operations';
import { getAdminRequestLocale } from '../../../../lib/request-locale';
import {
  transitionEnquiryStatus,
  updateEnquiryFollowUpPlan,
  updateEnquiryOutcome,
  updateEnquiryOwnership,
} from '../../../enquiries/actions';

type LeadPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    error?: string | string[] | undefined;
    saved?: string | string[] | undefined;
  }>;
};

const person = {
  select: { email: true, firstName: true, lastName: true },
} as const;

export default async function LeadPage({
  params,
  searchParams,
}: LeadPageProps) {
  const { user, actor } = await requireCrmActor();
  if (!actor.canWorkEnquiries) notFound();
  const { id } = await params;
  if (id.length > 128) notFound();
  const locale = await getAdminRequestLocale();
  const copy = getCrmCopy(locale);
  const sectionsCopy = getCrmSectionsCopy(locale);
  const query = searchParams ? await searchParams : undefined;
  const feedback = parseCrmFeedback(query?.error);
  const saved = query?.saved === '1';
  const todayIso = utcToZonedLocal(new Date()).slice(0, 10);
  const returnTo = localizeHref(locale, `/crm/leads/${id}`);
  const canConvert = hasPermission(user.roles, 'consultation:manage');

  const lead = await db.enquiry.findUnique({
    where: { id },
    include: {
      owner: person,
      client: { select: { id: true, displayName: true } },
      statusEvents: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { actor: person },
      },
      ownershipEvents: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { actor: person },
      },
      followUpEvents: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { actor: person },
      },
      outcomeEvents: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { actor: person },
      },
      activities: {
        orderBy: { occurredAt: 'desc' },
        take: 100,
        include: { actor: person },
      },
      deals: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          offer: { select: { title: true } },
          events: {
            orderBy: { occurredAt: 'desc' },
            take: 50,
            include: { actor: person },
          },
        },
      },
    },
  });
  if (!lead) notFound();
  const bookableOffers = await db.crmOffer.findMany({
    where: { status: { in: [...crmBookableOfferStatuses] } },
    orderBy: [{ section: 'asc' }, { startsOn: 'asc' }],
    take: 200,
    select: { id: true, section: true, title: true },
  });
  const score = scoreCrmLead({
    consent: lead.consent,
    phone: lead.phone,
    timingPreference: lead.timingPreference,
    hasProgramme: Boolean(lead.programmeSlug),
    contacted: lead.status !== 'NEW',
    createdAt: lead.createdAt,
    lastActivityAt: lead.activities[0]?.occurredAt ?? null,
    now: new Date(),
  });

  const ownerIds = [
    ...new Set(
      lead.ownershipEvents
        .map(({ toOwnerUserId }) => toOwnerUserId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const owners = ownerIds.length
    ? await db.user.findMany({
        where: { id: { in: ownerIds } },
        select: { id: true, email: true, firstName: true, lastName: true },
      })
    : [];
  const ownerName = (ownerId: string) =>
    personLabel(
      owners.find(({ id: candidate }) => candidate === ownerId) ?? null,
    ) ?? ownerId;

  const date = (value: Date) => formatLocalizedDate(value, locale);
  const dateTime = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Africa/Algiers',
    });
  const label = (value: string) => getAdminEnumLabel(locale, value);
  const transitions = getEnquiryTransitions(lead.status);

  const timeline = buildCrmTimeline(
    [
      {
        id: `received-${lead.id}`,
        kind: 'enquiry-received',
        at: lead.createdAt,
        title: copy.timelineTitle.enquiryReceived,
        detail: lead.programmeTitleSnapshot,
      },
    ],
    lead.statusEvents.map((event): CrmTimelineItem => ({
      id: event.id,
      kind: 'status',
      at: event.createdAt,
      title: copy.timelineTitle.status(
        label(event.fromStatus),
        label(event.toStatus),
      ),
      actor: personLabel(event.actor),
    })),
    lead.ownershipEvents.map((event): CrmTimelineItem => ({
      id: event.id,
      kind: 'owner',
      at: event.createdAt,
      title: event.toOwnerUserId
        ? copy.timelineTitle.ownerAssigned(ownerName(event.toOwnerUserId))
        : copy.timelineTitle.ownerCleared,
      actor: personLabel(event.actor),
    })),
    lead.followUpEvents.map((event): CrmTimelineItem => ({
      id: event.id,
      kind: 'follow-up',
      at: event.createdAt,
      title: event.toNextFollowUpAt
        ? copy.timelineTitle.followUpSet(date(event.toNextFollowUpAt))
        : copy.timelineTitle.followUpCleared,
      detail: event.toNextAction,
      actor: personLabel(event.actor),
    })),
    lead.outcomeEvents.map((event): CrmTimelineItem => ({
      id: event.id,
      kind: 'outcome',
      at: event.createdAt,
      title: event.toOutcome
        ? copy.timelineTitle.outcomeSet
        : copy.timelineTitle.outcomeCleared,
      detail: event.toOutcome,
      actor: personLabel(event.actor),
    })),
    lead.activities.map((activity): CrmTimelineItem => ({
      id: activity.id,
      kind: 'activity',
      at: activity.occurredAt,
      title: [
        copy.activityTypeLabel[activity.type],
        activity.direction ? copy.directionLabel[activity.direction] : null,
        activity.outcome ? copy.outcomeLabel[activity.outcome] : null,
      ]
        .filter(Boolean)
        .join(' · '),
      detail: activity.summary,
      actor: personLabel(activity.actor),
      tone: activity.outcome === 'BOOKED' ? 'success' : 'default',
    })),
    crmDealTimelineItems(lead.deals, sectionsCopy),
  );

  const facts: [string, string | null][] = [
    [copy.email, lead.email],
    [copy.phone, lead.phone],
    [copy.city, lead.city],
    [copy.school, label(lead.school)],
    [copy.programme, lead.programmeTitleSnapshot],
    [
      copy.preferredContact,
      getEnquiryContactPreferenceLabel(locale, lead.preferredContact),
    ],
    [
      copy.delivery,
      getEnquiryDeliveryPreferenceLabel(locale, lead.deliveryPreference),
    ],
    [
      copy.timing,
      getEnquiryTimingPreferenceLabel(locale, lead.timingPreference),
    ],
    [copy.source, lead.utmSource ?? lead.source],
    [copy.campaign, lead.utmCampaign],
    [copy.received, dateTime(lead.createdAt)],
    [
      sectionsCopy.score,
      [
        `${sectionsCopy.scoreBand[score.band]} (${score.score}/100)`,
        score.reasons
          .map((reason) => sectionsCopy.scoreReason[reason])
          .join(locale === 'ar' ? '، ' : ', '),
      ].join(' · '),
    ],
  ];

  return (
    <CrmShell locale={locale} user={user} current="enquiries">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">
            {copy.eyebrow} · {copy.lead}
          </p>
          <h1>
            <bdi>{lead.name}</bdi>
          </h1>
          <p className={styles.meta}>
            <span className={styles.chip}>{label(lead.status)}</span>
            <span className={lead.consent ? styles.success : styles.warning}>
              {lead.consent ? copy.consentYes : copy.consentNo}
            </span>
            <span className="crm-score" data-band={score.band}>
              {sectionsCopy.score}: {sectionsCopy.scoreBand[score.band]}
            </span>
            <span>
              {copy.owner}:{' '}
              {lead.owner ? (
                <bdi>{personLabel(lead.owner)}</bdi>
              ) : (
                copy.unassigned
              )}
            </span>
          </p>
        </div>
        <div className={styles.actions}>
          {lead.client ? (
            <Link
              href={localizeHref(locale, `/crm/contacts/${lead.client.id}`)}
            >
              {copy.convertedTo}: <bdi>{lead.client.displayName}</bdi>
            </Link>
          ) : canConvert ? (
            <Link
              href={`${localizeHref(locale, `/clients?fromEnquiry=${lead.id}`)}#new-client`}
            >
              {copy.convert}
            </Link>
          ) : null}
          <Link href={localizeHref(locale, '/enquiries')}>
            {copy.openEnquiryDesk}
          </Link>
        </div>
      </section>

      {feedback ? (
        <p className={styles.warning} role="alert">
          {copy.feedback[feedback]}
        </p>
      ) : saved ? (
        <p className={styles.success} role="status">
          {copy.saved}
        </p>
      ) : null}

      <div className="crm-profile">
        <div className="crm-profile-main">
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.logActivity}</h2>
            </div>
            <CrmActivityForm
              copy={copy}
              subject={{ enquiryId: lead.id }}
              contactConsent={lead.consent}
              returnTo={returnTo}
              todayIso={todayIso}
            />
          </section>

          <CrmOpportunities
            locale={locale}
            copy={sectionsCopy}
            deals={lead.deals.map((deal) => ({
              id: deal.id,
              section: deal.section as CrmSectionValue,
              stage: deal.stage,
              state: deal.state,
              offer: deal.offer?.title ?? null,
              value:
                deal.valueMinor === null
                  ? null
                  : formatLocalizedCurrency(deal.valueMinor, 'DZD', locale),
              lostReason: deal.lostReason,
            }))}
            offers={bookableOffers.map((offer) => ({
              ...offer,
              section: offer.section as CrmSectionValue,
            }))}
            subject={{ enquiryId: lead.id }}
            defaultSection={crmSectionForSchool(lead.school)}
            returnTo={returnTo}
          />

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.timeline}</h2>
            </div>
            {timeline.length === 0 ? (
              <p className={styles.empty}>{copy.noTimeline}</p>
            ) : (
              <ol className="crm-timeline">
                {timeline.map((item) => (
                  <li key={item.id} data-kind={item.kind} data-tone={item.tone}>
                    <time dateTime={item.at.toISOString()}>
                      {dateTime(item.at)}
                    </time>
                    <strong>{item.title}</strong>
                    {item.detail ? (
                      <p>
                        <bdi>{item.detail}</bdi>
                      </p>
                    ) : null}
                    {item.actor ? (
                      <span className={styles.meta}>
                        <bdi>{item.actor}</bdi>
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="crm-profile-side">
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.stage}</h2>
            </div>
            <div className={styles.actions}>
              {transitions.map((toStatus) => (
                <form key={toStatus} action={transitionEnquiryStatus}>
                  <input type="hidden" name="enquiryId" value={lead.id} />
                  <input type="hidden" name="toStatus" value={toStatus} />
                  <button type="submit" className={styles.secondaryButton}>
                    {copy.moveTo} {label(toStatus)}
                  </button>
                </form>
              ))}
            </div>
            <form action={updateEnquiryOwnership} className={styles.actions}>
              <input type="hidden" name="enquiryId" value={lead.id} />
              {lead.ownerUserId === user.id ? (
                <button
                  type="submit"
                  name="operation"
                  value="unassign"
                  className={styles.secondaryButton}
                >
                  {copy.unassign}
                </button>
              ) : (
                <button
                  type="submit"
                  name="operation"
                  value="assign-to-me"
                  className={styles.secondaryButton}
                >
                  {copy.assignToMe}
                </button>
              )}
            </form>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.followUp}</h2>
            </div>
            {lead.nextFollowUpAt ? (
              <p>
                <strong>{date(lead.nextFollowUpAt)}</strong>
                {lead.nextAction ? (
                  <>
                    {' '}
                    · <bdi>{lead.nextAction}</bdi>
                  </>
                ) : null}
              </p>
            ) : (
              <p className={styles.empty}>{copy.noFollowUp}</p>
            )}
            <form action={updateEnquiryFollowUpPlan} className={styles.form}>
              <input type="hidden" name="enquiryId" value={lead.id} />
              <label className={styles.field}>
                <span>{copy.followUpOn}</span>
                <input
                  type="date"
                  name="nextFollowUpOn"
                  min={todayIso}
                  defaultValue={
                    lead.nextFollowUpAt?.toISOString().slice(0, 10) ?? ''
                  }
                />
              </label>
              <label className={styles.field}>
                <span>{copy.nextAction}</span>
                <input
                  type="text"
                  name="nextAction"
                  maxLength={240}
                  defaultValue={lead.nextAction ?? ''}
                />
              </label>
              <div className={styles.actions}>
                <button
                  type="submit"
                  name="operation"
                  value="save"
                  className={styles.button}
                >
                  {copy.saveFollowUp}
                </button>
                {lead.nextFollowUpAt ? (
                  <button
                    type="submit"
                    name="operation"
                    value="clear"
                    formNoValidate
                    className={styles.secondaryButton}
                  >
                    {copy.clearFollowUp}
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.outcome}</h2>
            </div>
            {lead.outcome ? (
              <p>
                <bdi>{lead.outcome}</bdi>
              </p>
            ) : (
              <p className={styles.empty}>{copy.noOutcome}</p>
            )}
            <form action={updateEnquiryOutcome} className={styles.form}>
              <input type="hidden" name="enquiryId" value={lead.id} />
              <input type="hidden" name="operation" value="save" />
              <label className={styles.field}>
                <span>{copy.outcome}</span>
                <input
                  type="text"
                  name="outcome"
                  maxLength={240}
                  defaultValue={lead.outcome ?? ''}
                  required
                />
              </label>
              <button type="submit" className={styles.button}>
                {copy.saveOutcome}
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.details}</h2>
            </div>
            <dl className="crm-facts">
              {facts.map(([term, value]) =>
                value ? (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>
                      <bdi>{value}</bdi>
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>
            <h3>{copy.message}</h3>
            <p className={styles.note}>
              <bdi>{lead.message}</bdi>
            </p>
          </section>
        </aside>
      </div>
    </CrmShell>
  );
}
