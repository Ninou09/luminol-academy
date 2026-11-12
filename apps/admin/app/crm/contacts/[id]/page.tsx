import { db } from '@luminol/database';
import { crmContactWhere } from '@luminol/database/crm';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  localizeHref,
} from '@luminol/localization';
import {
  CONSULTATION_TIMEZONE,
  utcToZonedLocal,
} from '@luminol/validation/consultations';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CrmActivityForm } from '../../../../components/crm-activity-form';
import { CrmShell } from '../../../../components/crm-shell';
import styles from '../../../../components/operations.module.css';
import { getConsultationsCopy } from '../../../../lib/consultations-localization';
import { requireCrmActor } from '../../../../lib/crm-actor.server';
import { getCrmCopy, parseCrmFeedback } from '../../../../lib/crm-localization';
import {
  buildCrmTimeline,
  personLabel,
  type CrmTimelineItem,
} from '../../../../lib/crm-timeline';
import { getOfficePaymentsCopy } from '../../../../lib/office-payments-localization';
import { getOperationsTasksCopy } from '../../../../lib/operations-tasks-localization';
import { getAdminRequestLocale } from '../../../../lib/request-locale';
import { createOperationsTaskAction } from '../../../tasks/actions';

type ContactPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    error?: string | string[] | undefined;
    saved?: string | string[] | undefined;
  }>;
};

const person = {
  select: { email: true, firstName: true, lastName: true },
} as const;

