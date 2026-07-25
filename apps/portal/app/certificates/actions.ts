'use server';

import { AuthorizationError, requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createCertificateRecipientName } from '../../lib/certificate';

const visibilitySchema = z.object({
  certificateId: z.string().min(1).max(128),
  visibility: z.enum(['public', 'private']),
});

export async function setCertificateVisibility(formData: FormData) {
  const user = await requireUser();
  const input = visibilitySchema.parse({
    certificateId: formData.get('certificateId'),
    visibility: formData.get('visibility'),
  });
  const certificate = await db.certificate.findFirst({
    where: { id: input.certificateId, userId: user.id },
    select: { id: true, revokedAt: true },
  });

  if (!certificate) throw new AuthorizationError();

  if (input.visibility === 'public') {
    if (certificate.revokedAt) throw new AuthorizationError();

    const recipientName = createCertificateRecipientName(
      user.firstName,
      user.lastName,
    );
    if (!recipientName) {
      throw new Error(
        'Add your name to your account before publishing a certificate.',
      );
    }

    await db.certificate.updateMany({
      where: {
        id: certificate.id,
        userId: user.id,
        revokedAt: null,
      },
      data: { publiclyVisible: true, recipientName },
    });
  } else {
    await db.certificate.updateMany({
      where: { id: certificate.id, userId: user.id },
      data: { publiclyVisible: false },
    });
  }

  revalidatePath('/');
}
