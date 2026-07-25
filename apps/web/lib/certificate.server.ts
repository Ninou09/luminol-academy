import 'server-only';

import { db } from '@luminol/database';

export async function getPublicCertificate(verificationId: string) {
  return db.certificate.findFirst({
    where: { verificationId, publiclyVisible: true },
    select: {
      verificationId: true,
      recipientName: true,
      issuedAt: true,
      revokedAt: true,
      course: { select: { title: true } },
    },
  });
}
