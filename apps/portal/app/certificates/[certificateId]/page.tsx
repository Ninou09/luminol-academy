import { AuthorizationError, requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { formatLocalizedDate, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { z } from 'zod';

import { PortalHeader } from '../../../components/portal-header';
import {
  getPortalCopy,
  getPortalStatusLabel,
} from '../../../lib/portal-localization';
import { getPortalArrow } from '../../../lib/portal-direction';
import { getPortalRequestLocale } from '../../../lib/request-locale';

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const portalCopy = getPortalCopy(locale);
  const copy = portalCopy.certificate;
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
      <PortalHeader />
      <div className="dashboard-shell">
        <Link href={localizeHref(locale, '/')}>
          {getPortalArrow(locale, 'back')} {portalCopy.shell.dashboard}
        </Link>
        <section
          className="dashboard-section"
          aria-labelledby="certificate-title"
        >
          <p className="eyebrow" dir="auto">
            {certificate.issuerNameSnapshot}
          </p>
          <h1 id="certificate-title">{copy.title}</h1>
          <p>{copy.certifies}</p>
          <h2 dir="auto">
            {certificate.recipientNameSnapshot ?? certificate.recipientName}
          </h2>
          <p>{copy.completed}</p>
          <h2 dir="auto">{certificate.courseTitleSnapshot}</h2>
          <dl>
            <dt>{copy.issued}</dt>
            <dd>
              {formatLocalizedDate(certificate.issuedAt, locale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
            <dt>{copy.serial}</dt>
            <dd>
              <code dir="ltr">{certificate.serialNumber}</code>
            </dd>
            <dt>{copy.status}</dt>
            <dd>{getPortalStatusLabel(locale, certificate.status)}</dd>
          </dl>
          <p>{copy.printHint}</p>
        </section>
      </div>
    </main>
  );
}
