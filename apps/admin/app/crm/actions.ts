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
import { transitionEnquiryStatus } from '../enquiries/actions';

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

export type MoveLeadStageResult = { ok: true } | { ok: false };

/**
 * Moves a lead between pipeline stages through the governed enquiry
 * transition (permission, allowed-transition and audit checks included).
 */
export async function moveLeadStageAction(input: {
  enquiryId: string;
  toStatus: string;
}): Promise<MoveLeadStageResult> {
  const parsed = z
    .object({
      enquiryId: z.string().trim().min(1).max(128),
      toStatus: z.string().trim().min(1).max(32),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false };

  const formData = new FormData();
  formData.set('enquiryId', parsed.data.enquiryId);
  formData.set('toStatus', parsed.data.toStatus);
  try {
    await transitionEnquiryStatus(formData);
  } catch {
    return { ok: false };
  }
  revalidatePath('/crm', 'layout');
  return { ok: true };
}
