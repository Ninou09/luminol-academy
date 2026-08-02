import 'server-only';
import { db } from '@luminol/database';
import { z } from 'zod';
const verificationIdSchema = z
  .string()
  .min(20)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);
export async function getPublicCertificate(input: unknown) {
  const verificationId = verificationIdSchema.parse(input);
  return db.certificate.findFirst({
    where: { verificationId, publiclyVisible: true },
    select: {
      verificationId: true,
      serialNumber: true,
      recipientNameSnapshot: true,
      recipientName: true,
      courseTitleSnapshot: true,
      issuerNameSnapshot: true,
      issuedAt: true,
      revokedAt: true,
      status: true,
    },
  });
}
