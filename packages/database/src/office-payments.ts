import { getZonedParts } from '@luminol/validation/consultations';
import {
  formatOfficeReceiptNumber,
  officePaymentDescriptionSchema,
  officePaymentMethodSchema,
  officePaymentNeedsReference,
  officePaymentPayerSchema,
  officePaymentPurposeSchema,
  officePaymentReferenceSchema,
  officePaymentVoidReasonSchema,
} from '@luminol/validation/office-payments';

import {
  OfficePaymentEventType,
  OfficePaymentStatus,
  type Prisma,
  type PrismaClient,
} from '../generated/prisma/client';

/** `all` = owner ledger; `own` = consultant recording for own appointments. */
export type OfficePaymentActor = {
  userId: string;
  scope: 'all' | 'own';
};

export type OfficePaymentErrorCode =
  | 'not-found'
  | 'forbidden'
  | 'reference-required'
  | 'received-at'
  | 'already-voided'
  | 'mismatch';

export class OfficePaymentError extends Error {
  constructor(
    readonly code: OfficePaymentErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'OfficePaymentError';
  }
}

const MAX_BACKDATE_MS = 366 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 128) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function requireAmountMinor(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > 1_000_000_000) {
    throw new Error('Payment amount is invalid');
  }
  return value;
}

export function officePaymentScopeWhere(
  actor: OfficePaymentActor,
): Prisma.OfficePaymentWhereInput {
  if (actor.scope === 'all') return {};
  return {
    OR: [
      { recordedByUserId: actor.userId },
      { appointment: { consultantUserId: actor.userId } },
    ],
  };
}

export interface RecordOfficePaymentInput {
  actor: OfficePaymentActor;
  /** Defaults to the appointment client's name when omitted. */
  payerName?: string | null;
  clientId?: string | null;
  appointmentId?: string | null;
  purpose: string;
  description: string;
  amountMinor: number;
  method: string;
  externalReference?: string | null;
  receivedAt: Date;
  now?: Date;
}

export async function recordOfficePayment(
  client: PrismaClient,
  input: RecordOfficePaymentInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const now = input.now ?? new Date();
  const receivedAt = new Date(input.receivedAt.getTime());
  if (
    !Number.isFinite(receivedAt.getTime()) ||
    receivedAt.getTime() > now.getTime() + MAX_FUTURE_SKEW_MS ||
    receivedAt.getTime() < now.getTime() - MAX_BACKDATE_MS
  ) {
    throw new OfficePaymentError(
      'received-at',
      'Payment date must be within the last year and not in the future',
    );
  }

  const method = officePaymentMethodSchema.parse(input.method);
  const purpose = officePaymentPurposeSchema.parse(input.purpose);
  const externalReference = officePaymentReferenceSchema.parse(
    input.externalReference ?? '',
  );
  if (officePaymentNeedsReference(method) && !externalReference) {
    throw new OfficePaymentError(
      'reference-required',
      'Electronic payments need a transfer reference',
    );
  }
  const providedPayer = input.payerName?.trim() || null;
  const fields = {
    description: officePaymentDescriptionSchema.parse(input.description),
    amountMinor: requireAmountMinor(input.amountMinor),
  };
  const appointmentId = input.appointmentId?.trim() || null;
  let clientId = input.clientId?.trim() || null;

  if (input.actor.scope === 'own') {
    if (!appointmentId || purpose !== 'CONSULTATION') {
      throw new OfficePaymentError(
        'forbidden',
        'Consultants record payments only for their own consultations',
      );
    }
  }

  return client.$transaction(async (tx) => {
    let payerFallback: string | null = null;
    if (appointmentId) {
      const appointment = await tx.consultationAppointment.findFirst({
        where: {
          id: appointmentId,
          ...(input.actor.scope === 'own'
            ? { consultantUserId: actorUserId }
            : {}),
        },
        select: { clientId: true, client: { select: { displayName: true } } },
      });
      if (!appointment) {
        throw new OfficePaymentError('not-found', 'Appointment was not found');
      }
      if (clientId && clientId !== appointment.clientId) {
        throw new OfficePaymentError(
          'mismatch',
          'Client does not match the appointment',
        );
      }
      clientId = appointment.clientId;
      payerFallback = appointment.client.displayName;
    } else if (clientId) {
      const record = await tx.client.findUnique({
        where: { id: clientId },
        select: { id: true },
      });
      if (!record) {
        throw new OfficePaymentError('not-found', 'Client was not found');
      }
    }

    const payerName = officePaymentPayerSchema.parse(
      providedPayer ?? payerFallback ?? '',
    );

    const [sequence] = await tx.$queryRaw<{ value: bigint }[]>`
  SELECT nextval('"OfficePaymentReceiptSequence"') AS "value"
`;
    if (!sequence) throw new Error('Receipt sequence is unavailable');
    const receiptNumber = formatOfficeReceiptNumber(
      getZonedParts(receivedAt).year,
      Number(sequence.value),
    );

    const payment = await tx.officePayment.create({
      data: {
        ...fields,
        payerName,
        receiptNumber,
        clientId,
        appointmentId,
        purpose,
        method,
        externalReference,
        receivedAt,
        recordedByUserId: actorUserId,
      },
    });
    await tx.officePaymentEvent.create({
      data: {
        paymentId: payment.id,
        eventType: OfficePaymentEventType.RECORDED,
        actorUserId,
      },
    });
    return payment;
  });
}

export interface VoidOfficePaymentInput {
  actorUserId: string;
  paymentId: string;
  reason: string;
  now?: Date;
}

/** Voids a recorded payment. Authorization (`office-payment:void`) is
 * enforced by the caller; the database permits exactly one void. */
export async function voidOfficePayment(
  client: PrismaClient,
  input: VoidOfficePaymentInput,
) {
  const actorUserId = requireIdentifier(input.actorUserId, 'Actor');
  const paymentId = requireIdentifier(input.paymentId, 'Payment');
  const reason = officePaymentVoidReasonSchema.parse(input.reason);
  const now = input.now ?? new Date();

  return client.$transaction(async (tx) => {
    const payment = await tx.officePayment.findUnique({
      where: { id: paymentId },
      select: { status: true },
    });
    if (!payment) {
      throw new OfficePaymentError('not-found', 'Payment was not found');
    }
    if (payment.status !== OfficePaymentStatus.RECORDED) {
      throw new OfficePaymentError(
        'already-voided',
        'This payment is already voided',
      );
    }
    const voided = await tx.officePayment.update({
      where: { id: paymentId },
      data: {
        status: OfficePaymentStatus.VOIDED,
        voidedByUserId: actorUserId,
        voidedAt: now,
        voidReason: reason,
      },
    });
    await tx.officePaymentEvent.create({
      data: {
        paymentId,
        eventType: OfficePaymentEventType.VOIDED,
        actorUserId,
        reason,
      },
    });
    return voided;
  });
}
