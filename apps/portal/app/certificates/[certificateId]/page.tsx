import { AuthorizationError, requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import Link from 'next/link';
import { z } from 'zod';
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const user = await requireUser();
  const { certificateId } = z
    .object({ certificateId: z.string().min(1) })
    .parse(await params);
  const certificate = await db.certificate.findFirst({
    where: { id: certificateId, userId: user.id },
    select: {
      serialNumber: true,
      recipientNameSnapshot: true,
      recipientName: true,
      courseTitleSnapshot: true,
      issuerNameSnapshot: true,
      issuedAt: true,
      status: true,
    },
  });
  if (!certificate) throw new AuthorizationError();
  return (
    <main>
      <div className="dashboard-shell">
        <Link href="/">← Dashboard</Link>
        <section
          className="dashboard-section"
          aria-labelledby="certificate-title"
        >
          <p className="eyebrow">{certificate.issuerNameSnapshot}</p>
          <h1 id="certificate-title">Certificate of completion</h1>
          <p>This certifies that</p>
          <h2>
            {certificate.recipientNameSnapshot ?? certificate.recipientName}
          </h2>
          <p>successfully completed</p>
          <h2>{certificate.courseTitleSnapshot}</h2>
          <dl>
            <dt>Issued</dt>
            <dd>{certificate.issuedAt.toLocaleDateString()}</dd>
            <dt>Serial</dt>
            <dd>
              <code>{certificate.serialNumber}</code>
            </dd>
            <dt>Status</dt>
            <dd>{certificate.status}</dd>
          </dl>
          <p>
            Use your browser’s print command to save or print this certificate.
          </p>
        </section>
      </div>
    </main>
  );
}
