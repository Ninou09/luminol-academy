'use server';

import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  recordOfficePayment,
  voidOfficePayment,
} from '@luminol/database/office-payments';
import {
  localDateSchema,
  utcToZonedLocal,
  zonedLocalToUtc,
} from '@luminol/validation/consultations';
import { officePaymentDinarsSchema } from '@luminol/validation/office-payments';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { safeOperationsReturnPath } from '../../lib/consultation-scope';
import { requireOfficePaymentActor } from '../../lib/office-payment-actor.server';
import { runOperationsMutation } from '../../lib/operations-feedback.server';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

function returnPath(formData: FormData) {
  return safeOperationsReturnPath(
    field(formData, 'returnTo'),
    '/office-payments',
  );
}

/** Today's payments use the current instant; earlier days use local noon. */
function receivedAtFrom(formData: FormData, now: Date) {
  const date = localDateSchema.parse(field(formData, 'receivedOn'));
  return date === utcToZonedLocal(now).slice(0, 10)
    ? now
    : zonedLocalToUtc(`${date}T12:00`);
}

function revalidatePayments() {
  revalidatePath('/office-payments');
  revalidatePath('/consultations');
  revalidatePath('/crm', 'layout');
}

export async function recordOfficePaymentAction(formData: FormData) {
  const { actor } = await requireOfficePaymentActor();
  const returnTo = returnPath(formData);

  await runOperationsMutation(returnTo, async () => {
    const now = new Date();
    const amountDinars = officePaymentDinarsSchema.parse(
      Number(field(formData, 'amountDinars')),
    );
    await recordOfficePayment(db, {
      actor,
      payerName: field(formData, 'payerName') ?? null,
      clientId: field(formData, 'clientId') || null,
      appointmentId: field(formData, 'appointmentId') || null,
      purpose:
        actor.scope === 'own'
          ? 'CONSULTATION'
          : z.string().parse(field(formData, 'purpose')),
      description: z.string().parse(field(formData, 'description')),
      amountMinor: amountDinars * 100,
      method: z.string().parse(field(formData, 'method')),
      externalReference: field(formData, 'externalReference') ?? null,
      receivedAt: receivedAtFrom(formData, now),
      now,
    });
    revalidatePayments();
  });
}

export async function voidOfficePaymentAction(formData: FormData) {
  const owner = await requirePermission('office-payment:void');
  const returnTo = returnPath(formData);

  await runOperationsMutation(returnTo, async () => {
    await voidOfficePayment(db, {
      actorUserId: owner.id,
      paymentId: z
        .string()
        .trim()
        .min(1)
        .max(128)
        .parse(field(formData, 'paymentId')),
      reason: z.string().parse(field(formData, 'reason')),
    });
    revalidatePayments();
  });
}
