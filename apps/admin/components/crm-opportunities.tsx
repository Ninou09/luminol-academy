import { localizeHref, type Locale } from '@luminol/localization';
import {
  crmSections,
  crmSectionSlugs,
  type CrmSectionValue,
} from '@luminol/validation/crm-sections';
import Link from 'next/link';

import { createCrmDealAction } from '../app/crm/sections/actions';
import type { CrmSectionsCopy } from '../lib/crm-sections-localization';
import styles from './operations.module.css';

export type CrmOpportunityRow = {
  id: string;
  section: CrmSectionValue;
  stage: string;
  state: 'OPEN' | 'WON' | 'LOST';
  offer: string | null;
  value: string | null;
  lostReason: string | null;
};

export type CrmBookableOffer = {
  id: string;
  section: CrmSectionValue;
  title: string;
};

type CrmOpportunitiesProps = {
  locale: Locale;
  copy: CrmSectionsCopy;
  deals: CrmOpportunityRow[];
  offers: CrmBookableOffer[];
  subject: { enquiryId: string } | { clientId: string };
  defaultSection: CrmSectionValue | null;
  returnTo: string;
};

/** Opportunities of one lead or contact, with the form to open a new one. */
export function CrmOpportunities({
  locale,
  copy,
  deals,
  offers,
  subject,
  defaultSection,
  returnTo,
}: CrmOpportunitiesProps) {
  return (
    <section className="admin-panel">
      <div className="panel-heading">
        <h2>{copy.opportunities}</h2>
      </div>
      {deals.length === 0 ? (
        <p className={styles.empty}>{copy.noOpportunities}</p>
      ) : (
        <ul className={styles.list}>
          {deals.map((deal) => (
            <li key={deal.id}>
              <Link
                href={localizeHref(
                  locale,
                  `/crm/sections/${crmSectionSlugs[deal.section]}`,
                )}
              >
                {copy.section[deal.section]}
              </Link>{' '}
              ·{' '}
              <span
                className={
                  deal.state === 'WON'
                    ? styles.success
                    : deal.state === 'LOST'
                      ? styles.warning
                      : styles.chip
                }
              >
                {copy.stage[deal.stage] ?? deal.stage}
              </span>
              {deal.offer ? (
                <>
                  {' '}
                  · <bdi>{deal.offer}</bdi>
                </>
              ) : null}
              {deal.value ? <> · {deal.value}</> : null}
              {deal.lostReason ? (
                <p className={styles.meta}>
                  {copy.closeReason}: <bdi>{deal.lostReason}</bdi>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <details>
        <summary>{copy.addOpportunity}</summary>
        <form action={createCrmDealAction} className={styles.form}>
          <input type="hidden" name="returnTo" value={returnTo} />
          {'enquiryId' in subject ? (
            <input type="hidden" name="enquiryId" value={subject.enquiryId} />
          ) : (
            <input type="hidden" name="clientId" value={subject.clientId} />
          )}
          <label className={styles.field}>
            <span>{copy.opportunitySection}</span>
            <select
              name="section"
              required
              defaultValue={defaultSection ?? crmSections[0]}
            >
              {crmSections.map((section) => (
                <option key={section} value={section}>
                  {copy.section[section]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{copy.opportunityOffer}</span>
            <select name="offerId" defaultValue="">
              <option value="">{copy.noOffer}</option>
              {crmSections.map((section) => {
                const sectionOffers = offers.filter(
                  (offer) => offer.section === section,
                );
                return sectionOffers.length > 0 ? (
                  <optgroup key={section} label={copy.section[section]}>
                    {sectionOffers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.title}
                      </option>
                    ))}
                  </optgroup>
                ) : null;
              })}
            </select>
          </label>
          <label className={styles.field}>
            <span>{copy.opportunityValue}</span>
            <input
              type="number"
              name="valueDinars"
              min={0}
              max={20_000_000}
              step={1}
              inputMode="numeric"
            />
            <small>{copy.opportunityValueHint}</small>
          </label>
          <label className={styles.field}>
            <span>{copy.expectedClose}</span>
            <input type="date" name="expectedCloseOn" />
          </label>
          <button type="submit" className={styles.button}>
            {copy.saveOpportunity}
          </button>
        </form>
      </details>
    </section>
  );
}
