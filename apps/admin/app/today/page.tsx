import { hasPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import { appointmentScopeWhere } from '@luminol/database/consultations';
import { officePaymentScopeWhere } from '@luminol/database/office-payments';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import {
  CONSULTATION_TIMEZONE,
  utcToZonedLocal,
  zonedDayRange,
  zonedLocalToUtc,
} from '@luminol/validation/consultations';
import { crmSectionSlugs } from '@luminol/validation/crm-sections';
import { summarizeOfficePayments } from '@luminol/validation/office-payments';
import Link from 'next/link';

import { CrmShell } from '../../components/crm-shell';
import { OperationsTaskItem } from '../../components/operations-task-item';
import styles from '../../components/operations.module.css';
import {
  resolveConsultationScope,
  shiftLocalDate,
} from '../../lib/consultation-scope';
import { getConsultationsCopy } from '../../lib/consultations-localization';
import { getCrmSectionsCopy } from '../../lib/crm-sections-localization';
import { resolveOfficePaymentScope } from '../../lib/office-payment-scope';
import { requireOperationsTaskActor } from '../../lib/operations-task-actor.server';
import {
  getOperationsTasksCopy,
  getTodayCopy,
} from '../../lib/operations-tasks-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { newLeadsWhere } from '../../lib/staff-badges.server';

const ACTIVE_ENQUIRY_STATUSES = ['NEW', 'IN_REVIEW', 'CONTACTED'] as const;

const personSelect = {
  select: { email: true, firstName: true, lastName: true },
} as const;

export default async function TodayPage() {
  const { user, actor } = await requireOperationsTaskActor();
  const locale = await getAdminRequestLocale();
  const copy = getTodayCopy(locale);
  const taskCopy = getOperationsTasksCopy(locale);
  const consultationCopy = getConsultationsCopy(locale);
  const sectionsCopy = getCrmSectionsCopy(locale);
  const can = (permission: Parameters<typeof hasPermission>[1]) =>
    hasPermission(user.roles, permission);
  const now = new Date();
  const todayIso = utcToZonedLocal(now).slice(0, 10);
  const { start, end } = zonedDayRange(todayIso);
  const weekEnd = zonedDayRange(todayIso, 7).end;
  const monthStart = zonedLocalToUtc(`${todayIso.slice(0, 8)}01T00:00`);
  const taskHorizon = new Date(`${shiftLocalDate(todayIso, 7)}T00:00:00.000Z`);
  const consultationScope = resolveConsultationScope(can);
  const paymentScope = resolveOfficePaymentScope(can);
  const worksEnquiries = can('enquiry:work');
  const ownsEnquiryDesk = can('academy:manage');
  const seesSections = worksEnquiries || Boolean(consultationScope);
  const returnTo = localizeHref(locale, '/today');
  const include = {
    assignee: personSelect,
    createdBy: personSelect,
    decidedBy: personSelect,
  } as const;
  const appointmentScope = consultationScope
    ? appointmentScopeWhere({ userId: user.id, scope: consultationScope })
    : null;

  const [
    appointments,
    upcomingConsultations,
    payments,
    newLeads,
    followUps,
    tasks,
    approvals,
    offers,
  ] = await Promise.all([
    appointmentScope
      ? db.consultationAppointment.findMany({
          where: {
            ...appointmentScope,
            startsAt: { gte: start, lt: end },
            status: { in: ['REQUESTED', 'CONFIRMED', 'COMPLETED'] },
          },
          orderBy: { startsAt: 'asc' },
          take: 50,
          include: {
            client: { select: { id: true, displayName: true, phone: true } },
          },
        })
      : Promise.resolve([]),
    appointmentScope
      ? db.consultationAppointment.count({
          where: {
            ...appointmentScope,
            startsAt: { gte: now, lt: weekEnd },
            status: { in: ['REQUESTED', 'CONFIRMED'] },
          },
        })
      : Promise.resolve(0),
    paymentScope
      ? db.officePayment.findMany({
          where: {
            ...officePaymentScopeWhere({
              userId: user.id,
              scope: paymentScope,
            }),
            receivedAt: { gte: monthStart, lt: end },
          },
          select: {
            amountMinor: true,
            method: true,
            purpose: true,
            status: true,
            receivedAt: true,
          },
        })
      : Promise.resolve([]),
    worksEnquiries
      ? db.enquiry.count({ where: newLeadsWhere(user.id, ownsEnquiryDesk) })
      : Promise.resolve(0),
    worksEnquiries
      ? db.enquiry.findMany({
          where: {
            consent: true,
            status: { in: [...ACTIVE_ENQUIRY_STATUSES] },
            nextFollowUpAt: { lt: end },
            ...(ownsEnquiryDesk ? {} : { ownerUserId: user.id }),
          },
          orderBy: { nextFollowUpAt: 'asc' },
          take: 30,
          select: {
            id: true,
            name: true,
            phone: true,
            school: true,
            nextAction: true,
            nextFollowUpAt: true,
            owner: personSelect,
          },
        })
      : Promise.resolve([]),
    db.operationsTask.findMany({
      where: {
        kind: 'TASK',
        status: 'OPEN',
        assigneeUserId: user.id,
        OR: [
          { dueOn: { lte: taskHorizon } },
          { dueOn: null, priority: 'HIGH' },
        ],
      },
      orderBy: [{ dueOn: { sort: 'asc', nulls: 'last' } }],
      take: 30,
      include,
    }),
    db.operationsTask.findMany({
      where: actor.canDecide
        ? { kind: 'APPROVAL', status: 'OPEN' }
        : { kind: 'APPROVAL', status: 'OPEN', createdByUserId: user.id },
      orderBy: { createdAt: 'asc' },
      take: 30,
      include,
    }),
    seesSections
      ? db.crmOffer.findMany({
          where: {
            status: { in: ['DRAFT', 'OPEN', 'FULL'] },
            startsOn: { gte: new Date(`${todayIso}T00:00:00.000Z`) },
          },
          orderBy: { startsOn: 'asc' },
          take: 6,
          select: {
            id: true,
            section: true,
            title: true,
            startsOn: true,
            capacity: true,
            status: true,
            _count: {
              select: { deals: { where: { state: { in: ['OPEN', 'WON'] } } } },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const monthTotals = summarizeOfficePayments(payments);
  const todayTotals = summarizeOfficePayments(
    payments.filter(({ receivedAt }) => receivedAt >= start),
  );
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const money = (minor: number) =>
    formatLocalizedCurrency(minor, 'DZD', locale);
  const time = (value: Date) =>
    formatLocalizedDate(value, locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: CONSULTATION_TIMEZONE,
    });
  const day = (value: Date) =>
    formatLocalizedDate(value, locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  const todayLabel = formatLocalizedDate(now, locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: CONSULTATION_TIMEZONE,
  });
  const pendingDecisions = approvals.length;
  const itemProps = {
    actor,
    copy: taskCopy,
    locale,
    todayIso,
    returnTo,
  };

  return (
    <CrmShell locale={locale} user={user} current="today">
      <section className="today-header">
        <div>
          <h1>{copy.title}</h1>
          <p className={styles.meta}>
            {todayLabel} · {copy.intro}
          </p>
        </div>
      </section>

      <section className="today-kpis" aria-label={copy.title}>
        {worksEnquiries ? (
          <Link
            className="today-kpi"
            data-tone="psychology"
            href={localizeHref(locale, '/crm/pipeline')}
          >
            <strong>{number(newLeads)}</strong>
            <span>{copy.kpiNewLeads}</span>
          </Link>
        ) : null}
        {consultationScope ? (
          <Link
            className="today-kpi"
            data-tone="languages"
            href={localizeHref(locale, '/consultations')}
          >
            <strong>{number(upcomingConsultations)}</strong>
            <span>{copy.kpiConsultations}</span>
          </Link>
        ) : null}
        <Link
          className="today-kpi"
          data-tone="training"
          href={localizeHref(locale, '/tasks')}
        >
          <strong>{number(pendingDecisions)}</strong>
          <span>{copy.kpiDecisions}</span>
        </Link>
        {paymentScope ? (
          <Link
            className="today-kpi"
            data-tone="ink"
            href={localizeHref(locale, '/office-payments')}
          >
            <strong>{money(monthTotals.totalMinor)}</strong>
            <span>
              {copy.kpiMonthRevenue} ·{' '}
              {copy.kpiReceivedToday(money(todayTotals.totalMinor))}
            </span>
          </Link>
        ) : null}
      </section>

      <div className="today-grid">
        <div className="today-column">
          {consultationScope ? (
            <section className="admin-panel today-panel">
              <div className="panel-heading">
                <h2>{copy.appointmentsTitle}</h2>
                <Link href={localizeHref(locale, '/consultations')}>
                  {copy.openWorkspace}
                </Link>
              </div>
              {appointments.length === 0 ? (
                <p className={styles.empty}>{copy.noAppointments}</p>
              ) : (
                <ul className={styles.list}>
                  {appointments.map((appointment) => (
                    <li className={styles.row} key={appointment.id}>
                      <span>
                        <strong>{time(appointment.startsAt)}</strong> ·{' '}
                        <Link
                          href={localizeHref(
                            locale,
                            `/crm/contacts/${appointment.client.id}`,
                          )}
                        >
                          <bdi>{appointment.client.displayName}</bdi>
                        </Link>
                        {appointment.client.phone ? (
                          <>
                            {' '}
                            · <bdi dir="ltr">{appointment.client.phone}</bdi>
                          </>
                        ) : null}
                      </span>
                      <span className={styles.meta}>
                        <span className={styles.chip}>
                          {consultationCopy.status[appointment.status]}
                        </span>
                        <span>{consultationCopy.mode[appointment.mode]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {worksEnquiries ? (
            <section className="admin-panel today-panel">
              <div className="panel-heading">
                <div>
                  <h2>{copy.followUpsTitle}</h2>
                  <p className={styles.note}>{copy.followUpsIntro}</p>
                </div>
                <Link href={localizeHref(locale, '/crm/pipeline')}>
                  {copy.openWorkspace}
                </Link>
              </div>
              {followUps.length === 0 ? (
                <p className={styles.empty}>{copy.noFollowUps}</p>
              ) : (
                <ul className={styles.list}>
                  {followUps.map((enquiry) => {
                    const overdue = Boolean(
                      enquiry.nextFollowUpAt && enquiry.nextFollowUpAt < start,
                    );
                    return (
                      <li className={styles.row} key={enquiry.id}>
                        <span>
                          <Link
                            href={localizeHref(
                              locale,
                              `/crm/leads/${enquiry.id}`,
                            )}
                          >
                            <strong>
                              <bdi>{enquiry.name}</bdi>
                            </strong>
                          </Link>
                          {enquiry.nextAction ? (
                            <>
                              {' '}
                              · <bdi>{enquiry.nextAction}</bdi>
                            </>
                          ) : null}
                        </span>
                        <span className={styles.meta}>
                          <span
                            className={overdue ? styles.warning : undefined}
                          >
                            {overdue
                              ? taskCopy.overdue
                              : enquiry.nextFollowUpAt
                                ? day(enquiry.nextFollowUpAt)
                                : null}
                          </span>
                          <Link
                            className={styles.secondaryButton}
                            href={localizeHref(
                              locale,
                              `/crm/leads/${enquiry.id}`,
                            )}
                          >
                            {copy.openWorkspace}
                          </Link>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : null}

          {seesSections ? (
            <section className="admin-panel today-panel">
              <div className="panel-heading">
                <h2>{copy.upcomingTitle}</h2>
              </div>
              {offers.length === 0 ? (
                <p className={styles.empty}>{copy.noUpcoming}</p>
              ) : (
                <ul className={styles.list}>
                  {offers.map((offer) => (
                    <li className={styles.row} key={offer.id}>
                      <span>
                        <Link
                          href={localizeHref(
                            locale,
                            offer.section === 'EVENTS'
                              ? `/crm/events/${offer.id}`
                              : `/crm/sections/${crmSectionSlugs[offer.section]}`,
                          )}
                        >
                          <strong>
                            <bdi>{offer.title}</bdi>
                          </strong>
                        </Link>{' '}
                        · {sectionsCopy.section[offer.section]}
                      </span>
                      <span className={styles.meta}>
                        {offer.startsOn ? (
                          <span>{day(offer.startsOn)}</span>
                        ) : null}
                        {offer.capacity ? (
                          <span>
                            {copy.upcomingFill(
                              number(offer._count.deals),
                              number(offer.capacity),
                            )}
                          </span>
                        ) : null}
                        <span className={styles.chip}>
                          {sectionsCopy.offerStatus[offer.status]}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>

        <div className="today-column">
          <section className="admin-panel today-panel">
            <div className="panel-heading">
              <h2>
                {actor.canDecide ? copy.approvalsTitle : copy.myRequestsTitle}
              </h2>
            </div>
            {approvals.length === 0 ? (
              <p className={styles.empty}>{copy.noApprovals}</p>
            ) : (
              <ul className={styles.list}>
                {approvals.map((task) => (
                  <OperationsTaskItem
                    key={task.id}
                    task={task}
                    {...itemProps}
                  />
                ))}
              </ul>
            )}
            <p className={styles.note}>{taskCopy.approvalBoundary}</p>
          </section>

          <section className="admin-panel today-panel">
            <div className="panel-heading">
              <h2>{copy.tasksTitle}</h2>
              <Link href={localizeHref(locale, '/tasks')}>
                {copy.openWorkspace}
              </Link>
            </div>
            {tasks.length === 0 ? (
              <p className={styles.empty}>{copy.noTasks}</p>
            ) : (
              <ul className={styles.list}>
                {tasks.map((task) => (
                  <OperationsTaskItem
                    key={task.id}
                    task={task}
                    {...itemProps}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="admin-panel today-panel">
            <div className="panel-heading">
              <h2>{copy.rulesTitle}</h2>
            </div>
            <ul className="today-rules">
              {copy.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </CrmShell>
  );
}
