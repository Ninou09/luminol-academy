import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
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

export default async function FinanceAdminPage() {
  await requirePermission('finance:manage');
  const [invoices, payments, refunds, corporate, reconciliations] =
    await Promise.all([
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
      db.reconciliationRecord.findMany({
        orderBy: { settledAt: 'desc' },
        take: 50,
      }),
    ]);
  return (
    <main className="admin-shell">
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">Finance operations</p>
              <h1>Billing and payments</h1>
              <p>
                Manage invoice lifecycles, refunds, corporate accounts, and
                settlement reconciliation.
              </p>
            </div>
            <Link href="/">Back to operations</Link>
          </section>
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>Invoices</h2>
              <span>{invoices.length} recent</span>
            </div>
            {invoices.length ? (
              <div className="compact-list">
                {invoices.map((invoice) => (
                  <article key={invoice.id}>
                    <div>
                      <h3>{invoice.number}</h3>
                      <p>{invoice.customer.email}</p>
                    </div>
                    <div>
                      <strong>
                        {formatMoney(invoice.totalMinor, invoice.currency)}
                      </strong>
                      <small>{invoice.status.toLowerCase()}</small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No invoices.</p>
            )}
          </section>
          <section className="metric-grid" aria-label="Finance summary">
            <article>
              <span>Payments</span>
              <strong>{payments.length}</strong>
            </article>
            <article>
              <span>Refunds</span>
              <strong>{refunds.length}</strong>
            </article>
            <article>
              <span>Corporate records</span>
              <strong>{corporate.length}</strong>
            </article>
            <article>
              <span>Reconciliation exceptions</span>
              <strong>
                {
                  reconciliations.filter(
                    (item) => item.status === 'DISCREPANCY',
                  ).length
                }
              </strong>
            </article>
          </section>
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>Reconciliation</h2>
            </div>
            {reconciliations.map((record) => (
              <article key={record.id}>
                <strong>{record.providerReference}</strong> ·{' '}
                {record.status.toLowerCase()} · difference{' '}
                {formatMoney(record.differenceMinor, record.currency)}
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
