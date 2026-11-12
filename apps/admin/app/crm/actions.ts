'use server';

import { db } from '@luminol/database';
import { recordCrmActivity } from '@luminol/database/crm';
import {
  localDateSchema,
  utcToZonedLocal,
  zonedLocalToUtc,
} from '@luminol/validation/consultations';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { safeOperationsReturnPath } from '../../lib/consultation-scope';
import { requireCrmActor } from '../../lib/crm-actor.server';
import { runOperationsMutation } from '../../lib/operations-feedback.server';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

/** Today's activities use the current instant; earlier days use local noon. */
function occurredAtFrom(formData: FormData, now: Date) {
  const raw = field(formData, 'occurredOn');
  if (!raw) return now;
  const date = localDateSchema.parse(raw);
  return date === utcToZonedLocal(now).slice(0, 10)
    ? now
    : zonedLocalToUtc(`${date}T12:00`);
}

export async function logCrmActivityAction(formData: FormData) {
  const { actor } = await requireCrmActor();
  const returnTo = safeOperationsReturnPath(
    field(formData, 'returnTo'),
    '/clients',
  );

  await runOperationsMutation(returnTo, async () => {
    const now = new Date();
    await recordCrmActivity(db, {
      actor,
      type: z.string().parse(field(formData, 'type')),
      direction: field(formData, 'direction') || null,
      outcome: field(formData, 'outcome') || null,
      summary: z.string().parse(field(formData, 'summary')),
      occurredAt: occurredAtFrom(formData, now),
      enquiryId: field(formData, 'enquiryId') || null,
      clientId: field(formData, 'clientId') || null,
      now,
    });
    revalidatePath('/crm', 'layout');
  });
}
