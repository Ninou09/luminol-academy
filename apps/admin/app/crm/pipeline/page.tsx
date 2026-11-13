import { requirePermission } from '@luminol/auth';
import { db, type Prisma } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import {
  utcToZonedLocal,
  zonedDayRange,
} from '@luminol/validation/consultations';
import { enquirySchoolSchema } from '@luminol/validation';
import { scoreCrmLead } from '@luminol/validation/crm-sections';
import Link from 'next/link';

import { CrmShell } from '../../../components/crm-shell';
import styles from '../../../components/operations.module.css';
import { getAdminEnumLabel } from '../../../lib/admin-localization';
import { getCrmPipelineCopy } from '../../../lib/crm-insights-localization';
import { leadSourceKey } from '../../../lib/crm-metrics';
import { getCrmSectionsCopy } from '../../../lib/crm-sections-localization';
import { personLabel } from '../../../lib/crm-timeline';
import { getEnquiryTransitions } from '../../../lib/operations';
import { getAdminRequestLocale } from '../../../lib/request-locale';
import { PipelineBoard, type PipelineCard } from './pipeline-board';

type PipelinePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const STAGES = ['NEW', 'IN_REVIEW', 'CONTACTED', 'CLOSED'] as const;
const LIMIT = 300;

function single(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined;
}

export default async function PipelinePage({
  searchParams,
}: PipelinePageProps) {
  const user = await requirePermission('enquiry:work');
  const locale = await getAdminRequestLocale();
  const copy = getCrmPipelineCopy(locale);
  const sectionsCopy = getCrmSectionsCopy(locale);
  const params = searchParams ? await searchParams : {};
  const owner = single(params.owner);
  const ownerFilter = owner === 'mine' || owner === 'none' ? owner : 'all';
  const schoolParsed = enquirySchoolSchema.safeParse(single(params.school));
  const school = schoolParsed.success ? schoolParsed.data : null;
  const source = (single(params.source) ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 40);
  const query = (single(params.q) ?? '').trim().slice(0, 80);
  const overdueOnly = single(params.overdue) === '1';
  const showSpam = single(params.spam) === '1';
  const todayIso = utcToZonedLocal(new Date()).slice(0, 10);
  const todayStart = zonedDayRange(todayIso).start;
  const stages = showSpam ? [...STAGES, 'SPAM' as const] : [...STAGES];

  const where: Prisma.EnquiryWhereInput = {
    status: { in: stages },
    ...(ownerFilter === 'mine'
      ? { ownerUserId: user.id }
      : ownerFilter === 'none'
        ? { ownerUserId: null }
        : {}),
    ...(school ? { school } : {}),
    ...(overdueOnly
      ? {
          nextFollowUpAt: { lt: todayStart },
          status: { in: ['NEW', 'IN_REVIEW', 'CONTACTED'] },
        }
      : {}),
    ...(query.length >= 2
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query } },
          ],
        }
      : {}),
  };

  const leads = await db.enquiry.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: LIMIT,
    select: {
      id: true,
      name: true,
      status: true,
      school: true,
      programmeTitleSnapshot: true,
      consent: true,
      nextFollowUpAt: true,
      nextAction: true,
      source: true,
      utmSource: true,
      createdAt: true,
      phone: true,
      timingPreference: true,
      programmeSlug: true,
      activities: {
        orderBy: { occurredAt: 'desc' },
        take: 1,
        select: { occurredAt: true },
      },
      owner: { select: { email: true, firstName: true, lastName: true } },
    },
  });
  const filtered = source
    ? leads.filter((lead) => leadSourceKey(lead) === source)
    : leads;
  const sources = [...new Set(leads.map(leadSourceKey))].sort();

  const label = (value: string) => getAdminEnumLabel(locale, value);
  const date = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  const now = new Date();
  const cards: PipelineCard[] = filtered.map((lead) => {
    const { band } = scoreCrmLead({
      consent: lead.consent,
      phone: lead.phone,
      timingPreference: lead.timingPreference,
      hasProgramme: Boolean(lead.programmeSlug),
      contacted: lead.status !== 'NEW',
      createdAt: lead.createdAt,
      lastActivityAt: lead.activities[0]?.occurredAt ?? null,
      now,
    });
    return {
      id: lead.id,
      name: lead.name,
      href: localizeHref(locale, `/crm/leads/${lead.id}`),
      status: lead.status,
      school: label(lead.school),
      programme: lead.programmeTitleSnapshot,
      owner: personLabel(lead.owner),
      followUp: lead.nextFollowUpAt
        ? [date(lead.nextFollowUpAt), lead.nextAction]
            .filter(Boolean)
            .join(' · ')
        : null,
      overdue:
        lead.status !== 'CLOSED' &&
        lead.status !== 'SPAM' &&
        Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt < todayStart),
      consent: lead.consent,
      source: leadSourceKey(lead),
      received: date(lead.createdAt),
      priority: { band, label: sectionsCopy.scoreBand[band] },
    };
  });
  const transitions = Object.fromEntries(
    stages.map((stage) => [
      stage,
      getEnquiryTransitions(stage).filter((target) =>
        (stages as readonly string[]).includes(target),
      ),
    ]),
  );
  const labels = Object.fromEntries(
    stages.map((stage) => [stage, label(stage)]),
  );
  const boardKey = cards.map(({ id, status }) => `${id}:${status}`).join('|');

  return (
    <CrmShell locale={locale} user={user} current="pipeline" query={query}>
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
        <div className={styles.actions}>
          <Link href={localizeHref(locale, '/crm/leads/new')}>
            {sectionsCopy.quickAdd}
          </Link>
        </div>
      </section>

      <section className="admin-panel" aria-label={copy.filters}>
        <form method="get" className={styles.inline}>
          <label className={styles.field}>
            <span>{copy.owner}</span>
            <select name="owner" defaultValue={ownerFilter}>
              <option value="all">{copy.ownerAll}</option>
              <option value="mine">{copy.ownerMine}</option>
              <option value="none">{copy.ownerNone}</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>{copy.school}</span>
            <select name="school" defaultValue={school ?? ''}>
              <option value="">{copy.any}</option>
              {enquirySchoolSchema.options.map((value) => (
                <option key={value} value={value}>
                  {label(value)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{copy.source}</span>
            <select name="source" defaultValue={source}>
              <option value="">{copy.any}</option>
              {sources.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{copy.search}</span>
            <input type="search" name="q" maxLength={80} defaultValue={query} />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="overdue"
              value="1"
              defaultChecked={overdueOnly}
            />
            <span>{copy.overdueOnly}</span>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="spam"
              value="1"
              defaultChecked={showSpam}
            />
            <span>{copy.showSpam}</span>
          </label>
          <button type="submit" className={styles.button}>
            {copy.apply}
          </button>
          <Link href={localizeHref(locale, '/crm/pipeline')}>{copy.reset}</Link>
        </form>
        {leads.length === LIMIT ? (
          <p className={styles.note}>
            {copy.limited(formatLocalizedNumber(LIMIT, locale))}
          </p>
        ) : null}
      </section>

      <PipelineBoard
        key={boardKey}
        columns={stages.map((status) => ({ status, label: label(status) }))}
        cards={cards}
        transitions={transitions}
        copy={copy.board}
        labels={labels}
      />
    </CrmShell>
  );
}
