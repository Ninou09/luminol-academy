import {
  checkConsultationSlot,
  clientDisplayNameSchema,
  clientEmailSchema,
  clientLocaleSchema,
  clientPhoneSchema,
  consultationBlockingStatuses,
  consultationEndsAt,
  consultationInitialStatusSchema,
  consultationModeSchema,
  consultationOutcomeStatuses,
  consultationStatusSchema,
  isConsultationTransitionAllowed,
  operationalNoteSchema,
  type ConsultationSlotViolation,
} from '@luminol/validation/consultations';

import {
  ConsultationEventType,
  type ConsultationAppointment,
  type Prisma,
  type PrismaClient,
} from '../generated/prisma/client';

export const CONSULTANT_ROLE_KEY = 'consultant';
const CONSULTATION_LOCK_NAMESPACE = 2101;

/**
 * Who is acting and how far they reach. `all` is the owner workspace
 * (`consultation:manage`); `own` is a consultant limited to appointments they
 * deliver and the clients attached to them (`consultation:deliver`).
 */
export type ConsultationActor = {
  userId: string;
  scope: 'all' | 'own';
};

export type ConsultationErrorCode =
  | 'not-found'
  | 'forbidden'
  | 'ineligible-consultant'
  | 'stale'
  | 'transition'
  | 'not-started'
  | 'overlap'
  | 'already-converted'
  | ConsultationSlotViolation;

export class ConsultationError extends Error {
  constructor(
    readonly code: ConsultationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ConsultationError';
  }
}

type Transaction = Prisma.TransactionClient;

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 128) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function requireRevision(value: number) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error('Consultation revision is invalid');
  }
  return value;
}

function requireValidDate(value: Date, label: string) {
  if (!Number.isFinite(value.getTime())) throw new Error(`${label} is invalid`);
  return new Date(value.getTime());
}

function requirePriceMinor(value: number) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 100_000_000) {
    throw new Error('Consultation price is invalid');
  }
  return value;
}

function optionalString<T>(
  value: string | null | undefined,
  parse: (input: string) => T,
): T | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? parse(trimmed) : null;
}

/** Prisma filter for clients a consultant may see. */
export function clientScopeWhere(
  actor: ConsultationActor,
): Prisma.ClientWhereInput {
  if (actor.scope === 'all') return {};
  return {
    OR: [
      { createdByUserId: actor.userId },
      { appointments: { some: { consultantUserId: actor.userId } } },
    ],
  };
}

/** Prisma filter for appointments the actor may see. */
export function appointmentScopeWhere(
  actor: ConsultationActor,
): Prisma.ConsultationAppointmentWhereInput {
  return actor.scope === 'all' ? {} : { consultantUserId: actor.userId };
}

export function listEligibleConsultants(client: PrismaClient) {
  return client.user.findMany({
    where: {
      deletedAt: null,
      roles: { some: { role: { key: CONSULTANT_ROLE_KEY } } },
    },
    orderBy: { email: 'asc' },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
}

async function requireEligibleConsultant(tx: Transaction, userId: string) {
  const consultant = await tx.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      roles: { some: { role: { key: CONSULTANT_ROLE_KEY } } },
    },
    select: { id: true },
  });
  if (!consultant) {
    throw new ConsultationError(
      'ineligible-consultant',
      'Appointments can only be assigned to an active consultant',
    );
  }
}

async function requireAccessibleClient(
  tx: Transaction,
  actor: ConsultationActor,
  clientId: string,
) {
  const record = await tx.client.findFirst({
    where: { id: clientId, archivedAt: null, ...clientScopeWhere(actor) },
    select: { id: true },
  });
  if (!record) {
    throw new ConsultationError('not-found', 'Client was not found');
  }
}

async function requireAccessibleAppointment(
  tx: Transaction,
  actor: ConsultationActor,
  appointmentId: string,
  expectedRevision: number,
) {
  const appointment = await tx.consultationAppointment.findFirst({
    where: { id: appointmentId, ...appointmentScopeWhere(actor) },
  });
  if (!appointment) {
    throw new ConsultationError('not-found', 'Appointment was not found');
  }
  if (appointment.revision !== expectedRevision) {
    throw new ConsultationError(
      'stale',
      'Appointment changed since it was loaded; reload and try again',
    );
  }
  return appointment;
}

