import { requirePlatformPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  getLocaleDirection,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminCopy, getAdminEnumLabel } from '../../lib/admin-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';

export default async function DeliveryPage() {
  await requirePlatformPermission('notification:failures:read');
  const locale = await getAdminRequestLocale();
  const copy = getAdminCopy(locale).notifications;
  const common = getCommonDictionary(locale);
  const backArrow = getLocaleDirection(locale) === 'rtl' ? '→' : '←';
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
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <Link href={localizeHref(locale, '/')}>
              <span aria-hidden="true">{backArrow}</span> {copy.back}
            </Link>
            <AdminLanguageSwitcher
              locale={locale}
              label={common.languageSelectorLabel}
            />
          </div>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
          {deliveries.length > 0 ? (
            deliveries.map((item) => (
              <article className="admin-panel" key={item.id}>
                <strong>{getAdminEnumLabel(locale, item.status)}</strong>
                <p>
                  {getAdminEnumLabel(locale, item.channel)} · {copy.attempt}{' '}
                  {formatLocalizedNumber(item.attemptCount, locale)} ·{' '}
                  <bdi dir="auto">{item.lastErrorCode ?? copy.noErrorCode}</bdi>
                </p>
                <small>
                  {copy.organization}:{' '}
                  <bdi dir="auto">{item.organizationId ?? copy.personal}</bdi> ·{' '}
                  {copy.next}:{' '}
                  {formatLocalizedDate(item.scheduledAt, locale, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </small>
              </article>
            ))
          ) : (
            <p className="admin-empty">{copy.noFailures}</p>
          )}
        </div>
      </section>
    </main>
  );
}
