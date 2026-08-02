import { z } from 'zod';
export const issueCertificateSchema = z.object({
  completionId: z.string().min(1).max(128),
  userId: z.string().min(1).max(128),
  courseId: z.string().min(1).max(128),
});
export const revokeCertificateSchema = z.object({
  certificateId: z.string().min(1),
  reasonCode: z.enum(['issued_in_error', 'misconduct', 'replaced']),
  reason: z.string().trim().max(500).optional(),
});
export const replaceCertificateSchema = z.object({
  certificateId: z.string().min(1).max(128),
  requestId: z.string().trim().min(8).max(128),
  reason: z.string().trim().min(1).max(500),
});
export function createSerial(issuedAt: Date, sequence: string): string {
  return `LUM-${issuedAt.getUTCFullYear()}-${sequence
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 12)}`;
}
export function renderCertificate(input: {
  serialNumber: string;
  recipientName: string;
  courseTitle: string;
  issuerName: string;
  issuedAt: Date;
}) {
  return {
    ...input,
    issuedDate: input.issuedAt.toISOString().slice(0, 10),
  } as const;
}