function assertSlot(startsAt: Date, durationMinutes: number) {
  const violation = checkConsultationSlot(startsAt, durationMinutes);
  if (violation) {
    throw new ConsultationError(
      violation,
      'Consultations run 08:00–17:00 Blida time in 15-minute steps and are closed on Friday',
    );
  }
}

async function lockConsultantCalendar(tx: Transaction, consultantId: string) {
  await tx.$queryRaw`
  SELECT COUNT(*)::integer AS "locked"
  FROM (
    SELECT pg_advisory_xact_lock(${CONSULTATION_LOCK_NAMESPACE}::integer, hashtext(${consultantId}))
  ) AS "consultantLock"
`;
}

async function assertNoOverlap(
  tx: Transaction,
  input: {
    consultantUserId: string;
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: string;
  },
) {
  const clash = await tx.consultationAppointment.findFirst({
    where: {
      consultantUserId: input.consultantUserId,
      status: { in: [...consultationBlockingStatuses] },
      startsAt: { lt: input.endsAt },
      endsAt: { gt: input.startsAt },
      ...(input.excludeAppointmentId
        ? { id: { not: input.excludeAppointmentId } }
        : {}),
    },
    select: { id: true },
  });
  if (clash) {
    throw new ConsultationError(
      'overlap',
      'The consultant already has an appointment at this time',
    );
  }
}

