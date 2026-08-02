import { requireUser } from '@luminol/auth';
import { getCustomerFinanceSummary } from '@luminol/finance/server';
import Link from 'next/link';

const money = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'USD',
});
function formatMoney(amountMinor: number, currency: string) {
  return money
    .formatToParts(amountMinor / 100)
    .map((part) => (part.type === 'currency' ? currency : part.value))
    .join('');
}

export default async function FinancePage() {
  const user = await requireUser();
  const finance = await getCustomerFinanceSummary(user.id);
  return (
    <main className="dashboard-shell">
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Invoices and payments</h1>
          <p>
            Your payment history, receipts, and subscription status in one
            secure view.
          </p>
        </div>
        <Link href="/">Back to learning</Link>
      </section>
      <section className="dashboard-section" aria-labelledby="invoice-title">
        <div className="section-heading">
          <h2 id="invoice-title">Invoices</h2>
        </div>
        {finance.invoices.length ? (
          <div className="certificate-list">
            {finance.invoices.map((invoice) => (
              <article key={invoice.id}>
                <div>
                  <h3>{invoice.number}</h3>
                  <p>{invoice.status.replaceAll('_', ' ').toLowerCase()}</p>
                </div>
                <strong>
                  {formatMoney(invoice.totalMinor, invoice.currency)}
                </strong>
              </article>
            ))}
          </div>
        ) : (
          <p>No invoices yet.</p>
        )}
      </section>
      <section className="dashboard-section" aria-labelledby="payment-title">
        <div className="section-heading">
          <h2 id="payment-title">Payment history and receipts</h2>
        </div>
        {finance.payments.length ? (
          <div className="certificate-list">
            {finance.payments.map((payment) => (
              <article key={payment.id}>
                <div>
                  <h3>{formatMoney(payment.amountMinor, payment.currency)}</h3>
                  <p>{payment.status.replaceAll('_', ' ').toLowerCase()}</p>
                </div>
                <span>
                  {finance.receipts.some(
                    (receipt) => receipt.paymentIntentId === payment.id,
                  )
                    ? 'Receipt issued'
                    : 'Receipt pending'}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p>No payments yet.</p>
        )}
      </section>
      <section
        className="dashboard-section"
        aria-labelledby="subscription-title"
      >
        <div className="section-heading">
          <h2 id="subscription-title">Subscriptions</h2>
        </div>
        {finance.subscriptions.length ? (
          finance.subscriptions.map((subscription) => (
            <article key={subscription.id}>
              <h3>{subscription.pricingPlan.name}</h3>
              <p>
                {subscription.status.toLowerCase()} · renews{' '}
                {subscription.currentPeriodEnd.toLocaleDateString()}
              </p>
            </article>
          ))
        ) : (
          <p>No active subscriptions.</p>
        )}
      </section>
    </main>
  );
}
