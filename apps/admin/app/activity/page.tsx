import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import { CONSULTATION_TIMEZONE } from '@luminol/validation/consultations';
import Link from 'next/link';

import { CrmShell } from '../../components/crm-shell';
import styles from '../../components/operations.module.css';
import {
  ACTIVITY_LOG_LIMIT,
  activityAreas,
  activityPeriods,
  mergeActivityLog,
  parseActivityArea,
  parseActivityPeriod,
  type ActivityArea,
  type ActivityEntry,
} from '../../lib/activity-log';
import { getActivityLogCopy } from '../../lib/activity-log-localization';
import { getAdminEnumLabel } from '../../lib/admin-localization';
import { getConsultationsCopy } from '../../lib/consultations-localization';
import { getContentCalendarCopy } from '../../lib/content-calendar-localization';
import { getCrmCopy } from '../../lib/crm-localization';
import { getCrmSectionsCopy } from '../../lib/crm-sections-localization';
import { personLabel } from '../../lib/crm-timeline';
import { getOperationsTasksCopy } from '../../lib/operations-tasks-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';

type ActivityPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PER_SOURCE = 100;
const DAY_MS = 24 * 60 * 60 * 1000;
const person = {
  select: { email: true, firstName: true, lastName: true },
} as const;

export default async function ActivityPage({
  searchParams,
}: ActivityPageProps) {
  const user = await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getActivityLogCopy(locale);
  const crmCopy = getCrmCopy(locale);
  const sectionsCopy = getCrmSectionsCopy(locale);
  const consultationCopy = getConsultationsCopy(locale);
  const taskCopy = getOperationsTasksCopy(locale);
  const calendarCopy = getContentCalendarCopy(locale);
  const params = searchParams ? await searchParams : {};
  const days = parseActivityPeriod(params.days);
  const area = parseActivityArea(params.area);
  const since = new Date(Date.now() - days * DAY_MS);
  const wants = (value: ActivityArea) => !area || area === value;
  const label = (value: string) => getAdminEnumLabel(locale, value);
  const href = (path: string) => localizeHref(locale, path);
  const take = PER_SOURCE;

  const [
    leadEvents,
    crmActivities,
    dealEvents,
    consultationEvents,
    paymentEvents,
    taskEvents,
    calendarEvents,
    roleEvents,
  ] = await Promise.all([
    wants('leads')
      ? db.enquiryStatusEvent.findMany({
          where: { createdAt: { gte: since } },
          orderBy: { createdAt: 'desc' },
          take,
          include: {
            actor: person,
            enquiry: { select: { id: true, name: true } },
          },
        })
      : [],
    wants('leads')
      ? db.crmActivity.findMany({
          where: { occurredAt: { gte: since } },
          orderBy: { occurredAt: 'desc' },
          take,
          include: {
            actor: person,
            enquiry: { select: { id: true, name: true } },
            client: { select: { id: true, displayName: true } },
          },
        })
      : [],
    wants('opportunities')
      ? db.crmDealEvent.findMany({
          where: { occurredAt: { gte: since } },
          orderBy: { occurredAt: 'desc' },
          take,
          include: {
            actor: person,
            deal: {
              select: {
                section: true,
                enquiry: { select: { id: true, name: true } },
                client: { select: { id: true, displayName: true } },
              },
            },
          },
        })
      : [],
    wants('consultations')
      ? db.consultationAppointmentEvent.findMany({
          where: { occurredAt: { gte: since } },
          orderBy: { occurredAt: 'desc' },
          take,
          include: {
            actor: person,
            appointment: {
              select: { client: { select: { id: true, displayName: true } } },
            },
          },
        })
      : [],
    wants('payments')
      ? db.officePaymentEvent.findMany({
          where: { occurredAt: { gte: since } },
          orderBy: { occurredAt: 'desc' },
          take,
          include: {
            actor: person,
            payment: { select: { receiptNumber: true, payerName: true } },
          },
        })
      : [],
    wants('tasks')
      ? db.operationsTaskEvent.findMany({
          where: { occurredAt: { gte: since } },
          orderBy: { occurredAt: 'desc' },
          take,
          include: {
            actor: person,
            task: { select: { kind: true, title: true } },
          },
        })
      : [],
    wants('calendar')
      ? db.contentCalendarItemEvent.findMany({
          where: { occurredAt: { gte: since } },
          orderBy: { occurredAt: 'desc' },
          take,
          include: { actor: person, item: { select: { title: true } } },
        })
      : [],
    wants('team')
      ? db.staffRoleAuditEvent.findMany({
          where: { occurredAt: { gte: since } },
          orderBy: { occurredAt: 'desc' },
          take,
          include: { actor: person, target: person },
        })
      : [],
  ]);

  const stage = (key: string) => sectionsCopy.stage[key] ?? key;
  const entries = mergeActivityLog([
    leadEvents.map((event): ActivityEntry => ({
      id: event.id,
      area: 'leads',
      at: event.createdAt,
      title: copy.leadStatus(label(event.fromStatus), label(event.toStatus)),
      subject: event.enquiry.name,
      href: href(`/crm/leads/${event.enquiry.id}`),
      actor: personLabel(event.actor),
    })),
    crmActivities.map((activity): ActivityEntry => ({
      id: activity.id,
      area: 'leads',
      at: activity.occurredAt,
      title: [
        crmCopy.activityTypeLabel[activity.type],
        activity.direction ? crmCopy.directionLabel[activity.direction] : null,
        activity.outcome ? crmCopy.outcomeLabel[activity.outcome] : null,
      ]
        .filter(Boolean)
        .join(' · '),
      subject: activity.enquiry?.name ?? activity.client?.displayName ?? null,
      href: activity.enquiry
        ? href(`/crm/leads/${activity.enquiry.id}`)
        : activity.client
          ? href(`/crm/contacts/${activity.client.id}`)
          : null,
      actor: personLabel(activity.actor),
    })),
    dealEvents.map((event): ActivityEntry => {
      const section = sectionsCopy.section[event.deal.section];
      return {
        id: event.id,
        area: 'opportunities',
        at: event.occurredAt,
        title:
          event.type === 'CREATED' || !event.fromStage
            ? sectionsCopy.dealCreated(section, stage(event.toStage))
            : sectionsCopy.dealMoved(
                section,
                stage(event.fromStage),
                stage(event.toStage),
              ),
        subject:
          event.deal.enquiry?.name ?? event.deal.client?.displayName ?? null,
        href: event.deal.enquiry
          ? href(`/crm/leads/${event.deal.enquiry.id}`)
          : event.deal.client
            ? href(`/crm/contacts/${event.deal.client.id}`)
            : null,
        actor: personLabel(event.actor),
      };
    }),
    consultationEvents.map((event): ActivityEntry => ({
      id: event.id,
      area: 'consultations',
      at: event.occurredAt,
      title: copy.consultation(consultationCopy.status[event.toStatus]),
      subject: event.appointment.client.displayName,
      href: href(`/crm/contacts/${event.appointment.client.id}`),
      actor: personLabel(event.actor),
      tone: event.toStatus === 'NO_SHOW' ? 'warning' : 'default',
    })),
    paymentEvents.map((event): ActivityEntry => ({
      id: event.id,
      area: 'payments',
      at: event.occurredAt,
      title:
        event.eventType === 'VOIDED'
          ? copy.paymentVoided(event.payment.receiptNumber)
          : copy.paymentRecorded(event.payment.receiptNumber),
      subject: event.payment.payerName,
      href: href('/office-payments'),
      actor: personLabel(event.actor),
      tone: event.eventType === 'VOIDED' ? 'warning' : 'success',
    })),
    taskEvents.map((event): ActivityEntry => ({
      id: event.id,
      area: 'tasks',
      at: event.occurredAt,
      title: (event.task.kind === 'APPROVAL' ? copy.approval : copy.task)(
        taskCopy.status[event.toStatus],
      ),
      subject: event.task.title,
      href: href(event.task.kind === 'APPROVAL' ? '/approvals' : '/tasks'),
      actor: personLabel(event.actor),
    })),
    calendarEvents.map((event): ActivityEntry => ({
      id: event.id,
      area: 'calendar',
      at: event.occurredAt,
      title: copy.calendar(calendarCopy.statusLabel[event.toStatus]),
      subject: event.item.title,
      href: href('/content-calendar'),
      actor: personLabel(event.actor),
    })),
    roleEvents.map((event): ActivityEntry => ({
      id: event.id,
      area: 'team',
      at: event.occurredAt,
      title:
        event.action === 'GRANTED'
          ? copy.roleGranted(event.roleKey)
          : copy.roleRevoked(event.roleKey),
      subject: personLabel(event.target),
      href: href('/team'),
      actor: personLabel(event.actor),
    })),
  ]);

  const dateTime = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: CONSULTATION_TIMEZONE,
    });

  return (
    <CrmShell locale={locale} user={user} current="activity">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>

      <section className="admin-panel" aria-label={copy.filters}>
        <form method="get" className={styles.inline}>
          <label className={styles.field}>
            <span>{copy.filters}</span>
            <select name="days" defaultValue={String(days)}>
              {activityPeriods.map((value) => (
                <option key={value} value={value}>
                  {copy.period(String(value))}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className="sr-only">{copy.allAreas}</span>
            <select name="area" defaultValue={area ?? ''}>
              <option value="">{copy.allAreas}</option>
              {activityAreas.map((value) => (
                <option key={value} value={value}>
                  {copy.area[value]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={styles.button}>
            {copy.apply}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        {entries.length === 0 ? (
          <p className={styles.empty}>{copy.empty}</p>
        ) : (
          <ol className="crm-timeline">
            {entries.map((entry) => (
              <li key={entry.id} data-kind={entry.area} data-tone={entry.tone}>
                <time dateTime={entry.at.toISOString()}>
                  {dateTime(entry.at)} · {copy.area[entry.area]}
                </time>
                <strong>{entry.title}</strong>
                {entry.subject ? (
                  <p>
                    {entry.href ? (
                      <Link href={entry.href}>
                        <bdi>{entry.subject}</bdi>
                      </Link>
                    ) : (
                      <bdi>{entry.subject}</bdi>
                    )}
                  </p>
                ) : null}
                {entry.actor ? (
                  <span className={styles.meta}>
                    <bdi>{entry.actor}</bdi>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
        {entries.length === ACTIVITY_LOG_LIMIT ? (
          <p className={styles.note}>
            {copy.limited(formatLocalizedNumber(ACTIVITY_LOG_LIMIT, locale))}
          </p>
        ) : null}
      </section>
    </CrmShell>
  );
}
