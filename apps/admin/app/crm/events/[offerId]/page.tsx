import { db } from '@luminol/database';
import { crmDealWhere } from '@luminol/database/crm-deals';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import {
  crmBookableOfferStatuses,
  crmOfferFillRate,
  crmQuickLeadSources,
  crmSections,
  type CrmSectionValue,
} from '@luminol/validation/crm-sections';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CrmShell } from '../../../../components/crm-shell';
import styles from '../../../../components/operations.module.css';
import { requireCrmActor } from '../../../../lib/crm-actor.server';
import { getCrmCopy, parseCrmFeedback } from '../../../../lib/crm-localization';
import { getCrmSectionsCopy } from '../../../../lib/crm-sections-localization';
import { getAdminRequestLocale } from '../../../../lib/request-locale';
import {
  convertEventDealAction,
  moveCrmDealFormAction,
  registerEventAttendeeAction,
} from '../../sections/actions';

type RosterPageProps = {
  params: Promise<{ offerId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const paidSections = crmSections.filter((section) => section !== 'EVENTS');

/** Event or free-session roster: registration, check-in, follow-up, conversion. */
export default async function EventRosterPage({
  params,
  searchParams,
}: RosterPageProps) {
  const { user, actor } = await requireCrmActor();
  const scope = crmDealWhere(actor);
  if (!scope) notFound();
  const { offerId } = await params;
  if (offerId.length > 128) notFound();
  const locale = await getAdminRequestLocale();
  const copy = getCrmSectionsCopy(locale);
  const crmCopy = getCrmCopy(locale);
  const query = searchParams ? await searchParams : {};
  const feedback = parseCrmFeedback(query.error);
  const saved = query.saved === '1';
  const returnTo = localizeHref(locale, `/crm/events/${offerId}`);

  const offer = await db.crmOffer.findFirst({
    where: { id: offerId, section: 'EVENTS' },
    select: {
      id: true,
      title: true,
      kind: true,
      status: true,
      startsOn: true,
      capacity: true,
    },
  });
  if (!offer) notFound();

  const [deals, paidOffers] = await Promise.all([
    db.crmDeal.findMany({
      where: { AND: [{ offerId: offer.id }, scope] },
      orderBy: { createdAt: 'asc' },
      take: 500,
      include: {
        enquiry: {
          select: { id: true, name: true, phone: true, consent: true },
        },
        client: {
          select: {
            id: true,
            displayName: true,
            phone: true,
            contactConsent: true,
          },
        },
      },
    }),
    db.crmOffer.findMany({
      where: {
        section: { in: [...paidSections] },
        status: { in: [...crmBookableOfferStatuses] },
      },
      orderBy: [{ section: 'asc' }, { startsOn: 'asc' }],
      take: 200,
      select: { id: true, section: true, title: true },
    }),
  ]);

  const rows = deals.map((deal) => ({
    id: deal.id,
    stage: deal.stage,
    state: deal.state,
    revision: deal.revision,
    name: deal.enquiry?.name ?? deal.client?.displayName ?? deal.id,
    phone: deal.enquiry?.phone ?? deal.client?.phone ?? null,
    consent: deal.enquiry?.consent ?? deal.client?.contactConsent ?? false,
    href: localizeHref(
      locale,
      deal.enquiryId
        ? `/crm/leads/${deal.enquiryId}`
        : `/crm/contacts/${deal.clientId}`,
    ),
  }));
  const registered = rows.filter(
    ({ stage }) => stage === 'REGISTERED' || stage === 'CONFIRMED',
  );
  const attended = rows.filter(
    ({ stage }) => stage === 'ATTENDED' || stage === 'FOLLOWED_UP',
  );
  const closed = rows.filter(({ state }) => state !== 'OPEN');
  const taken = rows.filter(({ state }) => state !== 'LOST').length;
  const fill = crmOfferFillRate(taken, offer.capacity);
  const full = offer.capacity !== null && taken >= offer.capacity;
  const canRegister =
    actor.canWorkEnquiries &&
    crmBookableOfferStatuses.includes(offer.status) &&
    !full;
  const number = (value: number) => formatLocalizedNumber(value, locale);

  const moveButton = (
    row: (typeof rows)[number],
    toStage: string,
    label: string,
  ) => (
    <form action={moveCrmDealFormAction} key={toStage}>
      <input type="hidden" name="dealId" value={row.id} />
      <input type="hidden" name="toStage" value={toStage} />
      <input type="hidden" name="revision" value={row.revision} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button type="submit" className={styles.secondaryButton}>
        {label}
      </button>
    </form>
  );

  const person = (row: (typeof rows)[number]) => (
    <span>
      <Link href={row.href}>
        <strong>
          <bdi>{row.name}</bdi>
        </strong>
      </Link>
      {row.phone && row.consent ? (
        <>
          {' '}
          · <bdi dir="ltr">{row.phone}</bdi>
        </>
      ) : null}
      {!row.consent ? (
        <>
          {' '}
          · <span className={styles.warning}>{copy.doNotContact}</span>
        </>
      ) : null}
    </span>
  );

  return (
    <CrmShell
      locale={locale}
      user={user}
      current="sections"
      currentSection="EVENTS"
    >
      <section className="admin-intro">
        <div>
          <p className="eyebrow">
            {copy.section.EVENTS} · {copy.offerKind[offer.kind]}
          </p>
          <h1>
            <bdi>{offer.title}</bdi>
          </h1>
          <p className={styles.meta}>
            {offer.startsOn ? (
              <span>
                {formatLocalizedDate(offer.startsOn, locale, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  timeZone: 'UTC',
                })}
              </span>
            ) : null}
            <span className={styles.chip}>
              {copy.offerStatus[offer.status]}
            </span>
            <span>
              {copy.offerDeals(number(taken))}
              {offer.capacity
                ? ` / ${number(offer.capacity)}${fill !== null ? ` · ${number(fill)}%` : ''}`
                : ''}
            </span>
          </p>
          <p>{copy.rosterIntro}</p>
        </div>
        <div className={styles.actions}>
          <Link href={localizeHref(locale, '/crm/sections/events')}>
            {copy.section.EVENTS}
          </Link>
        </div>
      </section>

      {feedback ? (
        <p className={styles.warning} role="alert">
          {crmCopy.feedback[feedback]}
        </p>
      ) : saved ? (
        <p className={styles.success} role="status">
          {crmCopy.saved}
        </p>
      ) : null}

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>
            {copy.rosterRegistered} · {number(registered.length)}
          </h2>
        </div>
        {registered.length === 0 ? (
          <p className={styles.empty}>{copy.rosterEmpty}</p>
        ) : (
          <ul className={styles.list}>
            {registered.map((row) => (
              <li className={styles.row} key={row.id}>
                {person(row)}
                <span className={styles.actions}>
                  <span className={styles.chip}>
                    {copy.stage[row.stage] ?? row.stage}
                  </span>
                  {row.stage === 'REGISTERED'
                    ? moveButton(row, 'CONFIRMED', copy.markConfirmed)
                    : null}
                  {moveButton(row, 'ATTENDED', copy.markAttended)}
                  {moveButton(row, 'NO_SHOW', copy.markNoShow)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>
            {copy.rosterFollowUp} · {number(attended.length)}
          </h2>
        </div>
        {attended.length === 0 ? (
          <p className={styles.empty}>{copy.rosterEmpty}</p>
        ) : (
          <ul className={styles.list}>
            {attended.map((row) => (
              <li className={styles.row} key={row.id}>
                {person(row)}
                <span className={styles.actions}>
                  <span className={styles.chip}>
                    {copy.stage[row.stage] ?? row.stage}
                  </span>
                  {row.stage === 'ATTENDED' && row.consent
                    ? moveButton(row, 'FOLLOWED_UP', copy.markFollowedUp)
                    : null}
                  <form
                    action={convertEventDealAction}
                    className={styles.inline}
                  >
                    <input type="hidden" name="dealId" value={row.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <label>
                      <span className="sr-only">
                        {copy.convertTo}: {row.name}
                      </span>
                      <select name="section" defaultValue={paidSections[0]}>
                        {paidSections.map((section) => (
                          <option key={section} value={section}>
                            {copy.convertTo} {copy.section[section]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">{copy.opportunityOffer}</span>
                      <select name="offerId" defaultValue="">
                        <option value="">{copy.noOffer}</option>
                        {paidSections.map((section) => {
                          const options = paidOffers.filter(
                            (paid) =>
                              (paid.section as CrmSectionValue) === section,
                          );
                          return options.length > 0 ? (
                            <optgroup
                              key={section}
                              label={copy.section[section]}
                            >
                              {options.map((paid) => (
                                <option key={paid.id} value={paid.id}>
                                  {paid.title}
                                </option>
                              ))}
                            </optgroup>
                          ) : null;
                        })}
                      </select>
                    </label>
                    <button type="submit" className={styles.secondaryButton}>
                      {copy.convert}
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {closed.length > 0 ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>
              {copy.rosterClosed} · {number(closed.length)}
            </h2>
          </div>
          <ul className={styles.list}>
            {closed.map((row) => (
              <li className={styles.row} key={row.id}>
                {person(row)}
                <span
                  className={
                    row.state === 'WON' ? styles.success : styles.warning
                  }
                >
                  {copy.stage[row.stage] ?? row.stage}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {actor.canWorkEnquiries ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>{copy.registerTitle}</h2>
          </div>
          {!canRegister ? (
            <p className={styles.empty}>
              {full ? copy.eventFull : crmCopy.feedback['offer-unavailable']}
            </p>
          ) : (
            <form action={registerEventAttendeeAction} className={styles.form}>
              <input type="hidden" name="offerId" value={offer.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="school" value="GENERAL" />
              <label className={styles.field}>
                <span>{copy.quickName}</span>
                <input
                  type="text"
                  name="name"
                  minLength={2}
                  maxLength={100}
                  required
                  autoComplete="off"
                  dir="auto"
                />
              </label>
              <label className={styles.field}>
                <span>{copy.quickPhone}</span>
                <input
                  type="tel"
                  name="phone"
                  maxLength={24}
                  autoComplete="off"
                  dir="ltr"
                />
              </label>
              <label className={styles.field}>
                <span>{copy.quickEmail}</span>
                <input
                  type="email"
                  name="email"
                  maxLength={254}
                  autoComplete="off"
                  dir="ltr"
                />
              </label>
              <label className={styles.field}>
                <span>{copy.quickSource}</span>
                <select name="source" required defaultValue="facebook">
                  {crmQuickLeadSources.map((source) => (
                    <option key={source} value={source}>
                      {copy.quickSourceLabel[source]}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className={styles.field}>
                <legend>{copy.quickConsent}</legend>
                <label className={styles.checkbox}>
                  <input type="radio" name="consent" value="yes" required />
                  <span>{copy.quickConsentYes}</span>
                </label>
                <label className={styles.checkbox}>
                  <input type="radio" name="consent" value="no" />
                  <span>{copy.quickConsentNo}</span>
                </label>
                <small>{copy.quickConsentHint}</small>
              </fieldset>
              <button type="submit" className={styles.button}>
                {copy.registerTitle}
              </button>
            </form>
          )}
        </section>
      ) : null}
    </CrmShell>
  );
}
