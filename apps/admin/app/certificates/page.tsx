import { requirePlatformPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminCopy, getAdminEnumLabel } from '../../lib/admin-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  issueCertificateAction,
  replaceCertificateAction,
  revokeCertificateAction,
} from './actions';

export default async function CertificatesAdminPage() {
  await requirePlatformPermission('certificate:audit:read');
  const locale = await getAdminRequestLocale();
  const copy = getAdminCopy(locale).certificates;
  const common = getCommonDictionary(locale);

  const issued = await db.certificate.findMany({
    where: { completionId: { not: null } },
    select: { completionId: true },
  });
  const eligible = await db.enrollment.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: { not: null },
      id: {
        notIn: issued.flatMap((item) =>
          item.completionId ? [item.completionId] : [],
        ),
      },
    },
    select: {
      id: true,
      user: { select: { email: true } },
      course: { select: { title: true } },
    },
    take: 100,
  });
  const certificates = await db.certificate.findMany({
    select: {
      id: true,
      serialNumber: true,
      status: true,
      issuedAt: true,
      recipientNameSnapshot: true,
      courseTitleSnapshot: true,
      auditEvents: { orderBy: { occurredAt: 'desc' }, take: 3 },
    },
    orderBy: { issuedAt: 'desc' },
    take: 100,
  });
  const activeCount = certificates.filter(
    (certificate) => certificate.status === 'ACTIVE',
  ).length;
  const revokedCount = certificates.filter(
    (certificate) => certificate.status === 'REVOKED',
  ).length;
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="metric-grid" aria-label={copy.summaryAria}>
            <article>
              <span>{copy.eligibleCompletions}</span>
              <strong>{number(eligible.length)}</strong>
              <small>{copy.readyForReview}</small>
            </article>
            <article>
              <span>{copy.totalCertificates}</span>
              <strong>{number(certificates.length)}</strong>
              <small>{copy.recentRecords}</small>
            </article>
            <article>
              <span>{copy.active}</span>
              <strong>{number(activeCount)}</strong>
              <small>{copy.currentlyValid}</small>
            </article>
            <article>
              <span>{copy.revoked}</span>
              <strong>{number(revokedCount)}</strong>
              <small>{copy.invalidated}</small>
            </article>
          </section>

          <section className="admin-panel" style={{ marginBottom: '1.25rem' }}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.awaitingAction}</p>
                <h2>{copy.eligibleCompletions}</h2>
              </div>
              <span>
                {number(eligible.length)} {copy.ready}
              </span>
            </div>
            {eligible.length > 0 ? (
              <div className="compact-list">
                {eligible.map((item) => (
                  <article key={item.id}>
                    <div>
                      <h3 dir="auto">{item.course.title}</h3>
                      <p dir="auto">{item.user.email}</p>
                    </div>
                    <form action={issueCertificateAction}>
                      <input
                        type="hidden"
                        name="completionId"
                        value={item.id}
                      />
                      <button type="submit">{copy.issueCertificate}</button>
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <strong>{copy.noAwaitingTitle}</strong>
                <p>{copy.noAwaitingBody}</p>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.history}</p>
                <h2>{copy.issuedCertificates}</h2>
              </div>
              <span>
                {number(certificates.length)} {copy.records}
              </span>
            </div>
            {certificates.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {certificates.map((item) => (
                  <article
                    key={item.id}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid var(--color-brand-line)',
                      background: 'var(--color-brand-canvas)',
                    }}
                  >
                    <h3>
                      <bdi dir="auto">{item.recipientNameSnapshot}</bdi> —{' '}
                      <bdi dir="auto">{item.courseTitleSnapshot}</bdi>
                    </h3>
                    <p>
                      <code dir="ltr">{item.serialNumber}</code> ·{' '}
                      {getAdminEnumLabel(locale, item.status)} · {copy.issued}{' '}
                      {date(item.issuedAt)}
                    </p>
                    {item.auditEvents.length > 0 && (
                      <ul>
                        {item.auditEvents.map((event) => (
                          <li key={event.id}>
                            {getAdminEnumLabel(locale, event.action)} ·{' '}
                            {date(event.occurredAt)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.status === 'ACTIVE' && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(260px, 1fr))',
                          gap: '1rem',
                          marginTop: '1rem',
                        }}
                      >
                        <form action={replaceCertificateAction}>
                          <input
                            type="hidden"
                            name="certificateId"
                            value={item.id}
                          />
                          <input
                            type="hidden"
                            name="requestId"
                            value={`replacement-${item.id}`}
                          />
                          <label>
                            {copy.replacementReason}
                            <input
                              name="reason"
                              required
                              maxLength={500}
                              dir="auto"
                            />
                          </label>
                          <button type="submit">
                            {copy.replaceCertificate}
                          </button>
                        </form>
                        <form action={revokeCertificateAction}>
                          <input
                            type="hidden"
                            name="certificateId"
                            value={item.id}
                          />
                          <label>
                            {copy.revocationReason}
                            <select name="reasonCode" required>
                              <option value="issued_in_error">
                                {copy.issuedInError}
                              </option>
                              <option value="misconduct">
                                {copy.misconduct}
                              </option>
                              <option value="replaced">
                                {copy.replacement}
                              </option>
                            </select>
                          </label>
                          <button type="submit">
                            {copy.revokeCertificate}
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <strong>{copy.noIssuedTitle}</strong>
                <p>{copy.noIssuedBody}</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
