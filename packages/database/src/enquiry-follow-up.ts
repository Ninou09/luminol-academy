import type { Prisma } from '../generated/prisma/client';

export type EnquiryFollowUpPlan =
  | {
      nextFollowUpAt: Date;
      nextAction: string;
    }
  | null;

export type UpdateEnquiryFollowUpPlanInput = {
  enquiryId: string;
  actorUserId: string;
  plan: EnquiryFollowUpPlan;
};

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 255) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function normalizePlan(plan: EnquiryFollowUpPlan): EnquiryFollowUpPlan {
  if (!plan) return null;
  if (!Number.isFinite(plan.nextFollowUpAt.getTime())) {
    throw new Error('Enquiry follow-up date is invalid');
  }
  const nextAction = plan.nextAction.trim();
  if (!nextAction || nextAction.length > 240) {
    throw new Error('Enquiry follow-up action is invalid');
  }
  return { nextFollowUpAt: plan.nextFollowUpAt, nextAction };
}

export async function updateEnquiryFollowUpPlanWithAudit(
  transaction: Prisma.TransactionClient,
  input: UpdateEnquiryFollowUpPlanInput,
) {
  const enquiryId = requireIdentifier(input.enquiryId, 'Enquiry ID');
  const actorUserId = requireIdentifier(input.actorUserId, 'Enquiry follow-up actor');
  const plan = normalizePlan(input.plan);
  const toNextFollowUpAt = plan?.nextFollowUpAt ?? null;
  const toNextAction = plan?.nextAction ?? null;

  const enquiry = await transaction.enquiry.findUnique({
    where: { id: enquiryId },
    select: { id: true, nextFollowUpAt: true, nextAction: true },
  });

  if (!enquiry) throw new Error('Enquiry not found');

  const currentDate = enquiry.nextFollowUpAt?.getTime() ?? null;
  const nextDate = toNextFollowUpAt?.getTime() ?? null;
  if (currentDate === nextDate && enquiry.nextAction === toNextAction) {
    return { changed: false } as const;
  }

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
      actorUserId,
      fromNextFollowUpAt: enquiry.nextFollowUpAt,
      toNextFollowUpAt,
      fromNextAction: enquiry.nextAction,
      toNextAction,
    },
  });

  return { changed: true } as const;
}
