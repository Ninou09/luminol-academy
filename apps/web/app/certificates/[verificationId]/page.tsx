import { formatLocalizedDate } from '@luminol/localization';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import {
  enforceCertificateVerificationLimit,
  getPublicCertificate,
} from '../../../lib/certificate.server';
import { getPublicCopy } from '../../../lib/public-localization';
import { getRequestLocale } from '../../../lib/request-locale';
import styles from './verification.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).certificate;

  return {
    title: copy.title,
    description: copy.description,
    robots: { index: false, follow: false },
  };
}

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ verificationId: string }>;
}) {
  const { verificationId } = await params;
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale).certificate;
  const requestHeaders = await headers();
  const clientAddress =
    process.env.VERCEL === '1'
      ? (requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        'unknown')
      : 'untrusted-proxy';

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
  ) {
    notFound();
  }

  const valid = certificate.status === 'ACTIVE' && !certificate.revokedAt;

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.intro}>
          <p>{copy.eyebrow}</p>
          <h1>{valid ? copy.verifiedTitle : copy.revokedTitle}</h1>
          <p>{copy.registryBody}</p>
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
              {valid ? copy.validCredential : copy.revokedCredential}
            </p>
          </div>
          <div className={styles.statement}>
            <p>{copy.certifies}</p>
            <h2 id="certificate-title">
              {certificate.recipientNameSnapshot ?? certificate.recipientName}
            </h2>
            <p>{copy.completed}</p>
            <h3 dir="auto">{certificate.courseTitleSnapshot}</h3>
          </div>
          <dl className={styles.details}>
            <div>
              <dt>{copy.issued}</dt>
              <dd>
                {formatLocalizedDate(certificate.issuedAt, locale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt>{copy.status}</dt>
              <dd>{valid ? copy.verified : copy.revoked}</dd>
            </div>
            <div>
              <dt>{copy.serial}</dt>
              <dd>
                <code>{certificate.serialNumber}</code>
              </dd>
            </div>
          </dl>
          {!valid && <p className={styles.notice}>{copy.revokedNotice}</p>}
        </section>

        <aside className={styles.privacy}>
          <strong>{copy.privacyTitle}</strong>
          <p>{copy.privacyBody}</p>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
