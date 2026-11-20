import { zonedLocalToUtc } from '@luminol/validation/consultations';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  createClientRecord,
  createConsultationAppointment,
} from './consultations';
import { db } from './index';
import { recordOfficePayment, voidOfficePayment } from './office-payments';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const ownerId = `pay-owner-${suffix}`;
const consultantId = `pay-consultant-${suffix}`;
const otherId = `pay-other-${suffix}`;
const now = new Date('2031-04-20T12:00:00.000Z');

suite('office payments ledger', () => {
  let appointmentId = '';
  let clientId = '';

  beforeAll(async () => {
    await db.user.createMany({
      data: [ownerId, consultantId, otherId].map((id) => ({
        id,
        clerkId: `clerk-${id}`,
        email: `${id}@example.test`,
      })),
    });
    const role = await db.role.findUniqueOrThrow({
      where: { key: 'consultant' },
    });
    await db.userRole.createMany({
      data: [consultantId, otherId].map((userId) => ({
        userId,
        roleId: role.id,
      })),
    });
    const record = await createClientRecord(db, {
      actor: { userId: ownerId, scope: 'all' },
      displayName: 'Paying client',
      contactConsent: false,
    });
    clientId = record.id;
    const appointment = await createConsultationAppointment(db, {
      actor: { userId: ownerId, scope: 'all' },
      clientId,
      consultantUserId: consultantId,
      startsAt: zonedLocalToUtc('2031-04-19T10:00'),
      durationMinutes: 60,
      mode: 'ONSITE',
      priceMinor: 300000,
    });
    appointmentId = appointment.id;
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('records with a sequential receipt and voids exactly once', async () => {
    const first = await recordOfficePayment(db, {
      actor: { userId: consultantId, scope: 'own' },
      payerName: 'Paying client',
      appointmentId,
      purpose: 'CONSULTATION',
      description: 'Consultation',
      amountMinor: 300000,
      method: 'CASH',
      receivedAt: now,
      now,
    });
    expect(first.receiptNumber).toMatch(/^LUM-2031-\d{6}$/);
    expect(first.clientId).toBe(clientId);

    const second = await recordOfficePayment(db, {
      actor: { userId: ownerId, scope: 'all' },
      payerName: 'Trainee',
      purpose: 'PROGRAMME',
      description: 'Self-hypnosis course',
      amountMinor: 1600000,
      method: 'CCP',
      externalReference: 'CCP-REF-1',
      receivedAt: now,
      now,
    });
    expect(second.receiptNumber > first.receiptNumber).toBe(true);

    await expect(
      db.officePayment.update({
        where: { id: second.id },
        data: { amountMinor: 1 },
      }),
    ).rejects.toThrow();
    await expect(
      db.officePayment.delete({ where: { id: second.id } }),
    ).rejects.toThrow();

    const voided = await voidOfficePayment(db, {
      actorUserId: ownerId,
      paymentId: second.id,
      reason: 'Entered twice by mistake',
      now,
    });
    expect(voided.status).toBe('VOIDED');
    await expect(
      voidOfficePayment(db, {
        actorUserId: ownerId,
        paymentId: second.id,
        reason: 'Second attempt',
        now,
      }),
    ).rejects.toMatchObject({ code: 'already-voided' });

    const events = await db.officePaymentEvent.findMany({
      where: { paymentId: second.id },
      orderBy: { occurredAt: 'asc' },
    });
    expect(events.map(({ eventType }) => eventType)).toEqual([
      'RECORDED',
      'VOIDED',
    ]);
  });

  test('keeps consultants to their own consultations and requires references', async () => {
    await expect(
      recordOfficePayment(db, {
        actor: { userId: otherId, scope: 'own' },
        payerName: 'Paying client',
        appointmentId,
        purpose: 'CONSULTATION',
        description: 'Consultation',
        amountMinor: 300000,
        method: 'CASH',
        receivedAt: now,
        now,
      }),
    ).rejects.toMatchObject({ code: 'not-found' });

    await expect(
      recordOfficePayment(db, {
        actor: { userId: consultantId, scope: 'own' },
        payerName: 'Someone',
        purpose: 'PROGRAMME',
        description: 'Course',
        amountMinor: 100,
        method: 'CASH',
        receivedAt: now,
        now,
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });

    await expect(
      recordOfficePayment(db, {
        actor: { userId: ownerId, scope: 'all' },
        payerName: 'Someone',
        purpose: 'OTHER',
        description: 'Transfer',
        amountMinor: 100,
        method: 'BARIDIMOB',
        receivedAt: now,
        now,
      }),
    ).rejects.toMatchObject({ code: 'reference-required' });

    await expect(
      recordOfficePayment(db, {
        actor: { userId: ownerId, scope: 'all' },
        payerName: 'Someone',
        purpose: 'OTHER',
        description: 'Future',
        amountMinor: 100,
        method: 'CASH',
        receivedAt: new Date(now.getTime() + 60 * 60 * 1000),
        now,
      }),
    ).rejects.toMatchObject({ code: 'received-at' });
  });
});
