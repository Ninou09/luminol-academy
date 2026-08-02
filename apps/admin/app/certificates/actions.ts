'use server';
import { requirePermission } from '@luminol/auth';
import {
  issueCertificate,
  revokeCertificate,
} from '@luminol/certificates/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
const issueFormSchema = z.object({
  completionId: z.string().min(1),
  userId: z.string().min(1),
  courseId: z.string().min(1),
});
export async function issueCertificateAction(formData: FormData) {
  const actor = await requirePermission('certificate:issue');
  const input = issueFormSchema.parse({
    completionId: formData.get('completionId'),
    userId: formData.get('userId'),
    courseId: formData.get('courseId'),
  });
  await issueCertificate(actor.id, input);
  revalidatePath('/certificates');
}
const revokeFormSchema = z.object({
  certificateId: z.string().min(1),
  reasonCode: z.enum(['issued_in_error', 'misconduct', 'replaced']),
});
export async function revokeCertificateAction(formData: FormData) {
  const actor = await requirePermission('certificate:revoke');
  const input = revokeFormSchema.parse({
    certificateId: formData.get('certificateId'),
    reasonCode: formData.get('reasonCode'),
  });
  await revokeCertificate(actor.id, input);
  revalidatePath('/certificates');
}
