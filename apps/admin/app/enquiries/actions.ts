'use server';

import { requirePermission } from '@luminol/auth';
import { db, type Prisma } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  enquiryStatuses,
  isEnquiryTransitionAllowed,
} from '../../lib/operations';

const transitionSchema = z.object({
  enquiryId: z.string().min(1).max(128),
  toStatus: z.enum(enquiryStatuses),
});

const ownershipSchema = z.object({
  enquiryId: z.string().min(1).max(128),
  operation: z.enum(['assign-to-me', 'unassign']),
});

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
