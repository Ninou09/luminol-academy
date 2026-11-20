import { zonedLocalToUtc } from '@luminol/validation/consultations';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  ConsultationError,
  createClientRecord,
  createConsultationAppointment,
  rescheduleConsultationAppointment,
  transitionConsultationAppointment,
  updateConsultationNote,
  type ConsultationActor,
} from './consultations';
import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const ownerId = `consult-owner-${suffix}`;
const consultantId = `consult-consultant-${suffix}`;
const otherConsultantId = `consult-other-${suffix}`;
const plainUserId = `consult-plain-${suffix}`;

const owner: ConsultationActor = { userId: ownerId, scope: 'all' };
const consultant: ConsultationActor = { userId: consultantId, scope: 'own' };
const otherConsultant: ConsultationActor = {
  userId: otherConsultantId,
  scope: 'own',
};

// A Saturday far enough ahead that it never collides with other suites.
const day = '2031-03-15';
const at = (time: string) => zonedLocalToUtc(`${day}T${time}`);

suite('consultation persistence', () => {
  beforeAll(async () => {
    await db.user.createMany({
      data: [ownerId, consultantId, otherConsultantId, plainUserId].map(
        (id) => ({
          id,
          clerkId: `clerk-${id}`,
          email: `${id}@example.test`,
        }),
      ),
    });
    const role = await db.role.findUniqueOrThrow({
      where: { key: 'consultant' },
    });
    await db.userRole.createMany({
      data: [consultantId, otherConsultantId].map((userId) => ({
        userId,
        roleId: role.id,
      })),
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('books, protects the calendar and records an append-only history', async () => {
    const record = await createClientRecord(db, {
      actor: owner,
      displayName: 'Test client',
      phone: '0555 00 00 01',
      contactConsent: true,
    });
    expect(record.contactConsentRecordedAt).not.toBeNull();

    const appointment = await createConsultationAppointment(db, {
      actor: owner,
      clientId: record.id,
      consultantUserId: consultantId,
      startsAt: at('10:00'),
      durationMinutes: 60,
      mode: 'ONSITE',
      priceMinor: 300000,
    });
    expect(appointment.status).toBe('CONFIRMED');
    expect(appointment.endsAt.toISOString()).toBe(at('11:00').toISOString());

    await expect(
      createConsultationAppointment(db, {
        actor: owner,
        clientId: record.id,
        consultantUserId: consultantId,
        startsAt: at('10:30'),
        durationMinutes: 30,
        mode: 'ONLINE',
        priceMinor: 300000,
      }),
    ).rejects.toMatchObject({ code: 'overlap' });

    // Another consultant can use the same slot.
    await expect(
      createConsultationAppointment(db, {
        actor: owner,
        clientId: record.id,
        consultantUserId: otherConsultantId,
        startsAt: at('10:30'),
        durationMinutes: 30,
        mode: 'ONLINE',
        priceMinor: 300000,
      }),
    ).resolves.toMatchObject({ status: 'CONFIRMED' });

    const moved = await rescheduleConsultationAppointment(db, {
      actor: consultant,
      appointmentId: appointment.id,
      expectedRevision: 1,
      startsAt: at('14:00'),
      durationMinutes: 45,
    });
    expect(moved.revision).toBe(2);

    await expect(
      rescheduleConsultationAppointment(db, {
        actor: consultant,
        appointmentId: appointment.id,
        expectedRevision: 1,
        startsAt: at('15:00'),
        durationMinutes: 45,
      }),
    ).rejects.toMatchObject({ code: 'stale' });

    await expect(
      transitionConsultationAppointment(db, {
        actor: consultant,
        appointmentId: appointment.id,
        expectedRevision: 2,
        toStatus: 'COMPLETED',
        now: at('09:00'),
      }),
    ).rejects.toMatchObject({ code: 'not-started' });

    const completed = await transitionConsultationAppointment(db, {
      actor: consultant,
      appointmentId: appointment.id,
      expectedRevision: 2,
      toStatus: 'COMPLETED',
      now: at('15:00'),
    });
    expect(completed.status).toBe('COMPLETED');

    await expect(
      transitionConsultationAppointment(db, {
        actor: owner,
        appointmentId: appointment.id,
        expectedRevision: 3,
        toStatus: 'CANCELLED',
      }),
    ).rejects.toMatchObject({ code: 'transition' });

    const noted = await updateConsultationNote(db, {
      actor: consultant,
      appointmentId: appointment.id,
      expectedRevision: 3,
      operationalNote: 'Paid at reception',
    });
    expect(noted.operationalNote).toBe('Paid at reception');

    const events = await db.consultationAppointmentEvent.findMany({
      where: { appointmentId: appointment.id },
      orderBy: { occurredAt: 'asc' },
    });
    expect(events.map(({ eventType }) => eventType)).toEqual([
      'CREATED',
      'RESCHEDULED',
      'STATUS_CHANGED',
      'NOTE_UPDATED',
    ]);
    await expect(
      db.consultationAppointmentEvent.update({
        where: { id: events[0]!.id },
        data: { toRevision: 99 },
      }),
    ).rejects.toThrow();
  });

  test('enforces opening hours and Friday closure', async () => {
    const record = await createClientRecord(db, {
      actor: owner,
      displayName: 'Hours client',
      contactConsent: false,
    });
    const base = {
      actor: owner,
      clientId: record.id,
      consultantUserId: consultantId,
      durationMinutes: 60,
      mode: 'ONSITE',
      priceMinor: 300000,
    };

    await expect(
      createConsultationAppointment(db, {
        ...base,
        startsAt: zonedLocalToUtc('2031-03-14T10:00'),
      }),
    ).rejects.toMatchObject({ code: 'closed-day' });
    await expect(
      createConsultationAppointment(db, { ...base, startsAt: at('16:30') }),
    ).rejects.toMatchObject({ code: 'outside-hours' });
  });

  test('scopes consultants to their own calendar and clients', async () => {
    const own = await createClientRecord(db, {
      actor: consultant,
      displayName: 'Own client',
      contactConsent: true,
    });

    await expect(
      createConsultationAppointment(db, {
        actor: consultant,
        clientId: own.id,
        consultantUserId: otherConsultantId,
        startsAt: at('08:00'),
        durationMinutes: 30,
        mode: 'ONLINE',
        priceMinor: 0,
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });

    await expect(
      createConsultationAppointment(db, {
        actor: otherConsultant,
        clientId: own.id,
        consultantUserId: otherConsultantId,
        startsAt: at('08:00'),
        durationMinutes: 30,
        mode: 'ONLINE',
        priceMinor: 0,
      }),
    ).rejects.toMatchObject({ code: 'not-found' });

    await expect(
      createConsultationAppointment(db, {
        actor: owner,
        clientId: own.id,
        consultantUserId: plainUserId,
        startsAt: at('08:00'),
        durationMinutes: 30,
        mode: 'ONLINE',
        priceMinor: 0,
      }),
    ).rejects.toMatchObject({ code: 'ineligible-consultant' });

    const booked = await createConsultationAppointment(db, {
      actor: consultant,
      clientId: own.id,
      consultantUserId: consultantId,
      startsAt: at('08:00'),
      durationMinutes: 30,
      mode: 'ONLINE',
      initialStatus: 'REQUESTED',
      priceMinor: 250000,
    });

    await expect(
      transitionConsultationAppointment(db, {
        actor: otherConsultant,
        appointmentId: booked.id,
        expectedRevision: 1,
        toStatus: 'CONFIRMED',
      }),
    ).rejects.toBeInstanceOf(ConsultationError);
  });

  test('converts an enquiry once without widening consent', async () => {
    const enquiry = await db.enquiry.create({
      data: {
        name: 'Enquirer',
        email: `enquirer-${suffix}@example.test`,
        school: 'PSYCHOLOGY',
        message: 'Requesting a consultation',
        consent: false,
      },
    });

    const converted = await createClientRecord(db, {
      actor: owner,
      displayName: 'Enquirer',
      contactConsent: true,
      sourceEnquiryId: enquiry.id,
    });
    expect(converted.contactConsent).toBe(false);

    await expect(
      createClientRecord(db, {
        actor: owner,
        displayName: 'Enquirer again',
        contactConsent: false,
        sourceEnquiryId: enquiry.id,
      }),
    ).rejects.toMatchObject({ code: 'already-converted' });

    await expect(
      createClientRecord(db, {
        actor: consultant,
        displayName: 'Not allowed',
        contactConsent: false,
        sourceEnquiryId: enquiry.id,
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });
});
