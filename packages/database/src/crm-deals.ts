import {
  checkCrmStageMove,
  crmBookableOfferStatuses,
  crmDealInputSchema,
  crmDealReasonSchema,
  crmOfferInputSchema,
  crmOfferStatusSchema,
  crmOfferTransitions,
  crmQuickLeadPreferredContact,
  crmQuickLeadSchema,
  getCrmInitialStage,
  getCrmStage,
  type CrmSectionValue,
} from '@luminol/validation/crm-sections';
import { z } from 'zod';

import type { Prisma, PrismaClient } from '../generated/prisma/client';
import { CrmError, crmContactWhere, type CrmActor } from './crm';

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 128) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

function dinarsToMinor(dinars: number | null) {
  return dinars === null ? null : dinars * 100;
}

/** Local `YYYY-MM-DD` dates are stored as UTC midnight in DATE columns. */
function dateOnly(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

/**
 * Deals the actor may see: lead deals for the enquiry desk, contact deals
 * within the actor's contact scope. Null when the actor reaches neither.
 */
export function crmDealWhere(actor: CrmActor): Prisma.CrmDealWhereInput | null {
  const contactScope = crmContactWhere(actor);
  const reach: Prisma.CrmDealWhereInput[] = [];
  if (actor.canWorkEnquiries) {
    reach.push({ enquiryId: { not: null } });
  }
  if (contactScope) {
    reach.push({ clientId: { not: null }, client: contactScope });
  }
  if (reach.length === 0) return null;
  return reach.length === 1 ? reach[0]! : { OR: reach };
}

async function assertSubjectReach(
  tx: Prisma.TransactionClient,
  actor: CrmActor,
  subject: { enquiryId: string | null; clientId: string | null },
) {
  if (subject.enquiryId) {
    if (!actor.canWorkEnquiries) {
      throw new CrmError('forbidden', 'Your role cannot work leads');
    }
    const lead = await tx.enquiry.findUnique({
      where: { id: requireIdentifier(subject.enquiryId, 'Lead') },
      select: { id: true },
    });
    if (!lead) throw new CrmError('not-found', 'Lead was not found');
  }
  if (subject.clientId) {
    const scope = crmContactWhere(actor);
    if (!scope) {
      throw new CrmError('forbidden', 'Your role cannot work contacts');
    }
    const contact = await tx.client.findFirst({
      where: {
        id: requireIdentifier(subject.clientId, 'Contact'),
        archivedAt: null,
        ...scope,
      },
      select: { id: true },
    });
    if (!contact) throw new CrmError('not-found', 'Contact was not found');
  }
}

export interface CreateCrmOfferInput {
  actorUserId: string;
  canManageOffers: boolean;
  offer: unknown;
}

export async function createCrmOffer(
  client: PrismaClient,
  input: CreateCrmOfferInput,
) {
  if (!input.canManageOffers) {
    throw new CrmError('forbidden', 'Your role cannot manage offers');
  }
  const actorUserId = requireIdentifier(input.actorUserId, 'Actor');
  const offer = crmOfferInputSchema.parse(input.offer);

  return client.$transaction(async (tx) => {
    if (offer.trainerUserId) {
      const trainer = await tx.user.findFirst({
        where: { id: offer.trainerUserId, deletedAt: null },
        select: { id: true },
      });
      if (!trainer) throw new CrmError('not-found', 'Trainer was not found');
    }
    return tx.crmOffer.create({
      data: {
        section: offer.section,
        kind: offer.kind,
        title: offer.title,
        priceMinor: dinarsToMinor(offer.priceDinars),
        startsOn: dateOnly(offer.startsOn),
        endsOn: dateOnly(offer.endsOn),
        capacity: offer.capacity,
        trainerUserId: offer.trainerUserId,
        createdByUserId: actorUserId,
      },
    });
  });
}

export async function changeCrmOfferStatus(
  client: PrismaClient,
  input: {
    canManageOffers: boolean;
    offerId: string;
    fromStatus: string;
    toStatus: string;
  },
) {
  if (!input.canManageOffers) {
    throw new CrmError('forbidden', 'Your role cannot manage offers');
  }
  const offerId = requireIdentifier(input.offerId, 'Offer');
  const fromStatus = crmOfferStatusSchema.parse(input.fromStatus);
  const toStatus = crmOfferStatusSchema.parse(input.toStatus);
  if (!crmOfferTransitions[fromStatus].includes(toStatus)) {
    throw new CrmError(
      'stage-invalid',
      'This offer status change is not allowed',
    );
  }
  const updated = await client.crmOffer.updateMany({
    where: { id: offerId, status: fromStatus },
    data: { status: toStatus },
  });
  if (updated.count === 0) {
    throw new CrmError('conflict', 'The offer changed; reload and retry');
  }
}

export interface CreateCrmDealInput {
  actor: CrmActor;
  deal: unknown;
}

export async function createCrmDeal(
  client: PrismaClient,
  input: CreateCrmDealInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const deal = crmDealInputSchema.parse(input.deal);
  const stage = getCrmInitialStage(deal.section);

  try {
    return await client.$transaction(async (tx) => {
      await assertSubjectReach(tx, input.actor, deal);
      if (deal.offerId) {
        const offer = await tx.crmOffer.findUnique({
          where: { id: requireIdentifier(deal.offerId, 'Offer') },
          select: { section: true, status: true },
        });
        if (
          !offer ||
          offer.section !== deal.section ||
          !crmBookableOfferStatuses.includes(offer.status)
        ) {
          throw new CrmError(
            'offer-unavailable',
            'This offer is not open in this section',
          );
        }
      }
      const created = await tx.crmDeal.create({
        data: {
          section: deal.section,
          stage,
          enquiryId: deal.enquiryId,
          clientId: deal.clientId,
          offerId: deal.offerId,
          valueMinor: dinarsToMinor(deal.valueDinars),
          expectedCloseOn: dateOnly(deal.expectedCloseOn),
          ownerUserId: actorUserId,
          createdByUserId: actorUserId,
        },
      });
      await tx.crmDealEvent.create({
        data: {
          dealId: created.id,
          type: 'CREATED',
          toStage: stage,
          actorUserId,
        },
      });
      return created;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new CrmError(
        'duplicate-open',
        'This person already has an open opportunity in this section',
      );
    }
    throw error;
  }
}

export interface MoveCrmDealInput {
  actor: CrmActor;
  dealId: string;
  toStage: string;
  reason?: string | null;
  expectedRevision?: number | null;
  now?: Date;
}

export async function moveCrmDeal(
  client: PrismaClient,
  input: MoveCrmDealInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const dealId = requireIdentifier(input.dealId, 'Opportunity');
  const toStage = z.string().trim().min(2).max(32).parse(input.toStage);
  const reason = crmDealReasonSchema.parse(input.reason ?? '');
  const scope = crmDealWhere(input.actor);
  if (!scope) {
    throw new CrmError('forbidden', 'Your role cannot work opportunities');
  }
  const now = input.now ?? new Date();

  return client.$transaction(async (tx) => {
    const deal = await tx.crmDeal.findFirst({
      where: { AND: [{ id: dealId }, scope] },
      select: { id: true, section: true, stage: true, revision: true },
    });
    if (!deal) throw new CrmError('not-found', 'Opportunity was not found');
    if (
      input.expectedRevision !== undefined &&
      input.expectedRevision !== null &&
      input.expectedRevision !== deal.revision
    ) {
      throw new CrmError(
        'conflict',
        'The opportunity changed; reload and retry',
      );
    }
    const section = deal.section as CrmSectionValue;
    const violation = checkCrmStageMove({
      section,
      fromStage: deal.stage,
      toStage,
      reason,
    });
    if (violation) {
      throw new CrmError(
        violation,
        violation === 'reason-required'
          ? 'Give a short reason for closing this opportunity'
          : 'This stage change is not allowed',
      );
    }
    const target = getCrmStage(section, toStage)!;
    const updated = await tx.crmDeal.updateMany({
      where: { id: deal.id, revision: deal.revision, stage: deal.stage },
      data: {
        stage: toStage,
        state: target.state,
        closedAt: target.state === 'OPEN' ? null : now,
        lostReason: target.state === 'LOST' ? reason : null,
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) {
      throw new CrmError(
        'conflict',
        'The opportunity changed; reload and retry',
      );
    }
    await tx.crmDealEvent.create({
      data: {
        dealId: deal.id,
        type: 'STAGE_CHANGED',
        fromStage: deal.stage,
        toStage,
        reason,
        actorUserId,
        occurredAt: now,
      },
    });
    return { id: deal.id, stage: toStage, state: target.state };
  });
}

/**
 * Records a lead met in person, by phone, WhatsApp or Facebook. It is a
 * normal enquiry with its source and an explicit consent answer; nothing is
 * sent to the person.
 */
export async function createQuickCrmLead(
  client: PrismaClient,
  input: { actor: CrmActor; lead: unknown; locale?: string },
) {
  if (!input.actor.canWorkEnquiries) {
    throw new CrmError('forbidden', 'Your role cannot work leads');
  }
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const lead = crmQuickLeadSchema.parse(input.lead);
  const locale = z
    .enum(['ar', 'fr', 'en'])
    .catch('ar')
    .parse(input.locale ?? 'ar');

  return client.$transaction(async (tx) => {
    const created = await tx.enquiry.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? null,
        preferredContact: crmQuickLeadPreferredContact(lead),
        timingPreference: lead.timingPreference ?? null,
        school: lead.school,
        message: lead.note,
        locale,
        consent: lead.consent === 'yes',
        source: lead.source,
        ownerUserId: actorUserId,
      },
      select: { id: true },
    });
    await tx.enquiryOwnershipEvent.create({
      data: {
        enquiryId: created.id,
        actorUserId,
        fromOwnerUserId: null,
        toOwnerUserId: actorUserId,
      },
    });
    return created;
  });
}
