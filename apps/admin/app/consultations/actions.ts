'use server';

import { db } from '@luminol/database';
import {
  createConsultationAppointment,
  rescheduleConsultationAppointment,
  transitionConsultationAppointment,
  updateConsultationNote,
} from '@luminol/database/consultations';
import {
  consultationPriceDinarsSchema,
  dinarsToMinor,
  localDateSchema,
  zonedLocalToUtc,
} from '@luminol/validation/consultations';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireConsultationActor } from '../../lib/consultation-actor.server';
import { runOperationsMutation } from '../../lib/operations-feedback.server';
import { safeOperationsReturnPath } from '../../lib/consultation-scope';

const identifierSchema = z.string().trim().min(1).max(128);
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);
const durationSchema = z.coerce.number().int();
const revisionSchema = z.coerce.number().int().positive();

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

function returnPath(formData: FormData) {
  return safeOperationsReturnPath(
    field(formData, 'returnTo'),
    '/consultations',
  );
}

function startsAtFrom(formData: FormData) {
  const date = localDateSchema.parse(field(formData, 'date'));
  const time = timeSchema.parse(field(formData, 'time'));
  return zonedLocalToUtc(`${date}T${time}`);
}

function revalidateConsultations() {
  revalidatePath('/consultations');
  revalidatePath('/clients');
}

export async function createConsultationAction(formData: FormData) {
  const { actor } = await requireConsultationActor();
  const returnTo = returnPath(formData);

  await runOperationsMutation(returnTo, async () => {
    const consultantUserId =
      actor.scope === 'own'
        ? actor.userId
        : identifierSchema.parse(field(formData, 'consultantUserId'));
    const priceDinars = consultationPriceDinarsSchema.parse(
      Number(field(formData, 'priceDinars')),
    );

    await createConsultationAppointment(db, {
      actor,
      clientId: identifierSchema.parse(field(formData, 'clientId')),
      consultantUserId,
      startsAt: startsAtFrom(formData),
      durationMinutes: durationSchema.parse(field(formData, 'durationMinutes')),
      mode: z.string().parse(field(formData, 'mode')),
      initialStatus: z.string().parse(field(formData, 'initialStatus')),
      priceMinor: dinarsToMinor(priceDinars),
      operationalNote: field(formData, 'operationalNote') ?? null,
    });
    revalidateConsultations();
  });
}

export async function rescheduleConsultationAction(formData: FormData) {
  const { actor } = await requireConsultationActor();
  const returnTo = returnPath(formData);

  await runOperationsMutation(returnTo, async () => {
    await rescheduleConsultationAppointment(db, {
      actor,
      appointmentId: identifierSchema.parse(field(formData, 'appointmentId')),
      expectedRevision: revisionSchema.parse(field(formData, 'revision')),
      startsAt: startsAtFrom(formData),
      durationMinutes: durationSchema.parse(field(formData, 'durationMinutes')),
    });
    revalidateConsultations();
  });
}

export async function transitionConsultationAction(formData: FormData) {
  const { actor } = await requireConsultationActor();
  const returnTo = returnPath(formData);

  await runOperationsMutation(returnTo, async () => {
    await transitionConsultationAppointment(db, {
      actor,
      appointmentId: identifierSchema.parse(field(formData, 'appointmentId')),
      expectedRevision: revisionSchema.parse(field(formData, 'revision')),
      toStatus: z.string().parse(field(formData, 'toStatus')),
    });
    revalidateConsultations();
  });
}

export async function updateConsultationNoteAction(formData: FormData) {
  const { actor } = await requireConsultationActor();
  const returnTo = returnPath(formData);

  await runOperationsMutation(returnTo, async () => {
    await updateConsultationNote(db, {
      actor,
      appointmentId: identifierSchema.parse(field(formData, 'appointmentId')),
      expectedRevision: revisionSchema.parse(field(formData, 'revision')),
      operationalNote: field(formData, 'operationalNote') ?? null,
    });
    revalidateConsultations();
  });
}
