import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import Link from 'next/link';
export default async function DeliveryPage() {
  await requirePermission('notification:failures:read');
  const deliveries = await db.notification.findMany({
    where: { status: { in: ['RETRY_SCHEDULED', 'DEAD_LETTER'] } },
    select: {
      id: true,
      channel: true,
      status: true,
      attemptCount: true,
      lastErrorCode: true,
      scheduledAt: true,
      organizationId: true,
    },
    orderBy: { scheduledAt: 'asc' },
    take: 100,
  });
  return (
    <main className="admin-shell">
      <section className="admin-dashboard">
        <div className="admin-content">
          <Link href="/">← Overview</Link>
          <h1>Notification delivery</h1>
          <p>
            Failure details exclude message bodies and recipient private data.
          </p>
          {deliveries.map((item) => (
            <article className="admin-panel" key={item.id}>
              <strong>{item.status}</strong>
              <p>
                {item.channel} · attempt {item.attemptCount} ·{' '}
                {item.lastErrorCode ?? 'No error code'}
              </p>
              <small>
                Organization: {item.organizationId ?? 'Personal'} · next:{' '}
                {item.scheduledAt.toISOString()}
              </small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
