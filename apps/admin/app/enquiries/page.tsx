import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminEnumLabel } from '../../lib/admin-localization';
import { getEnquiryDeskCopy } from '../../lib/enquiry-desk-localization';
import {
  enquiryStatuses,
  getEnquiryTransitions,
  type EnquiryStatusValue,
} from '../../lib/operations';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { transitionEnquiryStatus } from './actions';
import styles from './page.module.css';

type EnquiryPageProps = {
  searchParams?: Promise<{ status?: string | string[] | undefined }>;
};

function parseStatus(
  value: string | string[] | undefined,
): EnquiryStatusValue | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return null;

  return (enquiryStatuses as readonly string[]).includes(candidate)
    ? (candidate as EnquiryStatusValue)
    : null;
}

export default async function EnquiriesAdminPage({
  searchParams,
}: EnquiryPageProps) {
  await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getEnquiryDeskCopy(locale);
  const common = getCommonDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const activeStatus = parseStatus(params?.status);
  const enquiries = await db.enquiry.findMany({
    ...(activeStatus ? { where: { status: activeStatus } } : {}),
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      school: true,
      message: true,
      locale: true,
      status: true,
      source: true,
      createdAt: true,
    },
  });
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) => formatLocalizedDate(value, locale);

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
            </div>
            <div className={styles.toolbar}>
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.filterByStatus}</p>
                <h2>
                  {number(enquiries.length)} {copy.enquiries}
                </h2>
              </div>
            </div>

            <nav className={styles.filters} aria-label={copy.filterByStatus}>
              <Link
                className={`${styles.filterLink} ${
                  activeStatus === null ? styles.activeFilter : ''
                }`}
                href={localizeHref(locale, '/enquiries')}
                aria-current={activeStatus === null ? 'page' : undefined}
              >
                <span>{copy.all}</span>
              </Link>
              {enquiryStatuses.map((status) => (
                <Link
                  key={status}
                  className={`${styles.filterLink} ${
                    activeStatus === status ? styles.activeFilter : ''
                  }`}
                  href={localizeHref(locale, `/enquiries?status=${status}`)}
                  aria-current={activeStatus === status ? 'page' : undefined}
                >
                  <span>{getAdminEnumLabel(locale, status)}</span>
                </Link>
              ))}
            </nav>
          </section>

          {enquiries.length > 0 ? (
            <section className={styles.list} aria-live="polite">
              {enquiries.map((enquiry) => (
                <article className={styles.card} key={enquiry.id}>
                  <header className={styles.cardHeader}>
                    <div className={styles.identity}>
                      <h2 dir="auto">{enquiry.name}</h2>
                      <p dir="auto">{enquiry.email}</p>
                    </div>
                    <div>
                      <span
                        className={`data-status status-${enquiry.status.toLowerCase()}`}
                      >
                        {getAdminEnumLabel(locale, enquiry.status)}
                      </span>
                    </div>
                  </header>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span>{copy.received}</span>
                      <p>{date(enquiry.createdAt)}</p>
                    </div>
                    <div className={styles.metaItem}>
                      <span>{copy.school}</span>
                      <p>{getAdminEnumLabel(locale, enquiry.school)}</p>
                    </div>
                    <div className={styles.metaItem}>
                      <span>{copy.language}</span>
                      <p dir="auto">{enquiry.locale.toUpperCase()}</p>
                    </div>
                    <div className={styles.metaItem}>
                      <span>{copy.source}</span>
                      <p dir="auto">{enquiry.source}</p>
                    </div>
                    <div className={styles.metaItem}>
                      <span>{copy.contact}</span>
                      <p dir="auto">{enquiry.phone || copy.noPhone}</p>
                    </div>
                  </div>

                  <div className={styles.messageBlock}>
                    <span className={styles.messageLabel}>{copy.message}</span>
                    <p className={styles.messageBody} dir="auto">
                      {enquiry.message}
                    </p>
                    <p className={styles.privacyNote}>
                      {copy.protectedMessage}
                    </p>
                  </div>

                  <div className={styles.statusRow}>
                    <div className={styles.actions}>
                      <a
                        className={styles.contactLink}
                        href={`mailto:${enquiry.email}`}
                      >
                        {copy.email}
                      </a>
                      {enquiry.phone ? (
                        <a
                          className={styles.contactLink}
                          href={`tel:${enquiry.phone}`}
                        >
                          {copy.call}
                        </a>
                      ) : (
                        <span className={styles.muted}>{copy.noPhone}</span>
                      )}
                    </div>

                    <form
                      action={transitionEnquiryStatus}
                      className={styles.statusForm}
                    >
                      <input
                        type="hidden"
                        name="enquiryId"
                        value={enquiry.id}
                      />
                      <label>
                        <span className="sr-only">
                          {copy.updateStatus}: {enquiry.name}
                        </span>
                        <select
                          name="toStatus"
                          defaultValue=""
                          required
                          aria-label={`${copy.updateStatus}: ${enquiry.name}`}
                        >
                          <option value="" disabled>
                            {copy.moveTo}
                          </option>
                          {getEnquiryTransitions(enquiry.status).map(
                            (status) => (
                              <option key={status} value={status}>
                                {getAdminEnumLabel(locale, status)}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                      <button type="submit">{copy.update}</button>
                    </form>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="admin-panel">
              <p className="admin-empty">{copy.noMatches}</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
