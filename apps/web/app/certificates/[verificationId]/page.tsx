import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  enforceCertificateVerificationLimit,
  getPublicCertificate,
} from '../../../lib/certificate.server';
import styles from './verification.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Certificate verification',
  description: 'Verify a Luminol Academy learning certificate.',
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ verificationId: string }>;
}) {
  const { verificationId } = await params;
  const requestHeaders = await headers();
  const clientAddress =
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  try {
    await enforceCertificateVerificationLimit(
      `${clientAddress}:${verificationId}`,
    );
  } catch {
    notFound();
  }
  const certificate = await getPublicCertificate(verificationId);

  if (
    !certificate ||
    !(certificate.recipientNameSnapshot ?? certificate.recipientName)
  )
    notFound();

  const valid = certificate.status === 'ACTIVE' && !certificate.revokedAt;

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.intro}>
          <p>Credential verification</p>
          <h1>{valid ? 'Certificate verified.' : 'Certificate revoked.'}</h1>
          <p>
            This record comes directly from Luminol Academy&apos;s secure
            certificate registry.
          </p>
        </section>

        <section
          className={styles.certificate}
          aria-labelledby="certificate-title"
        >
          <div className={styles.seal} aria-hidden="true">
            L
          </div>
          <div className={styles.heading}>
            <span>{certificate.issuerNameSnapshot}</span>
            <p className={valid ? styles.valid : styles.revoked}>
              {valid ? 'Valid credential' : 'Revoked credential'}
            </p>
          </div>
          <div className={styles.statement}>
            <p>This certifies that</p>
            <h2 id="certificate-title">
              {certificate.recipientNameSnapshot ?? certificate.recipientName}
            </h2>
            <p>completed the Luminol programme</p>
            <h3>{certificate.courseTitleSnapshot}</h3>
          </div>
          <dl className={styles.details}>
            <div>
              <dt>Issued</dt>
              <dd>{dateFormatter.format(certificate.issuedAt)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{valid ? 'Verified' : 'Revoked'}</dd>
            </div>
            <div>
              <dt>Serial number</dt>
              <dd>
                <code>{certificate.serialNumber}</code>
              </dd>
            </div>
          </dl>
          {!valid && (
            <p className={styles.notice}>
              This credential is no longer valid. Contact Luminol Academy for
              further information.
            </p>
          )}
        </section>

        <aside className={styles.privacy}>
          <strong>Privacy-controlled verification</strong>
          <p>
            This page is available because the certificate holder chose to make
            this credential public. It is excluded from search indexing.
          </p>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
