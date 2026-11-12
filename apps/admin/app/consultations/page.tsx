import { hasPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  appointmentScopeWhere,
  clientScopeWhere,
  consultationDurationMinutes,
  listEligibleConsultants,
} from '@luminol/database/consultations';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import {
  CONSULTATION_TIMEZONE,
  consultationModes,
  consultationTransitions,
  localDateSchema,
  minorToDinars,
  utcToZonedLocal,
  zonedDayRange,
  type ConsultationStatusValue,
} from '@luminol/validation/consultations';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import styles from '../../components/operations.module.css';
import { StaffNavigation } from '../../components/staff-navigation';
import { requireConsultationActor } from '../../lib/consultation-actor.server';
import {
  consultationDurations,
  consultationStartTimes,
  parseConsultationFeedback,
  shiftLocalDate,
} from '../../lib/consultation-scope';
import { getConsultationsCopy } from '../../lib/consultations-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  createConsultationAction,
  rescheduleConsultationAction,
  transitionConsultationAction,
  updateConsultationNoteAction,
} from './actions';

type ConsultationsPageProps = {
  searchParams?: Promise<{
    date?: string | string[] | undefined;
    client?: string | string[] | undefined;
    error?: string | string[] | undefined;
    saved?: string | string[] | undefined;
  }>;
};

function personName(person: {
  email: string;
  firstName: string | null;
  lastName: string | null;
}) {
  return (
    [person.firstName, person.lastName].filter(Boolean).join(' ') ||
    person.email
  );
}

