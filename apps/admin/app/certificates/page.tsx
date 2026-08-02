import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import Link from 'next/link';
import {
  issueCertificateAction,
  replaceCertificateAction,
  revokeCertificateAction,
} from './actions';
export default async function CertificatesAdminPage() {
  await requirePermission('certificate:audit:read');
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
      userId: true,
      courseId: true,
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
  return (
    <main className="admin-shell">
      <section className="admin-dashboard">
        <div className="admin-content">
          <Link href="/">← Overview</Link>
          <h1>Certificate registry</h1>
          <section className="admin-panel">
            <h2>Eligible completions</h2>
            {eligible.map((item) => (
              <form action={issueCertificateAction} key={item.id}>
                <input type="hidden" name="completionId" value={item.id} />
                <input type="hidden" name="userId" value={item.userId} />
                <input type="hidden" name="courseId" value={item.courseId} />
                <span>
                  {item.user.email} — {item.course.title}
                </span>{' '}
                <button>Issue certificate</button>
              </form>
            ))}
          </section>
          {certificates.map((item) => (
            <article className="admin-panel" key={item.id}>
              <h2>
                {item.recipientNameSnapshot} — {item.courseTitleSnapshot}
              </h2>
              <p>
                <code>{item.serialNumber}</code> · {item.status}
              </p>
              <ul>
                {item.auditEvents.map((event) => (
                  <li key={event.id}>
                    {event.action} · {event.occurredAt.toISOString()}
                  </li>
                ))}
              </ul>
              {item.status === 'ACTIVE' && (
                <form action={replaceCertificateAction}>
                  <input type="hidden" name="certificateId" value={item.id} />
                  <input
                    type="hidden"
                    name="requestId"
                    value={`replacement-${item.id}`}
                  />
                  <label>
                    Replacement reason
                    <input name="reason" required maxLength={500} />
                  </label>
                  <button>Replace certificate</button>
                </form>
              )}
              {item.status === 'ACTIVE' && (
                <form action={revokeCertificateAction}>
                  <input type="hidden" name="certificateId" value={item.id} />
                  <label>
                    Reason
                    <select name="reasonCode" required>
                      <option value="issued_in_error">Issued in error</option>
                      <option value="misconduct">Misconduct</option>
                      <option value="replaced">Replacement</option>
                    </select>
                  </label>
                  <button>Revoke certificate</button>
                </form>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
