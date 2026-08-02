import 'server-only';
import { db } from '@luminol/database';
import { createHash } from 'node:crypto';
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

export async function enforceCertificateVerificationLimit(clientKey: unknown) {
  const normalized = z.string().trim().min(1).max(512).parse(clientKey);
  const key = `certificate:${createHash('sha256').update(normalized).digest('hex')}`;
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 60_000);
  const rows = await db.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "windowEnd", "updatedAt")
    VALUES (${key}, 1, ${windowEnd}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."windowEnd" <= ${now} THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "windowEnd" = CASE WHEN "RateLimitBucket"."windowEnd" <= ${now} THEN ${windowEnd} ELSE "RateLimitBucket"."windowEnd" END,
      "updatedAt" = ${now}
    RETURNING "count"
  `;
  if ((rows[0]?.count ?? 0) > 20) throw new Error('Verification unavailable');
}