export default async function ConsultationsPage({
  searchParams,
}: ConsultationsPageProps) {
  const { user, actor } = await requireConsultationActor();
  const locale = await getAdminRequestLocale();
  const copy = getConsultationsCopy(locale);
  const common = getCommonDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const today = utcToZonedLocal(new Date()).slice(0, 10);
  const requestedDate =
    typeof params?.date === 'string' &&
    localDateSchema.safeParse(params.date).success
      ? params.date
      : today;
  const preselectedClient =
    typeof params?.client === 'string' ? params.client : '';
  const feedback = parseConsultationFeedback(params?.error);
  const saved = params?.saved === '1';
  const { start, end } = zonedDayRange(requestedDate, 7);
  const basePath = '/consultations';
  const returnTo = localizeHref(locale, `${basePath}?date=${requestedDate}`);

  const [appointments, clients, consultants, lastPrice] = await Promise.all([
    db.consultationAppointment.findMany({
      where: {
        ...appointmentScopeWhere(actor),
        startsAt: { gte: start, lt: end },
      },
      orderBy: { startsAt: 'asc' },
      take: 300,
      include: {
        client: { select: { id: true, displayName: true, phone: true } },
        consultant: {
          select: { email: true, firstName: true, lastName: true },
        },
        payments: {
          where: { status: 'RECORDED' },
          select: { amountMinor: true },
        },
      },
    }),
    db.client.findMany({
      where: { archivedAt: null, ...clientScopeWhere(actor) },
      orderBy: { updatedAt: 'desc' },
      take: 300,
      select: { id: true, displayName: true, phone: true },
    }),
    actor.scope === 'all' ? listEligibleConsultants(db) : Promise.resolve([]),
    db.consultationAppointment.findFirst({
      where: appointmentScopeWhere(actor),
      orderBy: { createdAt: 'desc' },
      select: { priceMinor: true },
    }),
  ]);

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const money = (minor: number) =>
    formatLocalizedCurrency(minor, 'DZD', locale);
  const dayLabel = (localDate: string) =>
    formatLocalizedDate(new Date(`${localDate}T12:00:00.000Z`), locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    });
  const timeLabel = (value: Date) =>
    formatLocalizedDate(value, locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: CONSULTATION_TIMEZONE,
    });

  const days = Array.from({ length: 7 }, (_, index) =>
    shiftLocalDate(requestedDate, index),
  );
  const byDay = new Map<string, typeof appointments>();
  for (const appointment of appointments) {
    const key = utcToZonedLocal(appointment.startsAt).slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), appointment]);
  }
  const statusCounts = appointments.reduce<
    Partial<Record<ConsultationStatusValue, number>>
  >((counts, appointment) => {
    counts[appointment.status] = (counts[appointment.status] ?? 0) + 1;
    return counts;
  }, {});
  const canRecordPayment = hasPermission(user.roles, 'office-payment:record');
  const canBook =
    clients.length > 0 && (actor.scope === 'own' || consultants.length > 0);

  const dateTimeFields = (defaults: {
    date: string;
    time: string;
    duration: number;
  }) => (
    <>
      <label className={styles.field}>
        <span>{copy.dateLabel}</span>
        <input type="date" name="date" defaultValue={defaults.date} required />
      </label>
      <label className={styles.field}>
        <span>{copy.timeLabel}</span>
        <select name="time" defaultValue={defaults.time} required>
          {consultationStartTimes().map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>{copy.durationLabel}</span>
        <select
          name="durationMinutes"
          defaultValue={String(defaults.duration)}
          required
        >
          {consultationDurations.map((duration) => (
            <option key={duration} value={duration}>
              {copy.minutes(number(duration))}
            </option>
          ))}
        </select>
      </label>
    </>
  );

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
              <StaffNavigation
                locale={locale}
                roles={user.roles}
                current="consultations"
              />
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
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

          <section className="metric-grid" aria-label={copy.title}>
            {(['REQUESTED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW'] as const).map(
              (status) => (
                <article key={status}>
                  <span>{copy.status[status]}</span>
                  <strong>{number(statusCounts[status] ?? 0)}</strong>
                </article>
              ),
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.weekOf(dayLabel(requestedDate))}</h2>
                <p className={styles.note}>{copy.hours}</p>
              </div>
              <div className={styles.actions}>
                <Link
                  href={localizeHref(
                    locale,
                    `${basePath}?date=${shiftLocalDate(requestedDate, -7)}`,
                  )}
                >
                  {copy.previousWeek}
                </Link>
                <Link href={localizeHref(locale, basePath)}>
                  {copy.thisWeek}
                </Link>
                <Link
                  href={localizeHref(
                    locale,
                    `${basePath}?date=${shiftLocalDate(requestedDate, 7)}`,
                  )}
                >
                  {copy.nextWeek}
                </Link>
                <form className={styles.inline} method="get">
                  <input
                    type="date"
                    name="date"
                    defaultValue={requestedDate}
                    aria-label={copy.dateLabel}
                  />
                  <button type="submit" className={styles.secondaryButton}>
                    {copy.go}
                  </button>
                </form>
              </div>
            </div>

            {appointments.length === 0 ? (
              <p className={styles.empty}>{copy.noAppointments}</p>
            ) : (
              days
                .filter((localDate) => byDay.has(localDate))
                .map((localDate) => (
                  <section key={localDate} aria-label={dayLabel(localDate)}>
                    <h3>{dayLabel(localDate)}</h3>
                    <ul className={styles.list}>
                      {(byDay.get(localDate) ?? []).map((appointment) => {
                        const local = utcToZonedLocal(appointment.startsAt);
                        const transitions =
                          consultationTransitions[appointment.status];
                        const upcoming =
                          appointment.status === 'REQUESTED' ||
                          appointment.status === 'CONFIRMED';
                        return (
                          <li className={styles.row} key={appointment.id}>
                            <div className={styles.rowBody}>
                              <h3>
                                {timeLabel(appointment.startsAt)}–
                                {timeLabel(appointment.endsAt)} ·{' '}
                                <bdi>{appointment.client.displayName}</bdi>
                              </h3>
                              <p className={styles.meta}>
                                <span className={styles.chip}>
                                  {copy.status[appointment.status]}
                                </span>
                                <span>{copy.mode[appointment.mode]}</span>
                                <span>{money(appointment.priceMinor)}</span>
                                {appointment.payments.length > 0 ? (
                                  <span className={styles.success}>
                                    {copy.paid}{' '}
                                    {money(
                                      appointment.payments.reduce(
                                        (sum, { amountMinor }) =>
                                          sum + amountMinor,
                                        0,
                                      ),
                                    )}
                                  </span>
                                ) : null}
                                {appointment.client.phone ? (
                                  <bdi>{appointment.client.phone}</bdi>
                                ) : null}
                                {actor.scope === 'all' ? (
                                  <span>
                                    {copy.consultantLabel}:{' '}
                                    <bdi>
                                      {personName(appointment.consultant)}
                                    </bdi>
                                  </span>
                                ) : null}
                              </p>
                              {appointment.operationalNote ? (
                                <p className={styles.note}>
                                  {appointment.operationalNote}
                                </p>
                              ) : null}
                            </div>
                            <div className={styles.rowBody}>
                              {transitions.length > 0 ? (
                                <div className={styles.actions}>
                                  {transitions.map((toStatus) => (
                                    <form
                                      key={toStatus}
                                      action={transitionConsultationAction}
                                    >
                                      <input
                                        type="hidden"
                                        name="appointmentId"
                                        value={appointment.id}
                                      />
                                      <input
                                        type="hidden"
                                        name="revision"
                                        value={appointment.revision}
                                      />
                                      <input
                                        type="hidden"
                                        name="toStatus"
                                        value={toStatus}
                                      />
                                      <input
                                        type="hidden"
                                        name="returnTo"
                                        value={returnTo}
                                      />
                                      <button
                                        type="submit"
                                        className={
                                          toStatus === 'CANCELLED'
                                            ? styles.dangerButton
                                            : styles.secondaryButton
                                        }
                                      >
                                        {copy.moveTo[toStatus]}
                                      </button>
                                    </form>
                                  ))}
                                </div>
                              ) : null}
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
                              {upcoming ? (
                                <details>
                                  <summary>{copy.reschedule}</summary>
                                  <form
                                    action={rescheduleConsultationAction}
                                    className={styles.form}
                                  >
                                    <input
                                      type="hidden"
                                      name="appointmentId"
                                      value={appointment.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="revision"
                                      value={appointment.revision}
                                    />
                                    <input
                                      type="hidden"
                                      name="returnTo"
                                      value={returnTo}
                                    />
                                    <div className={styles.grid}>
                                      {dateTimeFields({
                                        date: local.slice(0, 10),
                                        time: local.slice(11, 16),
                                        duration:
                                          consultationDurationMinutes(
                                            appointment,
                                          ),
                                      })}
                                    </div>
                                    <button
                                      type="submit"
                                      className={styles.button}
                                    >
                                      {copy.saveTime}
                                    </button>
                                  </form>
                                </details>
                              ) : null}
                              <details>
                                <summary>{copy.editNote}</summary>
                                <form
                                  action={updateConsultationNoteAction}
                                  className={styles.form}
                                >
                                  <input
                                    type="hidden"
                                    name="appointmentId"
                                    value={appointment.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="revision"
                                    value={appointment.revision}
                                  />
                                  <input
                                    type="hidden"
                                    name="returnTo"
                                    value={returnTo}
                                  />
                                  <label className={styles.field}>
                                    <span>{copy.noteLabel}</span>
                                    <textarea
                                      name="operationalNote"
                                      rows={2}
                                      maxLength={500}
                                      defaultValue={
                                        appointment.operationalNote ?? ''
                                      }
                                    />
                                  </label>
                                  <button
                                    type="submit"
                                    className={styles.button}
                                  >
                                    {copy.saveNote}
                                  </button>
                                </form>
                              </details>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))
            )}
          </section>

          <section className="admin-panel" id="book">
            <div className="panel-heading">
              <div>
                <h2>{copy.createTitle}</h2>
                <p className={styles.note}>{copy.createIntro}</p>
                <p className={styles.note}>{copy.boundary}</p>
              </div>
              <Link href={localizeHref(locale, '/clients')}>
                {copy.manageClients}
              </Link>
            </div>
            {clients.length === 0 ? (
              <p className={styles.empty}>{copy.noClients}</p>
            ) : null}
            {actor.scope === 'all' && consultants.length === 0 ? (
              <p className={styles.empty}>{copy.noConsultants}</p>
            ) : null}
            {canBook ? (
              <form action={createConsultationAction} className={styles.form}>
                <input type="hidden" name="returnTo" value={returnTo} />
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>{copy.clientLabel}</span>
                    <select
                      name="clientId"
                      defaultValue={preselectedClient}
                      required
                    >
                      <option value="" disabled>
                        —
                      </option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.displayName}
                          {client.phone ? ` · ${client.phone}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  {actor.scope === 'all' ? (
                    <label className={styles.field}>
                      <span>{copy.consultantLabel}</span>
                      <select name="consultantUserId" required>
                        {consultants.map((consultant) => (
                          <option key={consultant.id} value={consultant.id}>
                            {personName(consultant)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {dateTimeFields({
                    date: requestedDate,
                    time: '10:00',
                    duration: 60,
                  })}
                  <label className={styles.field}>
                    <span>{copy.modeLabel}</span>
                    <select name="mode" defaultValue="ONSITE">
                      {consultationModes.map((mode) => (
                        <option key={mode} value={mode}>
                          {copy.mode[mode]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>{copy.initialStatusLabel}</span>
                    <select name="initialStatus" defaultValue="CONFIRMED">
                      <option value="CONFIRMED">{copy.status.CONFIRMED}</option>
                      <option value="REQUESTED">{copy.status.REQUESTED}</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>{copy.priceLabel}</span>
                    <input
                      type="number"
                      name="priceDinars"
                      min={0}
                      max={1000000}
                      step={1}
                      inputMode="numeric"
                      defaultValue={
                        lastPrice ? minorToDinars(lastPrice.priceMinor) : ''
                      }
                      required
                    />
                  </label>
                  <label className={`${styles.field} ${styles.wide}`}>
                    <span>{copy.noteLabel}</span>
                    <textarea
                      name="operationalNote"
                      rows={2}
                      maxLength={500}
                      placeholder={copy.noteHelp}
                    />
                  </label>
                </div>
                <div>
                  <button type="submit" className={styles.button}>
                    {copy.book}
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
