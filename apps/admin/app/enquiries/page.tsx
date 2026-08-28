import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminEnumLabel } from '../../lib/admin-localization';
import {
  getEnquiryContactPreferenceLabel,
  getEnquiryDeliveryPreferenceLabel,
  getEnquiryDeskCopy,
  getEnquiryTimingPreferenceLabel,
} from '../../lib/enquiry-desk-localization';
import {
  displayPersonName,
  enquiryStatuses,
  getEnquiryTransitions,
  type EnquiryStatusValue,
} from '../../lib/operations';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  transitionEnquiryStatus,
  updateEnquiryFollowUpPlan,
  updateEnquiryOwnership,
} from './actions';
import styles from './page.module.css';

type FollowUpFilter = 'due-today' | 'overdue';

type EnquiryPageProps = {
  searchParams?: Promise<{
    status?: string | string[] | undefined;
    followUp?: string | string[] | undefined;
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(
  value: string | string[] | undefined,
): EnquiryStatusValue | null {
  const candidate = firstParam(value);
  if (!candidate) return null;

  return (enquiryStatuses as readonly string[]).includes(candidate)
    ? (candidate as EnquiryStatusValue)
    : null;
}

function parseFollowUp(
  value: string | string[] | undefined,
): FollowUpFilter | null {
  const candidate = firstParam(value);
  return candidate === 'due-today' || candidate === 'overdue'
    ? candidate
    : null;
}

function enquiryHref(
  locale: Locale,
  status: EnquiryStatusValue | null,
  followUp: FollowUpFilter | null,
) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (followUp) query.set('followUp', followUp);
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return localizeHref(locale, `/enquiries${suffix}`);
}

function dateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : '';
}

