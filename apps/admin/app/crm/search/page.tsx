import { db } from '@luminol/database';
import { searchCrmRecords } from '@luminol/database/crm';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { CrmShell } from '../../../components/crm-shell';
import styles from '../../../components/operations.module.css';
import { getAdminEnumLabel } from '../../../lib/admin-localization';
import { requireCrmActor } from '../../../lib/crm-actor.server';
import { getCrmCopy } from '../../../lib/crm-localization';
import { getOfficePaymentsCopy } from '../../../lib/office-payments-localization';
import { getAdminRequestLocale } from '../../../lib/request-locale';

type CrmSearchPageProps = {
  searchParams?: Promise<{ q?: string | string[] | undefined }>;
};

export default async function CrmSearchPage({
  searchParams,
}: CrmSearchPageProps) {
  const { user, actor } = await requireCrmActor();
  const locale = await getAdminRequestLocale();
  const copy = getCrmCopy(locale);
  const params = searchParams ? await searchParams : undefined;
  const rawQuery = typeof params?.q === 'string' ? params.q : '';
  const results = await searchCrmRecords(db, actor, rawQuery);
  const searched = results.query.length >= 2;
  const total =
    results.leads.length + results.contacts.length + results.receipts.length;
  const date = (value: Date) => formatLocalizedDate(value, locale);

  return (
    <CrmShell
      locale={locale}
      user={user}
      current="search"
      query={results.query}
    >
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.searchTitle}</h1>
          <p>{copy.searchIntro}</p>
        </div>
      </section>

      {!searched ? (
        <p className={styles.empty}>{copy.searchTooShort}</p>
      ) : total === 0 ? (
        <p className={styles.empty}>{copy.noResults}</p>
      ) : null}

      {results.leads.length > 0 ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>{copy.leads}</h2>
          </div>
          <ul className={styles.list}>
            {results.leads.map((lead) => (
              <li className={styles.row} key={lead.id}>
                <div className={styles.rowBody}>
                  <h3>
                    <Link href={localizeHref(locale, `/crm/leads/${lead.id}`)}>
                      <bdi>{lead.name}</bdi>
                    </Link>
                  </h3>
                  <p className={styles.meta}>
                    <span className={styles.chip}>
                      {getAdminEnumLabel(locale, lead.status)}
                    </span>
                    <span>{getAdminEnumLabel(locale, lead.school)}</span>
                    <bdi>{lead.email}</bdi>
                    {lead.phone ? <bdi dir="ltr">{lead.phone}</bdi> : null}
                    <span>{date(lead.createdAt)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.contacts.length > 0 ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>{copy.contacts}</h2>
          </div>
          <ul className={styles.list}>
            {results.contacts.map((contact) => (
              <li className={styles.row} key={contact.id}>
                <div className={styles.rowBody}>
                  <h3>
                    <Link
                      href={localizeHref(locale, `/crm/contacts/${contact.id}`)}
                    >
                      <bdi>{contact.displayName}</bdi>
                    </Link>
                  </h3>
                  <p className={styles.meta}>
                    {contact.phone ? (
                      <bdi dir="ltr">{contact.phone}</bdi>
                    ) : null}
                    {contact.email ? <bdi>{contact.email}</bdi> : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.receipts.length > 0 ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>{copy.receipts}</h2>
          </div>
          <ul className={styles.list}>
            {results.receipts.map((receipt) => (
              <li className={styles.row} key={receipt.id}>
                <div className={styles.rowBody}>
                  <h3>
                    <Link
                      href={localizeHref(
                        locale,
                        `/office-payments?month=${receipt.receivedAt
                          .toISOString()
                          .slice(0, 7)}`,
                      )}
                    >
                      <bdi dir="ltr">{receipt.receiptNumber}</bdi>
                    </Link>{' '}
                    · <bdi>{receipt.payerName}</bdi>
                  </h3>
                  <p className={styles.meta}>
                    <strong>
                      {formatLocalizedCurrency(
                        receipt.amountMinor,
                        'DZD',
                        locale,
                      )}
                    </strong>
                    <span>{date(receipt.receivedAt)}</span>
                    {receipt.status === 'VOIDED' ? (
                      <span className={styles.warning}>
                        {getOfficePaymentsCopy(locale).voided}
                      </span>
                    ) : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </CrmShell>
  );
}
