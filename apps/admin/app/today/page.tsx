import { hasPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import { appointmentScopeWhere } from '@luminol/database/consultations';
import { officePaymentScopeWhere } from '@luminol/database/office-payments';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import {
  CONSULTATION_TIMEZONE,
  utcToZonedLocal,
  zonedDayRange,
} from '@luminol/validation/consultations';
import { summarizeOfficePayments } from '@luminol/validation/office-payments';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { OperationsTaskItem } from '../../components/operations-task-item';
import styles from '../../components/operations.module.css';
import { StaffNavigation } from '../../components/staff-navigation';
import { resolveConsultationScope } from '../../lib/consultation-scope';
import { getConsultationsCopy } from '../../lib/consultations-localization';
import { resolveOfficePaymentScope } from '../../lib/office-payment-scope';
import { requireOperationsTaskActor } from '../../lib/operations-task-actor.server';
import {
  getOperationsTasksCopy,
  getTodayCopy,
} from '../../lib/operations-tasks-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';

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
  const common = getCommonDictionary(locale);
  const can = (permission: Parameters<typeof hasPermission>[1]) =>
    hasPermission(user.roles, permission);
  const now = new Date();
  const todayIso = utcToZonedLocal(now).slice(0, 10);
  const { start, end } = zonedDayRange(todayIso);
  const consultationScope = resolveConsultationScope(can);
  const paymentScope = resolveOfficePaymentScope(can);
  const worksEnquiries = can('enquiry:work');
  const ownsEnquiryDesk = can('academy:manage');
  const returnTo = localizeHref(locale, '/today');
  const include = {
    assignee: personSelect,
    createdBy: personSelect,
    decidedBy: personSelect,
  } as const;

  const [appointments, payments, followUps, tasks, approvals] =
    await Promise.all([
      consultationScope
        ? db.consultationAppointment.findMany({
            where: {
              ...appointmentScopeWhere({
                userId: user.id,
                scope: consultationScope,
              }),
              startsAt: { gte: start, lt: end },
              status: { in: ['REQUESTED', 'CONFIRMED', 'COMPLETED'] },
            },
            orderBy: { startsAt: 'asc' },
            take: 50,
            include: {
              client: { select: { displayName: true, phone: true } },
            },
          })
        : Promise.resolve([]),
      paymentScope
        ? db.officePayment.findMany({
            where: {
              ...officePaymentScopeWhere({
                userId: user.id,
                scope: paymentScope,
              }),
              receivedAt: { gte: start, lt: end },
            },
            select: {
              amountMinor: true,
              method: true,
              purpose: true,
              status: true,
            },
          })
        : Promise.resolve([]),
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
              nextAction: true,
              nextFollowUpAt: true,
            },
          })
        : Promise.resolve([]),
      db.operationsTask.findMany({
        where: {
          kind: 'TASK',
          status: 'OPEN',
          assigneeUserId: user.id,
          OR: [
            { dueOn: { lte: new Date(`${todayIso}T00:00:00.000Z`) } },
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
    ]);

  const totals = summarizeOfficePayments(payments);
  const money = (minor: number) =>
    formatLocalizedCurrency(minor, 'DZD', locale);
  const time = (value: Date) =>
    formatLocalizedDate(value, locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: CONSULTATION_TIMEZONE,
    });
  const todayLabel = formatLocalizedDate(now, locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: CONSULTATION_TIMEZONE,
  });
  const itemProps = {
    actor,
    copy: taskCopy,
    locale,
    todayIso,
    returnTo,
  };

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
              <h1>
                {copy.title} · {todayLabel}
              </h1>
              <p>{copy.intro}</p>
            </div>
            <div className={styles.toolbar}>
              <StaffNavigation
                locale={locale}
                roles={user.roles}
                current="today"
              />
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          {consultationScope ? (
            <section className="admin-panel">
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
                        <bdi>{appointment.client.displayName}</bdi>
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

          {paymentScope ? (
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>{copy.paymentsTitle}</h2>
                <Link href={localizeHref(locale, '/office-payments')}>
                  {copy.openWorkspace}
                </Link>
              </div>
              <p>
                <strong>
                  {copy.paymentsToday(
                    money(totals.totalMinor),
                    formatLocalizedNumber(totals.count, locale),
                  )}
                </strong>
              </p>
            </section>
          ) : null}

          {worksEnquiries ? (
            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <h2>{copy.followUpsTitle}</h2>
                  <p className={styles.note}>{copy.followUpsIntro}</p>
                </div>
                <Link href={localizeHref(locale, '/enquiries')}>
                  {copy.openWorkspace}
                </Link>
              </div>
              {followUps.length === 0 ? (
                <p className={styles.empty}>{copy.noFollowUps}</p>
              ) : (
                <ul className={styles.list}>
                  {followUps.map((enquiry) => (
                    <li className={styles.row} key={enquiry.id}>
                      <span>
                        <bdi>{enquiry.name}</bdi>
                        {enquiry.phone ? (
                          <>
                            {' '}
                            · <bdi dir="ltr">{enquiry.phone}</bdi>
                          </>
                        ) : null}
                      </span>
                      <span className={styles.meta}>
                        {enquiry.nextAction ? (
                          <bdi>{enquiry.nextAction}</bdi>
                        ) : null}
                        {enquiry.nextFollowUpAt &&
                        enquiry.nextFollowUpAt < start ? (
                          <span className={styles.warning}>
                            {taskCopy.overdue}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          <section className="admin-panel">
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

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>
                {actor.canDecide ? copy.approvalsTitle : copy.myRequestsTitle}
              </h2>
            </div>
            <p className={styles.note}>{taskCopy.approvalBoundary}</p>
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
          </section>
        </div>
      </section>
    </main>
  );
}
