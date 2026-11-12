'use server';

import { db } from '@luminol/database';
import {
  createClientRecord,
  updateClientRecord,
} from '@luminol/database/consultations';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireConsultationActor } from '../../lib/consultation-actor.server';
import { runOperationsMutation } from '../../lib/operations-feedback.server';
import { safeOperationsReturnPath } from '../../lib/consultation-scope';

const identifierSchema = z.string().trim().min(1).max(128);

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

function clientFields(formData: FormData) {
  return {
    displayName: z.string().parse(field(formData, 'displayName')),
    phone: field(formData, 'phone') ?? null,
    email: field(formData, 'email') ?? null,
    preferredLocale: field(formData, 'preferredLocale') ?? 'ar',
    contactConsent: formData.get('contactConsent') === 'on',
    operationalNote: field(formData, 'operationalNote') ?? null,
  };
}

function revalidateClients() {
  revalidatePath('/clients');
  revalidatePath('/consultations');
}

export async function createClientAction(formData: FormData) {
  const { actor } = await requireConsultationActor();
  const returnTo = safeOperationsReturnPath(
    field(formData, 'returnTo'),
    '/clients',
  );

  await runOperationsMutation(returnTo, async () => {
    const sourceEnquiryId = field(formData, 'sourceEnquiryId')?.trim();
    await createClientRecord(db, {
      actor,
      ...clientFields(formData),
      sourceEnquiryId: sourceEnquiryId
        ? identifierSchema.parse(sourceEnquiryId)
        : null,
    });
    revalidateClients();
  });
}

export async function updateClientAction(formData: FormData) {
  const { actor } = await requireConsultationActor();
  const returnTo = safeOperationsReturnPath(
    field(formData, 'returnTo'),
    '/clients',
  );

  await runOperationsMutation(returnTo, async () => {
    await updateClientRecord(db, {
      actor,
      clientId: identifierSchema.parse(field(formData, 'clientId')),
      ...clientFields(formData),
      archive: formData.get('archive') === 'on',
    });
    revalidateClients();
  });
}
