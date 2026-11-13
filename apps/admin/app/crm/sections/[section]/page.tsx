import { db } from '@luminol/database';
import { crmDealWhere } from '@luminol/database/crm-deals';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import {
  crmOfferFillRate,
  crmOfferTransitions,
  crmSectionFromSlug,
  crmSectionOfferKinds,
  crmSections,
  crmSectionSlugs,
  getCrmSectionStages,
  getCrmStageTransitions,
  type CrmOfferStatusValue,
} from '@luminol/validation/crm-sections';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CrmShell } from '../../../../components/crm-shell';
import styles from '../../../../components/operations.module.css';
import { requireCrmActor } from '../../../../lib/crm-actor.server';
import { getCrmCopy, parseCrmFeedback } from '../../../../lib/crm-localization';
import { percent } from '../../../../lib/crm-metrics';
import { getCrmSectionsCopy } from '../../../../lib/crm-sections-localization';
import { personLabel } from '../../../../lib/crm-timeline';
import { getAdminRequestLocale } from '../../../../lib/request-locale';
import { changeCrmOfferStatusAction, createCrmOfferAction } from '../actions';
import { DealBoard, type DealCard } from './deal-board';

type SectionPageProps = {
  params: Promise<{ section: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const LIMIT = 300;
const DAY_MS = 24 * 60 * 60 * 1000;
const person = {
  select: { email: true, firstName: true, lastName: true },
} as const;

export default async function SectionPage({
  params,
  searchParams,
}: SectionPageProps) {
  const { user, actor, can } = await requireCrmActor();
  const scope = crmDealWhere(actor);
  if (!scope) notFound();
  const section = crmSectionFromSlug((await params).section);
  if (!section) notFound();

  const locale = await getAdminRequestLocale();
  const copy = getCrmSectionsCopy(locale);
  const crmCopy = getCrmCopy(locale);
  const query = searchParams ? await searchParams : {};
  const feedback = parseCrmFeedback(query.error);
  const saved = query.saved === '1';
  const canManageOffers = can('offer:manage');
  const returnTo = localizeHref(
    locale,
    `/crm/sections/${crmSectionSlugs[section]}`,
  );
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY_MS);
  const since90 = new Date(now.getTime() - 90 * DAY_MS);
  const inSection = { AND: [{ section }, scope] };

  const [deals, openValue, won30, closed90, offers, trainers, byOffer] =
    await Promise.all([
      db.crmDeal.findMany({
        where: {
          AND: [
            inSection,
            { OR: [{ state: 'OPEN' }, { closedAt: { gte: since30 } }] },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: LIMIT,
        include: {
          enquiry: { select: { name: true, consent: true } },
          client: { select: { displayName: true, contactConsent: true } },
          offer: { select: { title: true } },
          owner: person,
        },
      }),
      db.crmDeal.aggregate({
        where: { AND: [inSection, { state: 'OPEN' }] },
        _count: { _all: true },
        _sum: { valueMinor: true },
      }),
      db.crmDeal.count({
        where: {
          AND: [inSection, { state: 'WON', closedAt: { gte: since30 } }],
        },
      }),
      db.crmDeal.groupBy({
        by: ['state'],
        where: {
          AND: [
            inSection,
            { state: { in: ['WON', 'LOST'] }, closedAt: { gte: since90 } },
          ],
        },
        _count: { _all: true },
      }),
      db.crmOffer.findMany({
        where: { section, status: { not: 'CANCELLED' } },
        orderBy: [
          { status: 'asc' },
          { startsOn: 'asc' },
          { createdAt: 'desc' },
        ],
        take: 100,
        include: {
          trainer: person,
          _count: {
            select: { deals: { where: { state: { in: ['OPEN', 'WON'] } } } },
          },
        },
      }),
      canManageOffers
        ? db.user.findMany({
            where: { deletedAt: null, roles: { some: {} } },
            orderBy: [{ firstName: 'asc' }, { email: 'asc' }],
            take: 200,
            select: { id: true, email: true, firstName: true, lastName: true },
          })
        : Promise.resolve([]),
      db.crmDeal.groupBy({
        by: ['offerId', 'state'],
        where: { AND: [inSection, { createdAt: { gte: since90 } }] },
        _count: { _all: true },
        _sum: { valueMinor: true },
      }),
    ]);
  const offerIds = [
    ...new Set(
      byOffer
        .map(({ offerId }) => offerId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const offerTitles = new Map(
    (offerIds.length
      ? await db.crmOffer.findMany({
          where: { id: { in: offerIds } },
          select: { id: true, title: true },
        })
      : []
    ).map(({ id, title }) => [id, title]),
  );
  const offerRows = [
    ...byOffer
      .reduce((groups, row) => {
        const key = row.offerId ?? '';
        const group = groups.get(key) ?? {
          total: 0,
          won: 0,
          lost: 0,
          wonMinor: 0,
        };
        group.total += row._count._all;
        if (row.state === 'WON') {
          group.won += row._count._all;
          group.wonMinor += row._sum.valueMinor ?? 0;
        }
        if (row.state === 'LOST') group.lost += row._count._all;
        groups.set(key, group);
        return groups;
      }, new Map<string, { total: number; won: number; lost: number; wonMinor: number }>())
      .entries(),
  ]
    .map(([offerId, group]) => ({
      offerId,
      title: offerId ? (offerTitles.get(offerId) ?? offerId) : null,
      ...group,
      conversion: percent(group.won, group.won + group.lost),
    }))
    .sort((left, right) => right.total - left.total);

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const money = (minor: number | null) =>
    minor === null ? null : formatLocalizedCurrency(minor, 'DZD', locale);
  const day = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  const wonCount =
    closed90.find(({ state }) => state === 'WON')?._count._all ?? 0;
  const lostCount =
    closed90.find(({ state }) => state === 'LOST')?._count._all ?? 0;
  const winRate = percent(wonCount, wonCount + lostCount);

  const stages = getCrmSectionStages(section);
  const cards: DealCard[] = deals.map((deal) => ({
    id: deal.id,
    name: deal.enquiry?.name ?? deal.client?.displayName ?? deal.id,
    href: localizeHref(
      locale,
      deal.enquiryId
        ? `/crm/leads/${deal.enquiryId}`
        : `/crm/contacts/${deal.clientId}`,
    ),
    stage: deal.stage,
    revision: deal.revision,
    subject: deal.enquiryId ? 'lead' : 'contact',
    offer: deal.offer?.title ?? null,
    value: money(deal.valueMinor),
    owner: personLabel(deal.owner),
    expectedClose: deal.expectedCloseOn ? day(deal.expectedCloseOn) : null,
    consent: deal.enquiry?.consent ?? deal.client?.contactConsent ?? false,
  }));
  const transitions = Object.fromEntries(
    stages.map(({ key }) => [key, getCrmStageTransitions(section, key)]),
  );
  const boardKey = cards
    .map(({ id, stage, revision }) => `${id}:${stage}:${revision}`)
    .join('|');

  return (
    <CrmShell
      locale={locale}
      user={user}
      current="sections"
      currentSection={section}
    >
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title(copy.section[section])}</h1>
          <p>{copy.intro}</p>
        </div>
        {actor.canWorkEnquiries ? (
          <div className={styles.actions}>
            <Link href={localizeHref(locale, '/crm/leads/new')}>
              {copy.quickAdd}
            </Link>
          </div>
        ) : null}
      </section>

      <nav className="crm-section-tabs" aria-label={copy.sectionsNav}>
        {crmSections.map((value) => (
          <Link
            key={value}
            href={localizeHref(
              locale,
              `/crm/sections/${crmSectionSlugs[value]}`,
            )}
            aria-current={value === section ? 'page' : undefined}
          >
            {copy.section[value]}
          </Link>
        ))}
      </nav>

      {feedback ? (
        <p className={styles.warning} role="alert">
          {crmCopy.feedback[feedback]}
        </p>
      ) : saved ? (
        <p className={styles.success} role="status">
          {crmCopy.saved}
        </p>
      ) : null}

      <section className="metric-grid" aria-label={copy.section[section]}>
        <article>
          <span>{copy.kpiOpen}</span>
          <strong>{number(openValue._count._all)}</strong>
        </article>
        <article>
          <span>{copy.kpiOpenValue}</span>
          <strong>
            {money(openValue._sum.valueMinor ?? 0) ?? copy.notSet}
          </strong>
        </article>
        <article>
          <span>{copy.kpiWon}</span>
          <strong>{number(won30)}</strong>
        </article>
        <article>
          <span>{copy.kpiWinRate}</span>
          <strong>
            {winRate === null ? copy.notSet : `${number(winRate)}%`}
          </strong>
        </article>
      </section>
      <p className={styles.note}>{copy.kpiDefinitions}</p>
      {deals.length === LIMIT ? (
        <p className={styles.note}>{copy.limited(number(LIMIT))}</p>
      ) : null}

      <DealBoard
        key={boardKey}
        columns={stages.map((stage) => ({
          stage: stage.key,
          label: copy.stage[stage.key] ?? stage.key,
          requiresReason:
            'requiresReason' in stage && stage.requiresReason === true,
        }))}
        cards={cards}
        transitions={transitions}
        copy={copy.board}
        feedback={crmCopy.feedback}
      />

      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <h2>{copy.byOffer}</h2>
            <p className={styles.note}>{copy.byOfferIntro}</p>
          </div>
        </div>
        {offerRows.length === 0 ? (
          <p className={styles.empty}>{copy.noOpportunities}</p>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th scope="col">{copy.opportunityOffer}</th>
                <th scope="col">{copy.colOpportunities}</th>
                <th scope="col">{copy.colWon}</th>
                <th scope="col">{copy.colConversion}</th>
                <th scope="col">{copy.colWonValue}</th>
              </tr>
            </thead>
            <tbody>
              {offerRows.map((row) => (
                <tr key={row.offerId || 'none'}>
                  <td>{row.title ? <bdi>{row.title}</bdi> : copy.noOffer}</td>
                  <td>{number(row.total)}</td>
                  <td>{number(row.won)}</td>
                  <td>
                    {row.conversion === null
                      ? copy.notSet
                      : `${number(row.conversion)}%`}
                  </td>
                  <td>{money(row.wonMinor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>{copy.offers}</h2>
        </div>
        {offers.length === 0 ? (
          <p className={styles.empty}>{copy.noOffers}</p>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th scope="col">{copy.offerTitle}</th>
                <th scope="col">{copy.offerDates}</th>
                <th scope="col">{copy.offerPrice}</th>
                <th scope="col">{copy.offerTrainer}</th>
                <th scope="col">{copy.offerFill}</th>
                <th scope="col">{copy.offerStatusLabel}</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const taken = offer._count.deals;
                const fill = crmOfferFillRate(taken, offer.capacity);
                const status = offer.status as CrmOfferStatusValue;
                return (
                  <tr key={offer.id}>
                    <td>
                      {section === 'EVENTS' ? (
                        <Link
                          href={localizeHref(locale, `/crm/events/${offer.id}`)}
                        >
                          <bdi>{offer.title}</bdi> · {copy.openRoster}
                        </Link>
                      ) : (
                        <bdi>{offer.title}</bdi>
                      )}
                      <br />
                      <span className={styles.meta}>
                        {copy.offerKind[offer.kind]}
                      </span>
                    </td>
                    <td>
                      {[offer.startsOn, offer.endsOn]
                        .filter((value): value is Date => Boolean(value))
                        .map(day)
                        .join(' – ') || copy.notSet}
                    </td>
                    <td>{money(offer.priceMinor) ?? copy.notSet}</td>
                    <td>
                      {offer.trainer ? (
                        <bdi>{personLabel(offer.trainer)}</bdi>
                      ) : (
                        copy.noTrainer
                      )}
                    </td>
                    <td>
                      {copy.offerDeals(number(taken))}
                      {offer.capacity ? (
                        <>
                          {' '}
                          / {number(offer.capacity)}
                          {fill !== null ? ` · ${number(fill)}%` : ''}
                        </>
                      ) : null}
                    </td>
                    <td>
                      <span className={styles.chip}>
                        {copy.offerStatus[status]}
                      </span>
                      {canManageOffers
                        ? crmOfferTransitions[status].map((toStatus) => (
                            <form
                              key={toStatus}
                              action={changeCrmOfferStatusAction}
                            >
                              <input
                                type="hidden"
                                name="offerId"
                                value={offer.id}
                              />
                              <input
                                type="hidden"
                                name="fromStatus"
                                value={status}
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
                                className={styles.secondaryButton}
                              >
                                {copy.offerSetStatus(
                                  copy.offerStatus[toStatus],
                                )}
                              </button>
                            </form>
                          ))
                        : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {canManageOffers ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>{copy.addOffer}</h2>
          </div>
          <p className={styles.note}>{copy.addOfferHint}</p>
          <form action={createCrmOfferAction} className={styles.form}>
            <input type="hidden" name="section" value={section} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className={styles.field}>
              <span>{copy.offerTitle}</span>
              <input
                type="text"
                name="title"
                minLength={2}
                maxLength={160}
                required
              />
            </label>
            <label className={styles.field}>
              <span>{copy.offerKindLabel}</span>
              <select name="kind" required>
                {crmSectionOfferKinds[section].map((kind) => (
                  <option key={kind} value={kind}>
                    {copy.offerKind[kind]}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>{copy.offerPrice}</span>
              <input
                type="number"
                name="priceDinars"
                min={0}
                max={20_000_000}
                step={1}
                inputMode="numeric"
              />
            </label>
            <label className={styles.field}>
              <span>{copy.offerStartsOn}</span>
              <input type="date" name="startsOn" />
            </label>
            <label className={styles.field}>
              <span>{copy.offerEndsOn}</span>
              <input type="date" name="endsOn" />
            </label>
            <label className={styles.field}>
              <span>{copy.offerCapacity}</span>
              <input
                type="number"
                name="capacity"
                min={1}
                max={10_000}
                step={1}
                inputMode="numeric"
              />
            </label>
            <label className={styles.field}>
              <span>{copy.offerTrainer}</span>
              <select name="trainerUserId" defaultValue="">
                <option value="">{copy.noTrainer}</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {personLabel(trainer)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className={styles.button}>
              {copy.saveOffer}
            </button>
          </form>
        </section>
      ) : null}
    </CrmShell>
  );
}
