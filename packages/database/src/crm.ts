import {
  checkCrmActivity,
  crmActivityDirectionSchema,
  crmActivityHasDirection,
  crmActivityOutcomeSchema,
  crmActivitySummarySchema,
  crmActivityTypeSchema,
} from '@luminol/validation/crm-activities';

import type { Prisma, PrismaClient } from '../generated/prisma/client';
import { clientScopeWhere } from './consultations';
import { officePaymentScopeWhere } from './office-payments';

/**
 * CRM reach resolved from persisted permissions by the caller:
 * enquiry desk (`enquiry:work`), consultation contacts (`consultation:*`)
 * and office payments (`office-payment:*`).
 */
export type CrmActor = {
  userId: string;
  canWorkEnquiries: boolean;
  consultationScope: 'all' | 'own' | null;
  paymentScope: 'all' | 'own' | null;
};

export type CrmErrorCode =
  | 'not-found'
  | 'forbidden'
  | 'consent-required'
  | 'direction-required'
  | 'occurred-at'
  | 'stage-invalid'
  | 'stage-closed'
  | 'reason-required'
  | 'offer-unavailable'
  | 'duplicate-open'
  | 'conflict';

export class CrmError extends Error {
  constructor(
    readonly code: CrmErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CrmError';
  }
}

const MAX_BACKDATE_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 128) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

/** Contacts (clients) the actor may open. */
export function crmContactWhere(
  actor: CrmActor,
): Prisma.ClientWhereInput | null {
  if (!actor.consultationScope) return null;
  return clientScopeWhere({
    userId: actor.userId,
    scope: actor.consultationScope,
  });
}

export interface RecordCrmActivityInput {
  actor: CrmActor;
  type: string;
  direction?: string | null;
  outcome?: string | null;
  summary: string;
  occurredAt?: Date | null;
  enquiryId?: string | null;
  clientId?: string | null;
  now?: Date;
}

export async function recordCrmActivity(
  client: PrismaClient,
  input: RecordCrmActivityInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const now = input.now ?? new Date();
  const occurredAt = new Date((input.occurredAt ?? now).getTime());
  if (
    !Number.isFinite(occurredAt.getTime()) ||
    occurredAt.getTime() > now.getTime() + MAX_FUTURE_SKEW_MS ||
    occurredAt.getTime() < now.getTime() - MAX_BACKDATE_MS
  ) {
    throw new CrmError(
      'occurred-at',
      'Activities must be logged within the last 90 days and not in the future',
    );
  }

  const type = crmActivityTypeSchema.parse(input.type);
  const direction =
    crmActivityHasDirection(type) && input.direction
      ? crmActivityDirectionSchema.parse(input.direction)
      : null;
  const outcome =
    crmActivityHasDirection(type) && input.outcome
      ? crmActivityOutcomeSchema.parse(input.outcome)
      : null;
  const summary = crmActivitySummarySchema.parse(input.summary);
  const enquiryId = input.enquiryId?.trim() || null;
  const clientId = input.clientId?.trim() || null;
  if (Boolean(enquiryId) === Boolean(clientId)) {
    throw new Error('An activity belongs to exactly one lead or contact');
  }

  return client.$transaction(async (tx) => {
    let contactConsent: boolean;

    if (enquiryId) {
      if (!input.actor.canWorkEnquiries) {
        throw new CrmError('forbidden', 'Your role cannot work leads');
      }
      const enquiry = await tx.enquiry.findUnique({
        where: { id: requireIdentifier(enquiryId, 'Lead') },
        select: { consent: true },
      });
      if (!enquiry) throw new CrmError('not-found', 'Lead was not found');
      contactConsent = enquiry.consent;
    } else {
      const scope = crmContactWhere(input.actor);
      if (!scope) {
        throw new CrmError('forbidden', 'Your role cannot work contacts');
      }
      const contact = await tx.client.findFirst({
        where: { id: requireIdentifier(clientId!, 'Contact'), ...scope },
        select: { contactConsent: true },
      });
      if (!contact) throw new CrmError('not-found', 'Contact was not found');
      contactConsent = contact.contactConsent;
    }

    const violation = checkCrmActivity({ type, direction, contactConsent });
    if (violation) {
      throw new CrmError(
        violation,
        violation === 'consent-required'
          ? 'This person has not agreed to be contacted'
          : 'Choose whether the conversation was inbound or outbound',
      );
    }

    return tx.crmActivity.create({
      data: {
        type,
        direction,
        outcome,
        summary,
        occurredAt,
        enquiryId,
        clientId,
        actorUserId,
      },
    });
  });
}

export type CrmSearchResults = {
  query: string;
  leads: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    school: string;
    createdAt: Date;
  }[];
  contacts: {
    id: string;
    displayName: string;
    phone: string | null;
    email: string | null;
  }[];
  receipts: {
    id: string;
    receiptNumber: string;
    payerName: string;
    amountMinor: number;
    status: string;
    receivedAt: Date;
  }[];
};

/** Finds leads, contacts and receipts the actor may see. */
export async function searchCrmRecords(
  client: PrismaClient,
  actor: CrmActor,
  rawQuery: string,
  limit = 10,
): Promise<CrmSearchResults> {
  const query = rawQuery.trim().slice(0, 80);
  const empty: CrmSearchResults = {
    query,
    leads: [],
    contacts: [],
    receipts: [],
  };
  if (query.length < 2) return empty;
  const contactScope = crmContactWhere(actor);
  const take = Math.min(Math.max(limit, 1), 25);

  const [leads, contacts, receipts] = await Promise.all([
    actor.canWorkEnquiries
      ? client.enquiry.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            school: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
    contactScope
      ? client.client.findMany({
          where: {
            archivedAt: null,
            AND: [
              contactScope,
              {
                OR: [
                  { displayName: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                  { phone: { contains: query } },
                ],
              },
            ],
          },
          orderBy: { updatedAt: 'desc' },
          take,
          select: { id: true, displayName: true, phone: true, email: true },
        })
      : Promise.resolve([]),
    actor.paymentScope
      ? client.officePayment.findMany({
          where: {
            AND: [
              officePaymentScopeWhere({
                userId: actor.userId,
                scope: actor.paymentScope,
              }),
              {
                OR: [
                  {
                    receiptNumber: { contains: query, mode: 'insensitive' },
                  },
                  { payerName: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          orderBy: { receivedAt: 'desc' },
          take,
          select: {
            id: true,
            receiptNumber: true,
            payerName: true,
            amountMinor: true,
            status: true,
            receivedAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  return { query, leads, contacts, receipts };
}