export default async function EnquiriesAdminPage({
  searchParams,
}: EnquiryPageProps) {
  const administrator = await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getEnquiryDeskCopy(locale);
  const common = getCommonDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const activeStatus = parseStatus(params?.status);
  const activeFollowUp = parseFollowUp(params?.followUp);
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const tomorrowUtc = new Date(todayUtc.getTime() + 86_400_000);
  const statusFilter = activeStatus ? { status: activeStatus } : {};
  const followUpFilter =
    activeFollowUp === 'overdue'
      ? { nextFollowUpAt: { lt: todayUtc } }
      : activeFollowUp === 'due-today'
        ? { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } }
        : {};
  const enquiries = await db.enquiry.findMany({
    ...(activeStatus || activeFollowUp
      ? { where: { ...statusFilter, ...followUpFilter } }
      : {}),
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      preferredContact: true,
      deliveryPreference: true,
      timingPreference: true,
      school: true,
      message: true,
      locale: true,
      status: true,
      source: true,
      createdAt: true,
      nextFollowUpAt: true,
      nextAction: true,
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
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

            <div className={styles.filterGroups}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>
                  {copy.filterByStatus}
                </span>
                <nav
                  className={styles.filters}
                  aria-label={copy.filterByStatus}
                >
                  <Link
                    className={`${styles.filterLink} ${
                      activeStatus === null ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(locale, null, activeFollowUp)}
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
                      href={enquiryHref(locale, status, activeFollowUp)}
                      aria-current={
                        activeStatus === status ? 'page' : undefined
                      }
                    >
                      <span>{getAdminEnumLabel(locale, status)}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>
                  {copy.filterByFollowUp}
                </span>
                <nav
                  className={styles.filters}
                  aria-label={copy.filterByFollowUp}
                >
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === null ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(locale, activeStatus, null)}
                    aria-current={activeFollowUp === null ? 'page' : undefined}
                  >
                    <span>{copy.allFollowUps}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === 'due-today' ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(locale, activeStatus, 'due-today')}
                    aria-current={
                      activeFollowUp === 'due-today' ? 'page' : undefined
                    }
                  >
                    <span>{copy.dueToday}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === 'overdue' ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(locale, activeStatus, 'overdue')}
                    aria-current={
                      activeFollowUp === 'overdue' ? 'page' : undefined
                    }
                  >
                    <span>{copy.overdue}</span>
                  </Link>
                </nav>
              </div>
            </div>
          </section>

          {enquiries.length > 0 ? (
            <section className={styles.list} aria-live="polite">
              {enquiries.map((enquiry) => {
                const ownerName = enquiry.owner
                  ? displayPersonName(
                      enquiry.owner.firstName,
                      enquiry.owner.lastName,
                      enquiry.owner.email,
                    )
                  : copy.unassigned;
                const ownedByAdministrator =
                  enquiry.owner?.id === administrator.id;
                const hasFollowUpPlan = Boolean(
                  enquiry.nextFollowUpAt && enquiry.nextAction,
                );

                return (
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
                      <div className={styles.metaItem}>
                        <span>{copy.city}</span>
                        <p dir="auto">{enquiry.city || copy.notProvided}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.preferredContact}</span>
                        <p>
                          {getEnquiryContactPreferenceLabel(
                            locale,
                            enquiry.preferredContact,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.deliveryPreference}</span>
                        <p>
                          {getEnquiryDeliveryPreferenceLabel(
                            locale,
                            enquiry.deliveryPreference,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.timingPreference}</span>
                        <p>
                          {getEnquiryTimingPreferenceLabel(
                            locale,
                            enquiry.timingPreference,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.owner}</span>
                        <p dir="auto">
                          {ownedByAdministrator
                            ? copy.assignedToYou
                            : ownerName}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.nextFollowUp}</span>
                        <p>
                          {enquiry.nextFollowUpAt
                            ? date(enquiry.nextFollowUpAt)
                            : copy.noFollowUp}
                        </p>
                      </div>
                    </div>

                    <div className={styles.messageBlock}>
                      <span className={styles.messageLabel}>
                        {copy.message}
                      </span>
                      <p className={styles.messageBody} dir="auto">
                        {enquiry.message}
                      </p>
                      <p className={styles.privacyNote}>
                        {copy.protectedMessage}
                      </p>
                    </div>

                    <section className={styles.followUpBlock}>
                      <div className={styles.followUpHeading}>
                        <div>
                          <span className={styles.messageLabel}>
                            {copy.followUpPlan}
                          </span>
                          <p dir="auto">
                            {enquiry.nextAction || copy.noNextAction}
                          </p>
                        </div>
                      </div>
                      <form
                        action={updateEnquiryFollowUpPlan}
                        className={styles.followUpForm}
                      >
                        <input
                          type="hidden"
                          name="enquiryId"
                          value={enquiry.id}
                        />
                        <input type="hidden" name="operation" value="save" />
                        <label className={styles.followUpField}>
                          <span>{copy.nextFollowUp}</span>
                          <input
                            type="date"
                            name="nextFollowUpOn"
                            defaultValue={dateInputValue(
                              enquiry.nextFollowUpAt,
                            )}
                            required
                          />
                        </label>
                        <label className={styles.followUpField}>
                          <span>{copy.nextAction}</span>
                          <input
                            type="text"
                            name="nextAction"
                            defaultValue={enquiry.nextAction ?? ''}
                            maxLength={240}
                            required
                            dir="auto"
                          />
                        </label>
                        <button type="submit">{copy.saveFollowUp}</button>
                      </form>
                      {hasFollowUpPlan ? (
                        <form action={updateEnquiryFollowUpPlan}>
                          <input
                            type="hidden"
                            name="enquiryId"
                            value={enquiry.id}
                          />
                          <input type="hidden" name="operation" value="clear" />
                          <button
                            className={styles.clearFollowUpButton}
                            type="submit"
                          >
                            {copy.clearFollowUp}
                          </button>
                        </form>
                      ) : null}
                    </section>

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
                        {!ownedByAdministrator ? (
                          <form action={updateEnquiryOwnership}>
                            <input
                              type="hidden"
                              name="enquiryId"
                              value={enquiry.id}
                            />
                            <input
                              type="hidden"
                              name="operation"
                              value="assign-to-me"
                            />
                            <button
                              className={styles.ownershipButton}
                              type="submit"
                            >
                              {copy.assignToMe}
                            </button>
                          </form>
                        ) : null}
                        {enquiry.owner ? (
                          <form action={updateEnquiryOwnership}>
                            <input
                              type="hidden"
                              name="enquiryId"
                              value={enquiry.id}
                            />
                            <input
                              type="hidden"
                              name="operation"
                              value="unassign"
                            />
                            <button
                              className={styles.ownershipButton}
                              type="submit"
                            >
                              {copy.unassign}
                            </button>
                          </form>
                        ) : null}
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
                );
              })}
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
