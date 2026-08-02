import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import Link from 'next/link';
import { setNotificationRead, updateMarketingPreference } from './actions';
export default async function NotificationsPage() {
  const user = await requireUser();
  const [items, preference] = await Promise.all([
    db.notification.findMany({
      where: { recipientId: user.id, channel: 'IN_APP' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.notificationPreference.findFirst({
      where: {
        userId: user.id,
        channel: 'EMAIL',
        category: 'MARKETING',
        organizationId: null,
      },
    }),
  ]);
  return (
    <main>
      <div className="dashboard-shell">
        <Link href="/">← Dashboard</Link>
        <section className="dashboard-section">
          <p className="eyebrow">Updates</p>
          <h1>Notifications</h1>
          {items.length ? (
            <div className="certificate-list">
              {items.map((item) => (
                <article key={item.id}>
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.body}</p>
                    <small>{item.createdAt.toLocaleDateString()}</small>
                  </div>
                  <form action={setNotificationRead}>
                    <input
                      type="hidden"
                      name="notificationId"
                      value={item.id}
                    />
                    <input
                      type="hidden"
                      name="read"
                      value={item.readAt ? 'false' : 'true'}
                    />
                    <button>{item.readAt ? 'Mark unread' : 'Mark read'}</button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <p>No notifications yet.</p>
          )}
        </section>
        <section className="dashboard-section">
          <h2>Email preferences</h2>
          <p>
            Essential account and learning messages are always sent. Optional
            updates require your consent.
          </p>
          <form action={updateMarketingPreference}>
            <label>
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={preference?.enabled ?? false}
              />{' '}
              Receive optional academy updates
            </label>
            <label>
              {' '}
              Time zone{' '}
              <input
                name="timeZone"
                defaultValue={preference?.timeZone ?? 'UTC'}
                required
              />
            </label>
            <button type="submit">Save preferences</button>
          </form>
        </section>
      </div>
    </main>
  );
}
