import { requirePlatformPermission } from '@luminol/auth';
import { db } from '@luminol/database';
import Link from 'next/link';

import {
  issueCertificateAction,
  replaceCertificateAction,
  revokeCertificateAction,
} from './actions';

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default async function CertificatesAdminPage() {
  await requirePlatformPermission('certificate:audit:read');

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

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">Credential operations</p>
              <h1>Certificate registry</h1>
              <p>
                Issue certificates from verified completions, review their audit
                history, and manage replacements or revocations.
              </p>
            </div>
            <Link href="/">Back to operations</Link>
          </section>

          <section className="metric-grid" aria-label="Certificate summary">
            <article>
              <span>Eligible completions</span>
              <strong>{eligible.length}</strong>
              <small>Ready for certificate review</small>
            </article>
            <article>
              <span>Total certificates</span>
              <strong>{certificates.length}</strong>
              <small>Most recent 100 records</small>
            </article>
            <article>
              <span>Active</span>
              <strong>{activeCount}</strong>
              <small>Currently valid credentials</small>
            </article>
            <article>
              <span>Revoked</span>
              <strong>{revokedCount}</strong>
              <small>Invalidated credentials</small>
            </article>
          </section>

          <section className="admin-panel" style={{ marginBottom: '1.25rem' }}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Awaiting action</p>
                <h2>Eligible completions</h2>
              </div>
              <span>{eligible.length} ready</span>
            </div>

            {eligible.length > 0 ? (
              <div className="compact-list">
                {eligible.map((item) => (
                  <article key={item.id}>
                    <div>
                      <h3>{item.course.title}</h3>
                      <p>{item.user.email}</p>
                    </div>
                    <form action={issueCertificateAction}>
                      <input
                        type="hidden"
                        name="completionId"
                        value={item.id}
                      />
                      <button type="submit">Issue certificate</button>
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <strong>No certificates are waiting to be issued.</strong>
                <p>
                  A learner appears here only after a published programme
                  enrolment has been marked completed with a completion date.
                </p>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Credential history</p>
                <h2>Issued certificates</h2>
              </div>
              <span>{certificates.length} records</span>
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
                      {item.recipientNameSnapshot} — {item.courseTitleSnapshot}
                    </h3>
                    <p>
                      <code>{item.serialNumber}</code> · {item.status} · issued{' '}
                      {dateFormatter.format(item.issuedAt)}
                    </p>

                    {item.auditEvents.length > 0 && (
                      <ul>
                        {item.auditEvents.map((event) => (
                          <li key={event.id}>
                            {event.action} ·{' '}
                            {dateFormatter.format(event.occurredAt)}
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
                            Replacement reason
                            <input name="reason" required maxLength={500} />
                          </label>
                          <button type="submit">Replace certificate</button>
                        </form>

                        <form action={revokeCertificateAction}>
                          <input
                            type="hidden"
                            name="certificateId"
                            value={item.id}
                          />
                          <label>
                            Revocation reason
                            <select name="reasonCode" required>
                              <option value="issued_in_error">
                                Issued in error
                              </option>
                              <option value="misconduct">Misconduct</option>
                              <option value="replaced">Replacement</option>
                            </select>
                          </label>
                          <button type="submit">Revoke certificate</button>
                        </form>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <strong>No certificates have been issued yet.</strong>
                <p>
                  Issued credentials and their audit history will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