export default async function ContactPage({
  params,
  searchParams,
}: ContactPageProps) {
  const { user, actor, can } = await requireCrmActor();
  const scope = crmContactWhere(actor);
  if (!scope) notFound();
  const { id } = await params;
  if (id.length > 128) notFound();
  const locale = await getAdminRequestLocale();
  const copy = getCrmCopy(locale);
  const consultationCopy = getConsultationsCopy(locale);
  const paymentCopy = getOfficePaymentsCopy(locale);
  const taskCopy = getOperationsTasksCopy(locale);
  const query = searchParams ? await searchParams : undefined;
  const feedback = parseCrmFeedback(query?.error);
  const saved = query?.saved === '1';
  const todayIso = utcToZonedLocal(new Date()).slice(0, 10);
  const returnTo = localizeHref(locale, `/crm/contacts/${id}`);
  const ownScope = actor.consultationScope === 'own';

  const contact = await db.client.findFirst({
    where: { id, ...scope },
    include: {
      createdBy: person,
      sourceEnquiry: {
        select: { id: true, name: true, createdAt: true, consent: true },
      },
      appointments: {
        where: ownScope ? { consultantUserId: user.id } : {},
        orderBy: { startsAt: 'desc' },
        take: 50,
        include: { consultant: person },
      },
      payments: {
        where: ownScope
          ? {
              OR: [
                { recordedByUserId: user.id },
                { appointment: { consultantUserId: user.id } },
              ],
            }
          : {},
        orderBy: { receivedAt: 'desc' },
        take: 50,
      },
      tasks: {
        where: ownScope
          ? { OR: [{ assigneeUserId: user.id }, { createdByUserId: user.id }] }
          : {},
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { assignee: person },
      },
      activities: {
        orderBy: { occurredAt: 'desc' },
        take: 100,
        include: { actor: person },
      },
    },
  });
  if (!contact) notFound();

  const money = (minor: number) =>
    formatLocalizedCurrency(minor, 'DZD', locale);
  const dateTime = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: CONSULTATION_TIMEZONE,
    });
  const paidTotal = contact.payments
    .filter(({ status }) => status === 'RECORDED')
    .reduce((sum, { amountMinor }) => sum + amountMinor, 0);
  const canRecordPayment = Boolean(actor.paymentScope);
  const canAddTask = can('task:work');

  const timeline = buildCrmTimeline(
    [
      {
        id: `created-${contact.id}`,
        kind: 'client-created',
        at: contact.createdAt,
        title: copy.timelineTitle.clientCreated,
        actor: personLabel(contact.createdBy),
      },
    ],
    contact.appointments.map((appointment): CrmTimelineItem => ({
      id: appointment.id,
      kind: 'appointment',
      at: appointment.startsAt,
      title: copy.timelineTitle.appointment(
        consultationCopy.status[appointment.status],
      ),
      detail: `${consultationCopy.mode[appointment.mode]} · ${money(appointment.priceMinor)}`,
      actor: personLabel(appointment.consultant),
      tone: appointment.status === 'NO_SHOW' ? 'warning' : 'default',
    })),
    contact.payments.map((payment): CrmTimelineItem => ({
      id: payment.id,
      kind: 'payment',
      at: payment.receivedAt,
      title: copy.timelineTitle.payment(payment.receiptNumber),
      detail: `${money(payment.amountMinor)} · ${paymentCopy.method[payment.method]}${
        payment.status === 'VOIDED' ? ` · ${paymentCopy.voided}` : ''
      }`,
      tone: payment.status === 'VOIDED' ? 'warning' : 'success',
    })),
    contact.tasks.map((task): CrmTimelineItem => ({
      id: task.id,
      kind: 'task',
      at: task.createdAt,
      title: copy.timelineTitle.task(taskCopy.status[task.status]),
      detail: task.title,
      actor: personLabel(task.assignee),
    })),
    contact.activities.map((activity): CrmTimelineItem => ({
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
    })),
  );

  return (
    <CrmShell locale={locale} user={user} current="clients">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">
            {copy.eyebrow} · {copy.contact}
          </p>
          <h1>
            <bdi>{contact.displayName}</bdi>
          </h1>
          <p className={styles.meta}>
            {contact.phone ? <bdi dir="ltr">{contact.phone}</bdi> : null}
            {contact.email ? <bdi>{contact.email}</bdi> : null}
            <span
              className={
                contact.contactConsent ? styles.success : styles.warning
              }
            >
              {contact.contactConsent ? copy.consentYes : copy.consentNo}
            </span>
            <span>
              {copy.paidTotal}: <strong>{money(paidTotal)}</strong>
            </span>
          </p>
        </div>
        <div className={styles.actions}>
          <Link
            href={`${localizeHref(locale, `/consultations?client=${contact.id}`)}#book`}
          >
            {copy.bookConsultation}
          </Link>
          {canRecordPayment ? (
            <Link href={`${localizeHref(locale, '/office-payments')}#record`}>
              {copy.recordPayment}
            </Link>
          ) : null}
          <Link
            href={localizeHref(
              locale,
              `/clients?q=${encodeURIComponent(contact.displayName)}`,
            )}
          >
            {copy.editContact}
          </Link>
          {contact.sourceEnquiry && actor.canWorkEnquiries ? (
            <Link
              href={localizeHref(
                locale,
                `/crm/leads/${contact.sourceEnquiry.id}`,
              )}
            >
              {copy.sourceEnquiry}
            </Link>
          ) : null}
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
              subject={{ clientId: contact.id }}
              contactConsent={contact.contactConsent}
              returnTo={returnTo}
              todayIso={todayIso}
            />
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.timeline}</h2>
            </div>
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
          </section>
        </div>

        <aside className="crm-profile-side">
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.appointments}</h2>
            </div>
            {contact.appointments.length === 0 ? (
              <p className={styles.empty}>{copy.noAppointments}</p>
            ) : (
              <ul className={styles.list}>
                {contact.appointments.slice(0, 8).map((appointment) => (
                  <li className={styles.row} key={appointment.id}>
                    <span>{dateTime(appointment.startsAt)}</span>
                    <span className={styles.chip}>
                      {consultationCopy.status[appointment.status]}
                    </span>
                    {canRecordPayment &&
                    (appointment.status === 'CONFIRMED' ||
                      appointment.status === 'COMPLETED') ? (
                      <Link
                        href={`${localizeHref(
                          locale,
                          `/office-payments?appointment=${appointment.id}`,
                        )}#record`}
                      >
                        {copy.recordPayment}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.payments}</h2>
            </div>
            {contact.payments.length === 0 ? (
              <p className={styles.empty}>{copy.noPayments}</p>
            ) : (
              <ul className={styles.list}>
                {contact.payments.slice(0, 8).map((payment) => (
                  <li className={styles.row} key={payment.id}>
                    <bdi dir="ltr">{payment.receiptNumber}</bdi>
                    <strong>{money(payment.amountMinor)}</strong>
                    {payment.status === 'VOIDED' ? (
                      <span className={styles.warning}>
                        {paymentCopy.voided}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.tasks}</h2>
            </div>
            {contact.tasks.filter(({ status }) => status === 'OPEN').length ===
            0 ? (
              <p className={styles.empty}>{copy.noTasks}</p>
            ) : (
              <ul className={styles.list}>
                {contact.tasks
                  .filter(({ status }) => status === 'OPEN')
                  .map((task) => (
                    <li className={styles.row} key={task.id}>
                      <bdi>{task.title}</bdi>
                      {task.dueOn ? (
                        <span className={styles.meta}>
                          {task.dueOn.toISOString().slice(0, 10)}
                        </span>
                      ) : null}
                    </li>
                  ))}
              </ul>
            )}
            {canAddTask ? (
              <form action={createOperationsTaskAction} className={styles.form}>
                <input type="hidden" name="kind" value="TASK" />
                <input type="hidden" name="clientId" value={contact.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <label className={styles.field}>
                  <span>{copy.taskTitle}</span>
                  <input
                    type="text"
                    name="title"
                    minLength={3}
                    maxLength={160}
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>{copy.dueOn}</span>
                  <input type="date" name="dueOn" min={todayIso} />
                </label>
                <button type="submit" className={styles.secondaryButton}>
                  {copy.addTask}
                </button>
              </form>
            ) : null}
          </section>

          {contact.operationalNote ? (
            <section className="admin-panel">
              <p className={styles.note}>
                <bdi>{contact.operationalNote}</bdi>
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </CrmShell>
  );
}