function durationOf(
  appointment: Pick<ConsultationAppointment, 'startsAt' | 'endsAt'>,
) {
  return Math.round(
    (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60_000,
  );
}

export interface CreateClientRecordInput {
  actor: ConsultationActor;
  displayName: string;
  phone?: string | null;
  email?: string | null;
  preferredLocale?: string | null;
  contactConsent: boolean;
  operationalNote?: string | null;
  sourceEnquiryId?: string | null;
  now?: Date;
}

export async function createClientRecord(
  client: PrismaClient,
  input: CreateClientRecordInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const now = requireValidDate(input.now ?? new Date(), 'Current time');
  const sourceEnquiryId = input.sourceEnquiryId?.trim() || null;
  if (sourceEnquiryId && input.actor.scope !== 'all') {
    throw new ConsultationError(
      'forbidden',
      'Only the academy workspace can convert enquiries',
    );
  }

  const fields = {
    displayName: clientDisplayNameSchema.parse(input.displayName),
    phone: optionalString(input.phone, (value) =>
      clientPhoneSchema.parse(value),
    ),
    email: optionalString(input.email, (value) =>
      clientEmailSchema.parse(value.toLowerCase()),
    ),
    preferredLocale: clientLocaleSchema.parse(input.preferredLocale ?? 'ar'),
    operationalNote: operationalNoteSchema.parse(input.operationalNote ?? ''),
  };

  return client.$transaction(async (tx) => {
    let consent = input.contactConsent;

    if (sourceEnquiryId) {
      const enquiry = await tx.enquiry.findUnique({
        where: { id: sourceEnquiryId },
        select: { consent: true, client: { select: { id: true } } },
      });
      if (!enquiry) {
        throw new ConsultationError('not-found', 'Enquiry was not found');
      }
      if (enquiry.client) {
        throw new ConsultationError(
          'already-converted',
          'This enquiry already has a client record',
        );
      }
      // Never widen consent beyond what the enquirer gave.
      consent = consent && enquiry.consent;
    }

    return tx.client.create({
      data: {
        ...fields,
        contactConsent: consent,
        contactConsentRecordedAt: consent ? now : null,
        sourceEnquiryId,
        createdByUserId: actorUserId,
      },
    });
  });
}

export interface UpdateClientRecordInput {
  actor: ConsultationActor;
  clientId: string;
  displayName: string;
  phone?: string | null;
  email?: string | null;
  preferredLocale?: string | null;
  contactConsent: boolean;
  operationalNote?: string | null;
  archive?: boolean;
  now?: Date;
}

export async function updateClientRecord(
  client: PrismaClient,
  input: UpdateClientRecordInput,
) {
  const clientId = requireIdentifier(input.clientId, 'Client');
  const now = requireValidDate(input.now ?? new Date(), 'Current time');
  const fields = {
    displayName: clientDisplayNameSchema.parse(input.displayName),
    phone: optionalString(input.phone, (value) =>
      clientPhoneSchema.parse(value),
    ),
    email: optionalString(input.email, (value) =>
      clientEmailSchema.parse(value.toLowerCase()),
    ),
    preferredLocale: clientLocaleSchema.parse(input.preferredLocale ?? 'ar'),
    operationalNote: operationalNoteSchema.parse(input.operationalNote ?? ''),
  };

  return client.$transaction(async (tx) => {
    const existing = await tx.client.findFirst({
      where: {
        id: clientId,
        archivedAt: null,
        ...clientScopeWhere(input.actor),
      },
      select: { contactConsent: true, contactConsentRecordedAt: true },
    });
    if (!existing) {
      throw new ConsultationError('not-found', 'Client was not found');
    }

    const consentChanged = existing.contactConsent !== input.contactConsent;
    return tx.client.update({
      where: { id: clientId },
      data: {
        ...fields,
        contactConsent: input.contactConsent,
        contactConsentRecordedAt: consentChanged
          ? input.contactConsent
            ? now
            : null
          : existing.contactConsentRecordedAt,
        archivedAt: input.archive ? now : null,
      },
    });
  });
}

export interface CreateConsultationAppointmentInput {
  actor: ConsultationActor;
  clientId: string;
  consultantUserId: string;
  startsAt: Date;
  durationMinutes: number;
  mode: string;
  initialStatus?: string;
  priceMinor: number;
  operationalNote?: string | null;
}

export async function createConsultationAppointment(
  client: PrismaClient,
  input: CreateConsultationAppointmentInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const clientId = requireIdentifier(input.clientId, 'Client');
  const consultantUserId = requireIdentifier(
    input.consultantUserId,
    'Consultant',
  );
  if (input.actor.scope === 'own' && consultantUserId !== actorUserId) {
    throw new ConsultationError(
      'forbidden',
      'Consultants can only book their own appointments',
    );
  }
  const startsAt = requireValidDate(input.startsAt, 'Appointment start');
  assertSlot(startsAt, input.durationMinutes);
  const endsAt = consultationEndsAt(startsAt, input.durationMinutes);
  const mode = consultationModeSchema.parse(input.mode);
  const status = consultationInitialStatusSchema.parse(
    input.initialStatus ?? 'CONFIRMED',
  );
  const priceMinor = requirePriceMinor(input.priceMinor);
  const operationalNote = operationalNoteSchema.parse(
    input.operationalNote ?? '',
  );

  return client.$transaction(async (tx) => {
    await requireEligibleConsultant(tx, consultantUserId);
    await requireAccessibleClient(tx, input.actor, clientId);
    await lockConsultantCalendar(tx, consultantUserId);
    await assertNoOverlap(tx, { consultantUserId, startsAt, endsAt });

    const appointment = await tx.consultationAppointment.create({
      data: {
        clientId,
        consultantUserId,
        startsAt,
        endsAt,
        mode,
        status,
        priceMinor,
        operationalNote,
        createdByUserId: actorUserId,
      },
    });
    await tx.consultationAppointmentEvent.create({
      data: {
        appointmentId: appointment.id,
        eventType: ConsultationEventType.CREATED,
        actorUserId,
        toStatus: appointment.status,
        toStartsAt: appointment.startsAt,
        toRevision: appointment.revision,
      },
    });
    return appointment;
  });
}

export interface RescheduleConsultationInput {
  actor: ConsultationActor;
  appointmentId: string;
  expectedRevision: number;
  startsAt: Date;
  durationMinutes: number;
}

export async function rescheduleConsultationAppointment(
  client: PrismaClient,
  input: RescheduleConsultationInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const appointmentId = requireIdentifier(input.appointmentId, 'Appointment');
  const expectedRevision = requireRevision(input.expectedRevision);
  const startsAt = requireValidDate(input.startsAt, 'Appointment start');
  assertSlot(startsAt, input.durationMinutes);
  const endsAt = consultationEndsAt(startsAt, input.durationMinutes);

  return client.$transaction(async (tx) => {
    const current = await requireAccessibleAppointment(
      tx,
      input.actor,
      appointmentId,
      expectedRevision,
    );
    if (current.status !== 'REQUESTED' && current.status !== 'CONFIRMED') {
      throw new ConsultationError(
        'transition',
        'Only upcoming appointments can be rescheduled',
      );
    }
    await lockConsultantCalendar(tx, current.consultantUserId);
    await assertNoOverlap(tx, {
      consultantUserId: current.consultantUserId,
      startsAt,
      endsAt,
      excludeAppointmentId: current.id,
    });

    const updated = await tx.consultationAppointment.update({
      where: { id: current.id },
      data: { startsAt, endsAt, revision: { increment: 1 } },
    });
    await tx.consultationAppointmentEvent.create({
      data: {
        appointmentId: current.id,
        eventType: ConsultationEventType.RESCHEDULED,
        actorUserId,
        fromStatus: current.status,
        toStatus: updated.status,
        fromStartsAt: current.startsAt,
        toStartsAt: updated.startsAt,
        fromRevision: current.revision,
        toRevision: updated.revision,
      },
    });
    return updated;
  });
}

export interface TransitionConsultationInput {
  actor: ConsultationActor;
  appointmentId: string;
  expectedRevision: number;
  toStatus: string;
  now?: Date;
}

export async function transitionConsultationAppointment(
  client: PrismaClient,
  input: TransitionConsultationInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const appointmentId = requireIdentifier(input.appointmentId, 'Appointment');
  const expectedRevision = requireRevision(input.expectedRevision);
  const toStatus = consultationStatusSchema.parse(input.toStatus);
  const now = requireValidDate(input.now ?? new Date(), 'Current time');

  return client.$transaction(async (tx) => {
    const current = await requireAccessibleAppointment(
      tx,
      input.actor,
      appointmentId,
      expectedRevision,
    );
    if (!isConsultationTransitionAllowed(current.status, toStatus)) {
      throw new ConsultationError(
        'transition',
        `Cannot move an appointment from ${current.status} to ${toStatus}`,
      );
    }
    if (
      consultationOutcomeStatuses.includes(toStatus) &&
      current.startsAt.getTime() > now.getTime()
    ) {
      throw new ConsultationError(
        'not-started',
        'Attendance can only be recorded once the session has started',
      );
    }
    if (current.status === 'REQUESTED' && toStatus === 'CONFIRMED') {
      await lockConsultantCalendar(tx, current.consultantUserId);
      await assertNoOverlap(tx, {
        consultantUserId: current.consultantUserId,
        startsAt: current.startsAt,
        endsAt: current.endsAt,
        excludeAppointmentId: current.id,
      });
    }

    const updated = await tx.consultationAppointment.update({
      where: { id: current.id },
      data: { status: toStatus, revision: { increment: 1 } },
    });
    await tx.consultationAppointmentEvent.create({
      data: {
        appointmentId: current.id,
        eventType: ConsultationEventType.STATUS_CHANGED,
        actorUserId,
        fromStatus: current.status,
        toStatus: updated.status,
        fromStartsAt: current.startsAt,
        toStartsAt: updated.startsAt,
        fromRevision: current.revision,
        toRevision: updated.revision,
      },
    });
    return updated;
  });
}

export interface UpdateConsultationNoteInput {
  actor: ConsultationActor;
  appointmentId: string;
  expectedRevision: number;
  operationalNote?: string | null;
}

/** Updates the short operational note. The note text is never copied into
 * the audit history; only the fact that it changed is recorded. */
export async function updateConsultationNote(
  client: PrismaClient,
  input: UpdateConsultationNoteInput,
) {
  const actorUserId = requireIdentifier(input.actor.userId, 'Actor');
  const appointmentId = requireIdentifier(input.appointmentId, 'Appointment');
  const expectedRevision = requireRevision(input.expectedRevision);
  const operationalNote = operationalNoteSchema.parse(
    input.operationalNote ?? '',
  );

  return client.$transaction(async (tx) => {
    const current = await requireAccessibleAppointment(
      tx,
      input.actor,
      appointmentId,
      expectedRevision,
    );
    const updated = await tx.consultationAppointment.update({
      where: { id: current.id },
      data: { operationalNote, revision: { increment: 1 } },
    });
    await tx.consultationAppointmentEvent.create({
      data: {
        appointmentId: current.id,
        eventType: ConsultationEventType.NOTE_UPDATED,
        actorUserId,
        fromStatus: current.status,
        toStatus: updated.status,
        fromStartsAt: current.startsAt,
        toStartsAt: updated.startsAt,
        fromRevision: current.revision,
        toRevision: updated.revision,
      },
    });
    return updated;
  });
}

export { durationOf as consultationDurationMinutes };
