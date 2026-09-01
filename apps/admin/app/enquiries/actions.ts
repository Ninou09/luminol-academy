'use server';

import { requirePermission } from '@luminol/auth';
import {
  db,
  updateEnquiryFollowUpPlanWithAudit,
  type Prisma,
} from '@luminol/database';
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

const outcomeSchema = z.discriminatedUnion('operation', [
  z.object({
    enquiryId: enquiryIdSchema,
    operation: z.literal('save'),
    outcome: z.string().trim().min(1).max(240),
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
  const plan =
    input.operation === 'save'
      ? {
          nextFollowUpAt: parseDateOnly(input.nextFollowUpOn),
          nextAction: input.nextAction,
        }
      : null;

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    await updateEnquiryFollowUpPlanWithAudit(transaction, {
      enquiryId: input.enquiryId,
      actorUserId: administrator.id,
      plan,
    });
  });

  revalidatePath('/enquiries');
}

export async function updateEnquiryOutcome(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const operation = formData.get('operation');
  const input = outcomeSchema.parse({
    enquiryId: formData.get('enquiryId'),
    operation,
    ...(operation === 'save' ? { outcome: formData.get('outcome') } : {}),
  });
  const toOutcome = input.operation === 'save' ? input.outcome : null;
  const toOutcomeAt = input.operation === 'save' ? new Date() : null;

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const enquiry = await transaction.enquiry.findUnique({
      where: { id: input.enquiryId },
      select: { id: true, outcome: true, outcomeAt: true },
    });

    if (!enquiry) throw new Error('Enquiry not found');
    if (input.operation === 'clear' && !enquiry.outcome && !enquiry.outcomeAt) {
      return;
    }

    const updated = await transaction.enquiry.updateMany({
      where: {
        id: enquiry.id,
        outcome: enquiry.outcome,
        outcomeAt: enquiry.outcomeAt,
      },
      data: { outcome: toOutcome, outcomeAt: toOutcomeAt },
    });

    if (updated.count !== 1) {
      throw new Error('Enquiry outcome was updated by another administrator');
    }

    await transaction.enquiryOutcomeEvent.create({
      data: {
        enquiryId: enquiry.id,
        actorUserId: administrator.id,
        fromOutcome: enquiry.outcome,
        toOutcome,
        fromOutcomeAt: enquiry.outcomeAt,
        toOutcomeAt,
      },
    });
  });

  revalidatePath('/enquiries');
}
