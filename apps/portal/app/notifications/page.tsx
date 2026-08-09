import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { formatLocalizedDate, localizeHref } from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../../components/portal-header';
import { getPortalCopy } from '../../lib/portal-localization';
import { getPortalArrow } from '../../lib/portal-direction';
import { getPortalRequestLocale } from '../../lib/request-locale';
import { setNotificationRead, updateMarketingPreference } from './actions';

export default async function NotificationsPage() {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale).notifications;
  const dashboardLabel = getPortalCopy(locale).shell.dashboard;
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
      <PortalHeader />
      <div className="dashboard-shell">
        <Link href={localizeHref(locale, '/')}>
          {getPortalArrow(locale, 'back')} {dashboardLabel}
        </Link>
        <section className="dashboard-section">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          {items.length ? (
            <div className="certificate-list">
              {items.map((item) => (
                <article key={item.id}>
                  <div>
                    <h2 dir="auto">{item.title}</h2>
                    <p dir="auto">{item.body}</p>
                    <small>
                      {formatLocalizedDate(item.createdAt, locale, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </small>
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
                    <button type="submit">
                      {item.readAt ? copy.markUnread : copy.markRead}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <p>{copy.empty}</p>
          )}
        </section>
        <section className="dashboard-section">
          <h2>{copy.emailPreferences}</h2>
          <p>{copy.preferencesBody}</p>
          <form action={updateMarketingPreference}>
            <label>
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={preference?.enabled ?? false}
              />{' '}
              {copy.marketing}
            </label>
            <label>
              {copy.timeZone}{' '}
              <input
                name="timeZone"
                dir="ltr"
                defaultValue={preference?.timeZone ?? 'UTC'}
                required
              />
            </label>
            <button type="submit">{copy.save}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
