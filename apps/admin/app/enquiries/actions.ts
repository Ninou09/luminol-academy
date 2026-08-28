'use server';

import { requirePermission } from '@luminol/auth';
import { db, type Prisma } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  enquiryStatuses,
  isEnquiryTransitionAllowed,
} from '../../lib/operations';

const enquiryIdSchema = z.string().min(1).max(128);

const transitionSchema = z.object({
  enquiryId: enquiryIdSchema,
  toStatus: z.enum(enquiryStatuses),
});

const ownershipSchema = z.object({
  enquiryId: enquiryIdSchema,
  operation: z.enum(['assign-to-me', 'unassign']),
});

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const followUpPlanSchema = z.discriminatedUnion('operation', [
  z.object({
    enquiryId: enquiryIdSchema,
    operation: z.literal('save'),
    nextFollowUpOn: dateOnlySchema,
    nextAction: z.string().trim().min(1).max(240),
  }),
  z.object({
    enquiryId: enquiryIdSchema,
    operation: z.literal('clear'),
  }),
]);

function parseDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error('Invalid follow-up date');
  }
  return date;
}

export async function transitionEnquiryStatus(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const input = transitionSchema.parse({
    enquiryId: formData.get('enquiryId'),
    toStatus: formData.get('toStatus'),
  });

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const enquiry = await transaction.enquiry.findUnique({
      where: { id: input.enquiryId },
      select: { id: true, status: true },
    });

    if (!enquiry) throw new Error('Enquiry not found');
    if (!isEnquiryTransitionAllowed(enquiry.status, input.toStatus)) {
      throw new Error('Invalid enquiry status transition');
    }

    const updated = await transaction.enquiry.updateMany({
      where: { id: enquiry.id, status: enquiry.status },
      data: { status: input.toStatus },
    });

    if (updated.count !== 1) {
      throw new Error('Enquiry was updated by another administrator');
    }

    await transaction.enquiryStatusEvent.create({
      data: {
        enquiryId: enquiry.id,
        actorUserId: administrator.id,
        fromStatus: enquiry.status,
        toStatus: input.toStatus,
      },
    });
  });

  revalidatePath('/');
  revalidatePath('/enquiries');
}

export async function updateEnquiryOwnership(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const input = ownershipSchema.parse({
    enquiryId: formData.get('enquiryId'),
    operation: formData.get('operation'),
  });

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const enquiry = await transaction.enquiry.findUnique({
      where: { id: input.enquiryId },
      select: { id: true, ownerUserId: true },
    });

    if (!enquiry) throw new Error('Enquiry not found');

    const toOwnerUserId =
      input.operation === 'assign-to-me' ? administrator.id : null;

    if (enquiry.ownerUserId === toOwnerUserId) return;

    const updated = await transaction.enquiry.updateMany({
      where: { id: enquiry.id, ownerUserId: enquiry.ownerUserId },
      data: { ownerUserId: toOwnerUserId },
    });

    if (updated.count !== 1) {
      throw new Error('Enquiry ownership was updated by another administrator');
    }

    await transaction.enquiryOwnershipEvent.create({
      data: {
        enquiryId: enquiry.id,
        actorUserId: administrator.id,
        fromOwnerUserId: enquiry.ownerUserId,
        toOwnerUserId,
      },
    });
  });

  revalidatePath('/enquiries');
}

export async function updateEnquiryFollowUpPlan(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const operation = formData.get('operation');
  const input = followUpPlanSchema.parse({
    enquiryId: formData.get('enquiryId'),
    operation,
    ...(operation === 'save'
      ? {
          nextFollowUpOn: formData.get('nextFollowUpOn'),
          nextAction: formData.get('nextAction'),
        }
      : {}),
  });
  const toNextFollowUpAt =
    input.operation === 'save' ? parseDateOnly(input.nextFollowUpOn) : null;
  const toNextAction = input.operation === 'save' ? input.nextAction : null;

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const enquiry = await transaction.enquiry.findUnique({
      where: { id: input.enquiryId },
      select: { id: true, nextFollowUpAt: true, nextAction: true },
    });

    if (!enquiry) throw new Error('Enquiry not found');

    const currentDate = enquiry.nextFollowUpAt?.getTime() ?? null;
    const nextDate = toNextFollowUpAt?.getTime() ?? null;
    if (currentDate === nextDate && enquiry.nextAction === toNextAction) return;

    const updated = await transaction.enquiry.updateMany({
      where: {
        id: enquiry.id,
        nextFollowUpAt: enquiry.nextFollowUpAt,
        nextAction: enquiry.nextAction,
      },
      data: {
        nextFollowUpAt: toNextFollowUpAt,
        nextAction: toNextAction,
      },
    });

    if (updated.count !== 1) {
      throw new Error(
        'Enquiry follow-up plan was updated by another administrator',
      );
    }

    await transaction.enquiryFollowUpEvent.create({
      data: {
        enquiryId: enquiry.id,
        actorUserId: administrator.id,
        fromNextFollowUpAt: enquiry.nextFollowUpAt,
        toNextFollowUpAt,
        fromNextAction: enquiry.nextAction,
        toNextAction,
      },
    });
  });

  revalidatePath('/enquiries');
}
