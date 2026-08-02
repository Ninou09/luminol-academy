import 'server-only';
import { randomBytes } from 'node:crypto';
import { db, type Prisma } from '@luminol/database';
import {
  createSerial,
  issueCertificateSchema,
  revokeCertificateSchema,
} from './index';
export async function issueCertificate(actorUserId: string, input: unknown) {
  const parsed = issueCertificateSchema.parse(input);
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.certificate.findUnique({
      where: { completionId: parsed.completionId },
    });
    if (existing) return existing;
    const enrollment = await tx.enrollment.findFirst({
      where: {
        id: parsed.completionId,
        userId: parsed.userId,
        courseId: parsed.courseId,
        status: 'COMPLETED',
        completedAt: { not: null },
      },
      include: { user: true, course: true },
    });
    if (!enrollment?.completedAt)
      throw new Error('Verified completion is required');
    const recipientName = [enrollment.user.firstName, enrollment.user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (!recipientName) throw new Error('Recipient name is required');
    const verificationId = randomBytes(24).toString('base64url');
    const certificate = await tx.certificate.create({
      data: {
        verificationId,
        serialNumber: createSerial(enrollment.completedAt, verificationId),
        completionId: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        issuedAt: enrollment.completedAt,
        recipientName,
        recipientNameSnapshot: recipientName,
        courseTitleSnapshot: enrollment.course.title,
        snapshot: {
          recipientName,
          courseTitle: enrollment.course.title,
          issuerName: 'Luminol Academy',
          completionDate: enrollment.completedAt.toISOString(),
        },
      },
    });
    await tx.certificateAuditEvent.create({
      data: {
        certificateId: certificate.id,
        actorUserId,
        action: 'ISSUED',
        metadata: { completionId: enrollment.id },
      },
    });
    return certificate;
  });
}
export async function revokeCertificate(actorUserId: string, input: unknown) {
  const parsed = revokeCertificateSchema.parse(input);
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const certificate = await tx.certificate.findUnique({
      where: { id: parsed.certificateId },
    });
    if (!certificate) throw new Error('Certificate not found');
    if (certificate.status === 'REVOKED') return certificate;
    const revokedAt = new Date();
    const updated = await tx.certificate.update({
      where: { id: certificate.id },
      data: { status: 'REVOKED', revokedAt, publiclyVisible: false },
    });
    await tx.certificateRevocation.create({
      data: {
        certificateId: certificate.id,
        actorUserId,
        reasonCode: parsed.reasonCode,
        ...(parsed.reason ? { reason: parsed.reason } : {}),
      },
    });
    await tx.certificateAuditEvent.create({
      data: {
        certificateId: certificate.id,
        actorUserId,
        action: 'REVOKED',
        metadata: { reasonCode: parsed.reasonCode },
      },
    });
    return updated;
  });
}
export async function verifyPublicCertificate(verificationId: string) {
  const id = zVerification.parse(verificationId);
  const certificate = await db.certificate.findFirst({
    where: { verificationId: id, publiclyVisible: true },
    select: {
      verificationId: true,
      serialNumber: true,
      recipientNameSnapshot: true,
      courseTitleSnapshot: true,
      issuerNameSnapshot: true,
      issuedAt: true,
      status: true,
    },
  });
  return certificate;
}
const zVerification = (await import('zod')).z.string().min(20).max(128);
