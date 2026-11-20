import { hasPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import { officePaymentScopeWhere } from '@luminol/database/office-payments';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import {
  CONSULTATION_TIMEZONE,
  minorToDinars,
  utcToZonedLocal,
  zonedDayRange,
} from '@luminol/validation/consultations';
import {
  officePaymentMethods,
  officePaymentPurposes,
  summarizeOfficePayments,
} from '@luminol/validation/office-payments';
import Link from 'next/link';

import styles from '../../components/operations.module.css';
import { CrmShell } from '../../components/crm-shell';
import { requireOfficePaymentActor } from '../../lib/office-payment-actor.server';
import {
  parseLedgerMonth,
  parseOfficePaymentFeedback,
  shiftLedgerMonth,
} from '../../lib/office-payment-scope';
import { getOfficePaymentsCopy } from '../../lib/office-payments-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { recordOfficePaymentAction, voidOfficePaymentAction } from './actions';

type OfficePaymentsPageProps = {
  searchParams?: Promise<{
    month?: string | string[] | undefined;
    appointment?: string | string[] | undefined;
    error?: string | string[] | undefined;
    saved?: string | string[] | undefined;
  }>;
};

function personLabel(person: {
  email: string;
  firstName: string | null;
  lastName: string | null;
}) {
  return (
    [person.firstName, person.lastName].filter(Boolean).join(' ') ||
    person.email
  );
}

export default async function OfficePaymentsPage({
  searchParams,
}: OfficePaymentsPageProps) {
  const { user, actor } = await requireOfficePaymentActor();
  const locale = await getAdminRequestLocale();
  const copy = getOfficePaymentsCopy(locale);
  const params = searchParams ? await searchParams : undefined;
  const now = new Date();
  const today = utcToZonedLocal(now).slice(0, 10);
  const month = parseLedgerMonth(params?.month, today.slice(0, 7));
  const feedback = parseOfficePaymentFeedback(params?.error);
  const saved = params?.saved === '1';
  const preselectedAppointment =
    typeof params?.appointment === 'string' ? params.appointment : '';
  const monthStart = zonedDayRange(`${month}-01`).start;
  const monthEnd = zonedDayRange(`${shiftLedgerMonth(month, 1)}-01`).start;
  const canVoid = hasPermission(user.roles, 'office-payment:void');
  const returnTo = localizeHref(locale, `/office-payments?month=${month}`);
  const recentWindowStart = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);

  const [payments, appointments, clients] = await Promise.all([
    db.officePayment.findMany({
      where: {
        ...officePaymentScopeWhere(actor),
        receivedAt: { gte: monthStart, lt: monthEnd },
      },
      orderBy: { receivedAt: 'desc' },
      take: 500,
      include: {
        recordedBy: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    }),
    db.consultationAppointment.findMany({
      where: {
        ...(actor.scope === 'own' ? { consultantUserId: actor.userId } : {}),
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        startsAt: { gte: recentWindowStart, lte: now },
      },
      orderBy: { startsAt: 'desc' },
      take: 100,
      include: { client: { select: { displayName: true } } },
    }),
    actor.scope === 'all'
      ? db.client.findMany({
          where: { archivedAt: null },
          orderBy: { displayName: 'asc' },
          take: 300,
          select: { id: true, displayName: true },
        })
      : Promise.resolve([]),
  ]);

  const totals = summarizeOfficePayments(payments);
  const money = (minor: number) =>
    formatLocalizedCurrency(minor, 'DZD', locale);
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const dateLabel = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: CONSULTATION_TIMEZONE,
    });
  const monthLabel = formatLocalizedDate(
    new Date(`${month}-15T12:00:00.000Z`),
    locale,
    { month: 'long', year: 'numeric', timeZone: 'UTC' },
  );
  const preselected = appointments.find(
    ({ id }) => id === preselectedAppointment,
  );

  return (
    <CrmShell locale={locale} user={user} current="payments">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
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

      <section className="metric-grid" aria-label={copy.totalReceived}>
        <article>
          <span>{copy.totalReceived}</span>
          <strong>{money(totals.totalMinor)}</strong>
        </article>
        <article>
          <span>{copy.paymentsCount}</span>
          <strong>{number(totals.count)}</strong>
        </article>
        {officePaymentPurposes.map((purpose) => (
          <article key={purpose}>
            <span>{copy.purpose[purpose]}</span>
            <strong>{money(totals.byPurpose[purpose])}</strong>
          </article>
        ))}
      </section>

      <section className="admin-panel" id="record">
        <div className="panel-heading">
          <div>
            <h2>{copy.recordTitle}</h2>
            <p className={styles.note}>
              {actor.scope === 'own'
                ? copy.consultantRecordIntro
                : copy.recordIntro}
            </p>
          </div>
        </div>
        {actor.scope === 'own' && appointments.length === 0 ? (
          <p className={styles.empty}>{copy.noAppointments}</p>
        ) : (
          <form action={recordOfficePaymentAction} className={styles.form}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className={styles.grid}>
              <label className={styles.field}>
                <span>{copy.appointmentLabel}</span>
                <select
                  name="appointmentId"
                  defaultValue={preselected?.id ?? ''}
                  required={actor.scope === 'own'}
                >
                  <option value="">—</option>
                  {appointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {utcToZonedLocal(appointment.startsAt).replace('T', ' ')}{' '}
                      · {appointment.client.displayName}
                    </option>
                  ))}
                </select>
              </label>
              {actor.scope === 'all' ? (
                <>
                  <label className={styles.field}>
                    <span>{copy.clientLabel}</span>
                    <select name="clientId" defaultValue="">
                      <option value="">{copy.noClient}</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>{copy.payerLabel}</span>
                    <input
                      type="text"
                      name="payerName"
                      minLength={2}
                      maxLength={120}
                      defaultValue={preselected?.client.displayName ?? ''}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>{copy.purposeLabel}</span>
                    <select
                      name="purpose"
                      defaultValue={preselected ? 'CONSULTATION' : 'PROGRAMME'}
                    >
                      {officePaymentPurposes.map((purpose) => (
                        <option key={purpose} value={purpose}>
                          {copy.purpose[purpose]}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}
              <label className={styles.field}>
                <span>{copy.descriptionLabel}</span>
                <input
                  type="text"
                  name="description"
                  minLength={2}
                  maxLength={160}
                  defaultValue={
                    preselected || actor.scope === 'own'
                      ? copy.defaultConsultationDescription
                      : ''
                  }
                  required
                />
              </label>
              <label className={styles.field}>
                <span>{copy.amountLabel}</span>
                <input
                  type="number"
                  name="amountDinars"
                  min={1}
                  max={10000000}
                  step={1}
                  inputMode="numeric"
                  defaultValue={
                    preselected ? minorToDinars(preselected.priceMinor) : ''
                  }
                  required
                />
              </label>
              <label className={styles.field}>
                <span>{copy.methodLabel}</span>
                <select name="method" defaultValue="CASH">
                  {officePaymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {copy.method[method]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>{copy.referenceLabel}</span>
                <input
                  type="text"
                  name="externalReference"
                  maxLength={80}
                  dir="ltr"
                  aria-describedby="reference-help"
                />
                <small id="reference-help" className={styles.note}>
                  {copy.referenceHelp}
                </small>
              </label>
              <label className={styles.field}>
                <span>{copy.receivedOnLabel}</span>
                <input
                  type="date"
                  name="receivedOn"
                  defaultValue={today}
                  max={today}
                  required
                />
              </label>
            </div>
            <p className={styles.note}>{copy.boundary}</p>
            <div>
              <button type="submit" className={styles.button}>
                {copy.record}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <h2>
              {copy.ledgerTitle} · {copy.monthOf(monthLabel)}
            </h2>
            <p className={styles.meta}>
              {copy.byMethod}:{' '}
              {officePaymentMethods.map((method) => (
                <span key={method}>
                  {copy.method[method]} {money(totals.byMethod[method])}
                </span>
              ))}
            </p>
          </div>
          <div className={styles.actions}>
            <Link
              href={localizeHref(
                locale,
                `/office-payments?month=${shiftLedgerMonth(month, -1)}`,
              )}
            >
              {copy.previousMonth}
            </Link>
            <Link href={localizeHref(locale, '/office-payments')}>
              {copy.thisMonth}
            </Link>
            <Link
              href={localizeHref(
                locale,
                `/office-payments?month=${shiftLedgerMonth(month, 1)}`,
              )}
            >
              {copy.nextMonth}
            </Link>
          </div>
        </div>
        {payments.length === 0 ? (
          <p className={styles.empty}>{copy.noPayments}</p>
        ) : (
          <ul className={styles.list}>
            {payments.map((payment) => (
              <li className={styles.row} key={payment.id}>
                <div className={styles.rowBody}>
                  <h3>
                    <bdi dir="ltr">{payment.receiptNumber}</bdi> ·{' '}
                    <bdi>{payment.payerName}</bdi>
                  </h3>
                  <p className={styles.meta}>
                    <strong>{money(payment.amountMinor)}</strong>
                    <span>{copy.method[payment.method]}</span>
                    <span>{copy.purpose[payment.purpose]}</span>
                    <span>{dateLabel(payment.receivedAt)}</span>
                    {payment.externalReference ? (
                      <bdi dir="ltr">{payment.externalReference}</bdi>
                    ) : null}
                    {payment.status === 'VOIDED' ? (
                      <span className={`${styles.chip} ${styles.warning}`}>
                        {copy.voided}
                      </span>
                    ) : null}
                  </p>
                  <p className={styles.note}>
                    <bdi>{payment.description}</bdi> · {copy.recordedBy}{' '}
                    <bdi>{personLabel(payment.recordedBy)}</bdi>
                  </p>
                  {payment.voidReason ? (
                    <p className={styles.note}>
                      <bdi>{payment.voidReason}</bdi>
                    </p>
                  ) : null}
                </div>
                {canVoid && payment.status === 'RECORDED' ? (
                  <details>
                    <summary>{copy.void}</summary>
                    <form
                      action={voidOfficePaymentAction}
                      className={styles.form}
                    >
                      <input
                        type="hidden"
                        name="paymentId"
                        value={payment.id}
                      />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <label className={styles.field}>
                        <span>{copy.voidReasonLabel}</span>
                        <input
                          type="text"
                          name="reason"
                          minLength={5}
                          maxLength={240}
                          required
                        />
                      </label>
                      <button type="submit" className={styles.dangerButton}>
                        {copy.void}
                      </button>
                    </form>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </CrmShell>
  );
}
