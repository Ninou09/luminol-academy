import { requireUser } from '@luminol/auth';
import { getCustomerFinanceSummary } from '@luminol/finance/server';
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../../components/portal-header';
import {
  getPortalCopy,
  getPortalStatusLabel,
} from '../../lib/portal-localization';
import { getPortalRequestLocale } from '../../lib/request-locale';

export default async function FinancePage() {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const portalCopy = getPortalCopy(locale);
  const copy = portalCopy.finance;
  const finance = await getCustomerFinanceSummary(user.id);

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section className="dashboard-intro">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.intro}</p>
          </div>
          <Link href={localizeHref(locale, '/')}>{portalCopy.shell.dashboard}</Link>
        </section>
        <section className="dashboard-section" aria-labelledby="invoice-title">
          <div className="section-heading">
            <h2 id="invoice-title">{copy.invoices}</h2>
          </div>
          {finance.invoices.length ? (
            <div className="certificate-list">
              {finance.invoices.map((invoice) => (
                <article key={invoice.id}>
                  <div>
                    <h3 dir="auto">{invoice.number}</h3>
                    <p>{getPortalStatusLabel(locale, invoice.status)}</p>
                  </div>
                  <strong dir="auto">
                    {formatLocalizedCurrency(
                      invoice.totalMinor,
                      invoice.currency,
                      locale,
                    )}
                  </strong>
                </article>
              ))}
            </div>
          ) : (
            <p>{copy.noInvoices}</p>
          )}
        </section>
        <section className="dashboard-section" aria-labelledby="payment-title">
          <div className="section-heading">
            <h2 id="payment-title">{copy.payments}</h2>
          </div>
          {finance.payments.length ? (
            <div className="certificate-list">
              {finance.payments.map((payment) => (
                <article key={payment.id}>
                  <div>
                    <h3 dir="auto">
                      {formatLocalizedCurrency(
                        payment.amountMinor,
                        payment.currency,
                        locale,
                      )}
                    </h3>
                    <p>{getPortalStatusLabel(locale, payment.status)}</p>
                  </div>
                  <span>
                    {finance.receipts.some(
                      (receipt) => receipt.paymentIntentId === payment.id,
                    )
                      ? copy.receiptIssued
                      : copy.receiptPending}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <p>{copy.noPayments}</p>
          )}
        </section>
        <section
          className="dashboard-section"
          aria-labelledby="subscription-title"
        >
          <div className="section-heading">
            <h2 id="subscription-title">{copy.subscriptions}</h2>
          </div>
          {finance.subscriptions.length ? (
            finance.subscriptions.map((subscription) => (
              <article key={subscription.id}>
                <h3 dir="auto">{subscription.pricingPlan.name}</h3>
                <p>
                  {getPortalStatusLabel(locale, subscription.status)} · {copy.renews}{' '}
                  {formatLocalizedDate(subscription.currentPeriodEnd, locale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </article>
            ))
          ) : (
            <p>{copy.noSubscriptions}</p>
          )}
        </section>
      </div>
    </main>
  );
}
