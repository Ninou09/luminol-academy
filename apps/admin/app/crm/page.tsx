import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedCurrency,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import {
  utcToZonedLocal,
  zonedDayRange,
} from '@luminol/validation/consultations';
import Link from 'next/link';

import { CrmShell } from '../../components/crm-shell';
import styles from '../../components/operations.module.css';
import { getAdminEnumLabel } from '../../lib/admin-localization';
import { getCrmDashboardCopy } from '../../lib/crm-insights-localization';
import {
  crmDashboardPeriods,
  groupConversion,
  leadSourceKey,
  median,
  parseCrmDashboardPeriod,
  percent,
  type GroupedCount,
} from '../../lib/crm-metrics';
import { personLabel } from '../../lib/crm-timeline';
import { getAdminRequestLocale } from '../../lib/request-locale';

type CrmDashboardPageProps = {
  searchParams?: Promise<{ days?: string | string[] | undefined }>;
};

const ACTIVE = ['NEW', 'IN_REVIEW', 'CONTACTED'] as const;
const PIPELINE = ['NEW', 'IN_REVIEW', 'CONTACTED', 'CLOSED'] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

export default async function CrmDashboardPage({
  searchParams,
}: CrmDashboardPageProps) {
  const user = await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getCrmDashboardCopy(locale);
  const params = searchParams ? await searchParams : undefined;
  const days = parseCrmDashboardPeriod(params?.days);
  const now = new Date();
  const since = new Date(now.getTime() - days * DAY_MS);
  const todayStart = zonedDayRange(utcToZonedLocal(now).slice(0, 10)).start;

  const [leads, pipeline, overdue, payments, appointments, activities, owned] =
    await Promise.all([
      db.enquiry.findMany({
        where: { createdAt: { gte: since }, status: { not: 'SPAM' } },
        take: 5000,
        select: {
          id: true,
          status: true,
          school: true,
          source: true,
          utmSource: true,
          createdAt: true,
          client: { select: { id: true } },
          statusEvents: {
            where: { fromStatus: 'NEW' },
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
      db.enquiry.groupBy({
        by: ['status'],
        where: { status: { in: [...PIPELINE] } },
        _count: { _all: true },
      }),
      db.enquiry.count({
        where: {
          consent: true,
          status: { in: [...ACTIVE] },
          nextFollowUpAt: { lt: todayStart },
        },
      }),
      db.officePayment.aggregate({
        where: { status: 'RECORDED', receivedAt: { gte: since } },
        _sum: { amountMinor: true },
      }),
      db.consultationAppointment.groupBy({
        by: ['status'],
        where: {
          startsAt: { gte: since, lte: now },
          status: { in: ['COMPLETED', 'NO_SHOW'] },
        },
        _count: { _all: true },
      }),
      db.crmActivity.groupBy({
        by: ['actorUserId'],
        where: { occurredAt: { gte: since } },
        _count: { _all: true },
      }),
      db.enquiry.groupBy({
        by: ['ownerUserId'],
        where: { status: { in: [...ACTIVE] }, ownerUserId: { not: null } },
        _count: { _all: true },
      }),
    ]);

  const teamIds = [
    ...new Set([
      ...activities.map(({ actorUserId }) => actorUserId),
      ...owned
        .map(({ ownerUserId }) => ownerUserId)
        .filter((value): value is string => Boolean(value)),
    ]),
  ];
  const team = teamIds.length
    ? await db.user.findMany({
        where: { id: { in: teamIds } },
        select: { id: true, email: true, firstName: true, lastName: true },
      })
    : [];

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const pct = (value: number | null) =>
    value === null ? copy.notAvailable : `${number(value)}%`;
  const label = (value: string) => getAdminEnumLabel(locale, value);

  const contacted = leads.filter(
    ({ status }) => status === 'CONTACTED' || status === 'CLOSED',
  ).length;
  const converted = leads.filter(({ client }) => Boolean(client)).length;
  const responseHours = leads
    .map(({ createdAt, statusEvents }) =>
      statusEvents[0]
        ? (statusEvents[0].createdAt.getTime() - createdAt.getTime()) /
          3_600_000
        : null,
    )
    .filter((value): value is number => value !== null && value >= 0);
  const medianHours = median(responseHours);
  const within24 = percent(
    responseHours.filter((hours) => hours <= 24).length,
    leads.length,
  );
  const completed =
    appointments.find(({ status }) => status === 'COMPLETED')?._count._all ?? 0;
  const noShows =
    appointments.find(({ status }) => status === 'NO_SHOW')?._count._all ?? 0;
  const bySource = groupConversion(leads, leadSourceKey, ({ client }) =>
    Boolean(client),
  ).slice(0, 10);
  const bySchool = groupConversion(
    leads,
    ({ school }) => school,
    ({ client }) => Boolean(client),
  );
  const pipelineCounts = PIPELINE.map((status) => ({
    status,
    count: pipeline.find((row) => row.status === status)?._count._all ?? 0,
  }));
  const pipelineMax = Math.max(1, ...pipelineCounts.map(({ count }) => count));
  const teamRows = team
    .map((member) => ({
      id: member.id,
      name: personLabel(member) ?? member.email,
      activities:
        activities.find(({ actorUserId }) => actorUserId === member.id)?._count
          ._all ?? 0,
      open:
        owned.find(({ ownerUserId }) => ownerUserId === member.id)?._count
          ._all ?? 0,
    }))
    .sort((left, right) => right.activities - left.activities);

  const conversionTable = (
    title: string,
    rows: GroupedCount[],
    format: (key: string) => string,
  ) => {
    const max = Math.max(1, ...rows.map(({ total }) => total));
    return (
      <section className="admin-panel">
        <div className="panel-heading">
          <h2>{title}</h2>
        </div>
        {rows.length === 0 ? (
          <p className={styles.empty}>{copy.noData}</p>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th scope="col">{title}</th>
                <th scope="col">{copy.leads}</th>
                <th scope="col">{copy.converted}</th>
                <th scope="col">{copy.rate}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">
                    <bdi>{format(row.key)}</bdi>
                  </th>
                  <td>
                    <span className="crm-bar" aria-hidden="true">
                      <i style={{ width: `${(row.total / max) * 100}%` }} />
                    </span>
                    {number(row.total)}
                  </td>
                  <td>{number(row.converted)}</td>
                  <td>{pct(row.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    );
  };

  return (
    <CrmShell locale={locale} user={user} current="dashboard">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
        <nav className={styles.actions} aria-label={copy.period(String(days))}>
          {crmDashboardPeriods.map((period) => (
            <Link
              key={period}
              href={localizeHref(locale, `/crm?days=${period}`)}
              aria-current={period === days ? 'page' : undefined}
              className={
                period === days ? styles.button : styles.secondaryButton
              }
            >
              {copy.period(number(period))}
            </Link>
          ))}
        </nav>
      </section>

      <section className="metric-grid" aria-label={copy.period(String(days))}>
        <article>
          <span>{copy.newLeads}</span>
          <strong>{number(leads.length)}</strong>
        </article>
        <article>
          <span>{copy.contactedRate}</span>
          <strong>{pct(percent(contacted, leads.length))}</strong>
        </article>
        <article>
          <span>{copy.convertedRate}</span>
          <strong>{pct(percent(converted, leads.length))}</strong>
        </article>
        <article>
          <span>{copy.medianResponse}</span>
          <strong>
            {medianHours === null
              ? copy.notAvailable
              : copy.hours(
                  formatLocalizedNumber(medianHours, locale, {
                    maximumFractionDigits: 1,
                  }),
                )}
          </strong>
        </article>
        <article>
          <span>{copy.within24h}</span>
          <strong>{pct(within24)}</strong>
        </article>
        <article>
          <span>{copy.overdueFollowUps}</span>
          <strong>{number(overdue)}</strong>
        </article>
        <article>
          <span>{copy.revenue}</span>
          <strong>
            {formatLocalizedCurrency(
              payments._sum.amountMinor ?? 0,
              'DZD',
              locale,
            )}
          </strong>
        </article>
        <article>
          <span>{copy.consultationsCompleted}</span>
          <strong>{number(completed)}</strong>
        </article>
        <article>
          <span>{copy.noShowRate}</span>
          <strong>{pct(percent(noShows, completed + noShows))}</strong>
        </article>
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>{copy.pipelineNow}</h2>
          <Link href={localizeHref(locale, '/crm/pipeline')}>
            {copy.openPipeline}
          </Link>
        </div>
        <ul className="crm-funnel">
          {pipelineCounts.map(({ status, count }) => (
            <li key={status}>
              <span>{label(status)}</span>
              <span className="crm-bar" aria-hidden="true">
                <i style={{ width: `${(count / pipelineMax) * 100}%` }} />
              </span>
              <strong>{number(count)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <div className="crm-profile">
        {conversionTable(copy.bySource, bySource, (key) => key)}
        {conversionTable(copy.bySchool, bySchool, label)}
      </div>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>{copy.team}</h2>
        </div>
        {teamRows.length === 0 ? (
          <p className={styles.empty}>{copy.noData}</p>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th scope="col">{copy.teamMember}</th>
                <th scope="col">{copy.activities}</th>
                <th scope="col">{copy.openLeads}</th>
              </tr>
            </thead>
            <tbody>
              {teamRows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">
                    <bdi>{row.name}</bdi>
                  </th>
                  <td>{number(row.activities)}</td>
                  <td>{number(row.open)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className={styles.note}>{copy.definitions}</p>
    </CrmShell>
  );
}
