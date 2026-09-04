'use server';

import { requirePermission } from '@luminol/auth';
import {
  createMetaInstagramReelsProviderFromEnv,
  db,
} from '@luminol/database';
import {
  executeSocialPublishingAttempt,
  planSocialPublishingAttempt,
} from '@luminol/database/social-publishing-attempts';
import {
  createSocialPublishingAccount,
  setSocialPublishingAccountActive,
} from '@luminol/database/social-publishing-delivery';
import { revalidatePath } from 'next/cache';

function requireFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== 'string') throw new Error(`Missing ${name}`);
  const normalized = value.trim();
  if (!normalized) throw new Error(`Missing ${name}`);
  return normalized;
}

function requireBoolean(formData: FormData, name: string) {
  const value = requireFormString(formData, name);
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Invalid ${name}`);
}

function revalidateSocialPublishing() {
  revalidatePath('/social-publishing');
  revalidatePath('/content-calendar');
  revalidatePath('/ai-operator');
}

export async function createSocialPublishingAccountAction(formData: FormData) {
  const administrator = await requirePermission('academy:manage');

  await createSocialPublishingAccount(db, {
    actorUserId: administrator.id,
    accountRef: requireFormString(formData, 'accountRef'),
    platform: requireFormString(formData, 'platform'),
    displayName: requireFormString(formData, 'displayName'),
    externalAccountId: requireFormString(formData, 'externalAccountId'),
  });

  revalidateSocialPublishing();
}

export async function setSocialPublishingAccountActiveAction(
  formData: FormData,
) {
  const administrator = await requirePermission('academy:manage');

  await setSocialPublishingAccountActive(db, {
    accountId: requireFormString(formData, 'accountId'),
    expectedActive: requireBoolean(formData, 'expectedActive'),
    active: requireBoolean(formData, 'active'),
    actorUserId: administrator.id,
  });

  revalidateSocialPublishing();
}

export async function planSocialPublishingAttemptAction(formData: FormData) {
  const administrator = await requirePermission('academy:manage');

  await planSocialPublishingAttempt(db, {
    proposalId: requireFormString(formData, 'proposalId'),
    actorUserId: administrator.id,
  });

  revalidateSocialPublishing();
}

export async function executeMetaSocialPublishingAttemptAction(
  formData: FormData,
) {
  const administrator = await requirePermission('academy:manage');
  const provider = createMetaInstagramReelsProviderFromEnv();

  await executeSocialPublishingAttempt(db, {
    attemptId: requireFormString(formData, 'attemptId'),
    actorUserId: administrator.id,
    provider,
  });

  revalidateSocialPublishing();
}
