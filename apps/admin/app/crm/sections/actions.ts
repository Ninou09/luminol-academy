'use server';

import { db } from '@luminol/database';
import { CrmError } from '@luminol/database/crm';
import {
  changeCrmOfferStatus,
  createCrmDeal,
  createCrmOffer,
  createQuickCrmLead,
  moveCrmDeal,
} from '@luminol/database/crm-deals';
import { localizeHref } from '@luminol/localization';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z, ZodError } from 'zod';

import { safeOperationsReturnPath } from '../../../lib/consultation-scope';
import { requireCrmActor } from '../../../lib/crm-actor.server';
import { runOperationsMutation } from '../../../lib/operations-feedback.server';
import { getAdminRequestLocale } from '../../../lib/request-locale';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

function fields(formData: FormData, names: readonly string[]) {
  return Object.fromEntries(
    names.map((name) => [name, field(formData, name) ?? '']),
  );
}

export async function createCrmOfferAction(formData: FormData) {
  const { user, can } = await requireCrmActor();
  const returnTo = safeOperationsReturnPath(
    field(formData, 'returnTo'),
    '/clients',
  );

  await runOperationsMutation(returnTo, async () => {
    await createCrmOffer(db, {
      actorUserId: user.id,
      canManageOffers: can('offer:manage'),
      offer: fields(formData, [
        'section',
        'kind',
        'title',
        'priceDinars',
        'startsOn',
        'endsOn',
        'capacity',
        'trainerUserId',
      ]),
    });
    revalidatePath('/crm', 'layout');
  });
}

export async function changeCrmOfferStatusAction(formData: FormData) {
  const { can } = await requireCrmActor();
  const returnTo = safeOperationsReturnPath(
    field(formData, 'returnTo'),
    '/clients',
  );

  await runOperationsMutation(returnTo, async () => {
    await changeCrmOfferStatus(db, {
      canManageOffers: can('offer:manage'),
      offerId: z.string().parse(field(formData, 'offerId')),
      fromStatus: z.string().parse(field(formData, 'fromStatus')),
      toStatus: z.string().parse(field(formData, 'toStatus')),
    });
    revalidatePath('/crm', 'layout');
  });
}

export async function createCrmDealAction(formData: FormData) {
  const { actor } = await requireCrmActor();
  const returnTo = safeOperationsReturnPath(
    field(formData, 'returnTo'),
    '/clients',
  );

  await runOperationsMutation(returnTo, async () => {
    await createCrmDeal(db, {
      actor,
      deal: fields(formData, [
        'section',
        'enquiryId',
        'clientId',
        'offerId',
        'valueDinars',
        'expectedCloseOn',
      ]),
    });
    revalidatePath('/crm', 'layout');
  });
}

export type MoveCrmDealResult = { ok: true } | { ok: false; code: string };

/** Board move: stage rules, scope, revision and history are enforced below. */
export async function moveCrmDealAction(input: {
  dealId: string;
  toStage: string;
  reason?: string;
  revision: number;
}): Promise<MoveCrmDealResult> {
  const parsed = z
    .object({
      dealId: z.string().trim().min(1).max(128),
      toStage: z.string().trim().min(2).max(32),
      reason: z.string().max(240).optional(),
      revision: z.number().int().min(1),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, code: 'invalid' };

  const { actor } = await requireCrmActor();
  try {
    await moveCrmDeal(db, {
      actor,
      dealId: parsed.data.dealId,
      toStage: parsed.data.toStage,
      reason: parsed.data.reason ?? null,
      expectedRevision: parsed.data.revision,
    });
  } catch (error) {
    if (error instanceof CrmError) return { ok: false, code: error.code };
    if (error instanceof ZodError) return { ok: false, code: 'invalid' };
    throw error;
  }
  revalidatePath('/crm', 'layout');
  return { ok: true };
}

export async function quickAddLeadAction(formData: FormData) {
  const { actor } = await requireCrmActor();
  const locale = await getAdminRequestLocale();
  let leadId: string;
  try {
    const created = await createQuickCrmLead(db, {
      actor,
      locale,
      lead: fields(formData, [
        'name',
        'phone',
        'email',
        'source',
        'school',
        'timingPreference',
        'note',
        'consent',
      ]),
    });
    leadId = created.id;
  } catch (error) {
    const code =
      error instanceof CrmError
        ? error.code
        : error instanceof ZodError
          ? 'invalid'
          : null;
    if (!code) throw error;
    redirect(`${localizeHref(locale, '/crm/leads/new')}?error=${code}`);
  }
  revalidatePath('/crm', 'layout');
  redirect(`${localizeHref(locale, `/crm/leads/${leadId}`)}?saved=1`);
}
