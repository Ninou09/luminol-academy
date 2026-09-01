'use server';

import { requirePermission } from '@luminol/auth';
import {
  createContentCalendarItem,
  db,
  queueContentCalendarPublishProposal,
  transitionContentCalendarItemStatus,
  updateContentCalendarItem,
} from '@luminol/database';
import { contentCalendarLocalDateTimeSchema } from '@luminol/validation/content-calendar';
import { revalidatePath } from 'next/cache';

function requireFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== 'string') throw new Error(`Missing ${name}`);
  return value.trim();
}

function optionalFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  if (value === null) return null;
  if (typeof value !== 'string') throw new Error(`Invalid ${name}`);
  const normalized = value.trim();
  return normalized || null;
}

function requireRevision(formData: FormData) {
  const raw = requireFormString(formData, 'revision');
  if (!/^\d+$/.test(raw)) throw new Error('Invalid content calendar revision');
  const revision = Number(raw);
  if (!Number.isSafeInteger(revision) || revision < 1) {
    throw new Error('Invalid content calendar revision');
  }
  return revision;
}

function optionalScheduledUtc(formData: FormData) {
  const value = optionalFormString(formData, 'scheduledUtc');
  if (!value) return null;
  const normalized = contentCalendarLocalDateTimeSchema.parse(value);
  const date = new Date(`${normalized}:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 16) !== normalized
  ) {
    throw new Error('Invalid scheduled UTC time');
  }
  return date;
}

function contentFields(formData: FormData) {
  return {
    title: requireFormString(formData, 'title'),
    caption: requireFormString(formData, 'caption'),
    platform: requireFormString(formData, 'platform'),
    accountRef: requireFormString(formData, 'accountRef'),
    format: requireFormString(formData, 'format'),
    assetReference: optionalFormString(formData, 'assetReference'),
    scheduledFor: optionalScheduledUtc(formData),
    timezone: optionalFormString(formData, 'timezone'),
  };
}

function revalidateCalendar() {
  revalidatePath('/');
  revalidatePath('/content-calendar');
  revalidatePath('/ai-operator');
}

export async function createContentCalendarItemAction(formData: FormData) {
  const administrator = await requirePermission('academy:manage');

  await createContentCalendarItem(db, {
    actorUserId: administrator.id,
    ...contentFields(formData),
  });

  revalidateCalendar();
}

export async function updateContentCalendarItemAction(formData: FormData) {
  const administrator = await requirePermission('academy:manage');

  await updateContentCalendarItem(db, {
    itemId: requireFormString(formData, 'itemId'),
    expectedRevision: requireRevision(formData),
    actorUserId: administrator.id,
    ...contentFields(formData),
  });

  revalidateCalendar();
}

export async function transitionContentCalendarStatusAction(formData: FormData) {
  const administrator = await requirePermission('academy:manage');

  await transitionContentCalendarItemStatus(db, {
    itemId: requireFormString(formData, 'itemId'),
    expectedRevision: requireRevision(formData),
    actorUserId: administrator.id,
    toStatus: requireFormString(formData, 'toStatus'),
  });

  revalidateCalendar();
}

export async function queueContentCalendarPublishProposalAction(
  formData: FormData,
) {
  const administrator = await requirePermission('academy:manage');

  await queueContentCalendarPublishProposal(db, {
    itemId: requireFormString(formData, 'itemId'),
    expectedRevision: requireRevision(formData),
    actorUserId: administrator.id,
  });

  revalidateCalendar();
}
