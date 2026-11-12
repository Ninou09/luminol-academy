import { db } from '@luminol/database';
import { clientScopeWhere } from '@luminol/database/consultations';
import { formatLocalizedNumber, localizeHref } from '@luminol/localization';
import { clientLocaleSchema } from '@luminol/validation/consultations';
import Link from 'next/link';

import styles from '../../components/operations.module.css';
import { CrmShell } from '../../components/crm-shell';
import { requireConsultationActor } from '../../lib/consultation-actor.server';
import { parseConsultationFeedback } from '../../lib/consultation-scope';
import { getClientsCopy } from '../../lib/consultations-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { createClientAction, updateClientAction } from './actions';

type ClientsPageProps = {
  searchParams?: Promise<{
    q?: string | string[] | undefined;
    fromEnquiry?: string | string[] | undefined;
    error?: string | string[] | undefined;
    saved?: string | string[] | undefined;
  }>;
};

const locales = ['ar', 'fr', 'en'] as const;

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { user, actor } = await requireConsultationActor();
  const locale = await getAdminRequestLocale();
  const copy = getClientsCopy(locale);
  const params = searchParams ? await searchParams : undefined;
  const query =
    typeof params?.q === 'string' ? params.q.trim().slice(0, 80) : '';
  const fromEnquiryId =
    actor.scope === 'all' && typeof params?.fromEnquiry === 'string'
      ? params.fromEnquiry.slice(0, 128)
      : null;
  const feedback = parseConsultationFeedback(params?.error);
  const saved = params?.saved === '1';
  const now = new Date();
  const returnTo = localizeHref(
    locale,
    query ? `/clients?q=${encodeURIComponent(query)}` : '/clients',
  );

  const [clients, enquiries, prefill] = await Promise.all([
    db.client.findMany({
      where: {
        archivedAt: null,
        ...clientScopeWhere(actor),
        ...(query
          ? {
              AND: [
                {
                  OR: [
                    {
                      displayName: { contains: query, mode: 'insensitive' },
                    },
                    { phone: { contains: query } },
                  ],
                },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                startsAt: { gte: now },
                status: { in: ['REQUESTED', 'CONFIRMED'] },
                ...(actor.scope === 'own'
                  ? { consultantUserId: actor.userId }
                  : {}),
              },
            },
          },
        },
      },
    }),
    actor.scope === 'all'
      ? db.enquiry.findMany({
          where: { client: { is: null }, status: { not: 'SPAM' } },
          orderBy: { createdAt: 'desc' },
          take: 15,
          select: { id: true, name: true, school: true, createdAt: true },
        })
      : Promise.resolve([]),
    fromEnquiryId
      ? db.enquiry.findFirst({
          where: { id: fromEnquiryId, client: { is: null } },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            locale: true,
            consent: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const prefillLocale = clientLocaleSchema.safeParse(prefill?.locale);

  const clientFields = (defaults: {
    displayName?: string | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    preferredLocale?: string | undefined;
    contactConsent?: boolean | undefined;
    operationalNote?: string | null | undefined;
  }) => (
    <div className={styles.grid}>
      <label className={styles.field}>
        <span>{copy.nameLabel}</span>
        <input
          type="text"
          name="displayName"
          minLength={2}
          maxLength={120}
          defaultValue={defaults.displayName ?? ''}
          required
        />
      </label>
      <label className={styles.field}>
        <span>{copy.phoneLabel}</span>
        <input
          type="tel"
          name="phone"
          maxLength={24}
          dir="ltr"
          defaultValue={defaults.phone ?? ''}
        />
      </label>
      <label className={styles.field}>
        <span>{copy.emailLabel}</span>
        <input
          type="email"
          name="email"
          maxLength={254}
          dir="ltr"
          defaultValue={defaults.email ?? ''}
        />
      </label>
      <label className={styles.field}>
        <span>{copy.localeLabel}</span>
        <select
          name="preferredLocale"
          defaultValue={defaults.preferredLocale ?? 'ar'}
        >
          {locales.map((value) => (
            <option key={value} value={value}>
              {copy.localeName[value]}
            </option>
          ))}
        </select>
      </label>
      <label className={`${styles.checkbox} ${styles.wide}`}>
        <input
          type="checkbox"
          name="contactConsent"
          defaultChecked={defaults.contactConsent ?? false}
        />
        <span>{copy.consentLabel}</span>
      </label>
      <label className={`${styles.field} ${styles.wide}`}>
        <span>{copy.noteLabel}</span>
        <textarea
          name="operationalNote"
          rows={2}
          maxLength={500}
          defaultValue={defaults.operationalNote ?? ''}
        />
      </label>
    </div>
  );

  return (
    <CrmShell locale={locale} user={user} current="clients">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>

      {feedback ? (
        <p className={styles.warning} role="alert">
          {copy.feedback[feedback]}
        </p>
      ) : saved ? (
        <p className={styles.success} role="status">
          {copy.saved}
        </p>
      ) : null}

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>{copy.listTitle}</h2>
          <form className={styles.inline} method="get">
            <input
              type="search"
              name="q"
              maxLength={80}
              defaultValue={query}
              aria-label={copy.searchLabel}
              placeholder={copy.searchLabel}
            />
            <button type="submit" className={styles.secondaryButton}>
              {copy.search}
            </button>
          </form>
        </div>
        {clients.length === 0 ? (
          <p className={styles.empty}>{copy.noClients}</p>
        ) : (
          <ul className={styles.list}>
            {clients.map((client) => (
              <li className={styles.row} key={client.id}>
                <div className={styles.rowBody}>
                  <h3>
                    <Link
                      href={localizeHref(locale, `/crm/contacts/${client.id}`)}
                    >
                      <bdi>{client.displayName}</bdi>
                    </Link>
                  </h3>
                  <p className={styles.meta}>
                    {client.phone ? <bdi dir="ltr">{client.phone}</bdi> : null}
                    {client.email ? <bdi>{client.email}</bdi> : null}
                    <span className={styles.chip}>
                      {client.contactConsent ? copy.consentYes : copy.consentNo}
                    </span>
                    {client.sourceEnquiryId ? (
                      <span className={styles.chip}>{copy.fromEnquiry}</span>
                    ) : null}
                    <span>
                      {copy.upcoming(number(client._count.appointments))}
                    </span>
                  </p>
                  {client.operationalNote ? (
                    <p className={styles.note}>{client.operationalNote}</p>
                  ) : null}
                </div>
                <div className={styles.rowBody}>
                  <Link
                    href={`${localizeHref(
                      locale,
                      `/consultations?client=${client.id}`,
                    )}#book`}
                  >
                    {copy.book}
                  </Link>
                  <details>
                    <summary>{copy.edit}</summary>
                    <form action={updateClientAction} className={styles.form}>
                      <input type="hidden" name="clientId" value={client.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      {clientFields(client)}
                      <label className={styles.checkbox}>
                        <input type="checkbox" name="archive" />
                        <span>{copy.archiveLabel}</span>
                      </label>
                      <div>
                        <button type="submit" className={styles.button}>
                          {copy.save}
                        </button>
                      </div>
                    </form>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-panel" id="new-client">
        <div className="panel-heading">
          <div>
            <h2>{copy.createTitle}</h2>
            <p className={styles.note}>{copy.createIntro}</p>
            <p className={styles.note}>{copy.boundary}</p>
            {prefill ? (
              <p className={styles.note}>
                {copy.prefilledFrom(prefill.name)} {copy.consentHelp}
              </p>
            ) : null}
          </div>
        </div>
        <form action={createClientAction} className={styles.form}>
          <input
            type="hidden"
            name="returnTo"
            value={localizeHref(locale, '/clients')}
          />
          {prefill ? (
            <input type="hidden" name="sourceEnquiryId" value={prefill.id} />
          ) : null}
          {clientFields({
            displayName: prefill?.name,
            phone: prefill?.phone,
            email: prefill?.email,
            preferredLocale: prefillLocale.success ? prefillLocale.data : 'ar',
            contactConsent: prefill?.consent ?? false,
          })}
          <div>
            <button type="submit" className={styles.button}>
              {copy.create}
            </button>
          </div>
        </form>
      </section>

      {actor.scope === 'all' ? (
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <h2>{copy.fromEnquiryTitle}</h2>
              <p className={styles.note}>{copy.fromEnquiryIntro}</p>
            </div>
          </div>
          {enquiries.length === 0 ? (
            <p className={styles.empty}>{copy.noEnquiries}</p>
          ) : (
            <ul className={styles.list}>
              {enquiries.map((enquiry) => (
                <li className={styles.row} key={enquiry.id}>
                  <span>
                    <bdi>{enquiry.name}</bdi>
                  </span>
                  <Link
                    href={`${localizeHref(
                      locale,
                      `/clients?fromEnquiry=${enquiry.id}`,
                    )}#new-client`}
                  >
                    {copy.useEnquiry}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </CrmShell>
  );
}
