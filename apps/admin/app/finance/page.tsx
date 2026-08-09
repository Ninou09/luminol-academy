import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedCurrency,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminCopy, getAdminEnumLabel } from '../../lib/admin-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';

export default async function FinanceAdminPage() {
  await requirePermission('finance:manage');
  const locale = await getAdminRequestLocale();
  const copy = getAdminCopy(locale).finance;
  const common = getCommonDictionary(locale);
  const [invoices, payments, refunds, corporate, reconciliations] = await Promise.all([
    db.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { customer: { select: { email: true } } },
    }),
    db.paymentIntent.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    db.refund.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    db.corporateBillingRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { invoice: true },
    }),
    db.reconciliationRecord.findMany({ orderBy: { settledAt: 'desc' }, take: 50 }),
  ]);
  const number = (value: number) => formatLocalizedNumber(value, locale);

  return (
    <main className="admin-shell" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <AdminLanguageSwitcher locale={locale} label={common.languageSelectorLabel} />
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.invoices}</h2>
              <span>{number(invoices.length)} {copy.recent}</span>
            </div>
            {invoices.length ? (
              <div className="compact-list">
                {invoices.map((invoice) => (
                  <article key={invoice.id}>
                    <div>
                      <h3 dir="auto">{invoice.number}</h3>
                      <p dir="auto">{invoice.customer.email}</p>
                    </div>
                    <div>
                      <strong>{formatLocalizedCurrency(invoice.totalMinor, invoice.currency, locale)}</strong>
                      <small>{getAdminEnumLabel(locale, invoice.status)}</small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{copy.noInvoices}</p>
            )}
          </section>

          <section className="metric-grid" aria-label={copy.summaryAria}>
            <article>
              <span>{copy.payments}</span>
              <strong>{number(payments.length)}</strong>
            </article>
            <article>
              <span>{copy.refunds}</span>
              <strong>{number(refunds.length)}</strong>
            </article>
            <article>
              <span>{copy.corporateRecords}</span>
              <strong>{number(corporate.length)}</strong>
            </article>
            <article>
              <span>{copy.reconciliationExceptions}</span>
              <strong>{number(reconciliations.filter((item) => item.status === 'DISCREPANCY').length)}</strong>
            </article>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{copy.reconciliation}</h2>
            </div>
            {reconciliations.length > 0 ? (
              <div className="compact-list">
                {reconciliations.map((record) => (
                  <article key={record.id}>
                    <div>
                      <strong dir="auto">{record.providerReference}</strong>
                      <p>{getAdminEnumLabel(locale, record.status)}</p>
                    </div>
                    <div>
                      <small>{copy.difference}</small>
                      <strong>{formatLocalizedCurrency(record.differenceMinor, record.currency, locale)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{copy.noReconciliation}</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
