import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { createClientRecord } from './consultations';
import { recordCrmActivity, searchCrmRecords, type CrmActor } from './crm';
import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const ownerId = `crm-owner-${suffix}`;
const consultantId = `crm-consultant-${suffix}`;
const otherId = `crm-other-${suffix}`;

const owner: CrmActor = {
  userId: ownerId,
  canWorkEnquiries: true,
  consultationScope: 'all',
  paymentScope: 'all',
};
const consultant: CrmActor = {
  userId: consultantId,
  canWorkEnquiries: false,
  consultationScope: 'own',
  paymentScope: 'own',
};
const otherConsultant: CrmActor = { ...consultant, userId: otherId };

suite('CRM activities and search', () => {
  let consentedLead = '';
  let silentLead = '';
  let contactId = '';

  beforeAll(async () => {
    await db.user.createMany({
      data: [ownerId, consultantId, otherId].map((id) => ({
        id,
        clerkId: `clerk-${id}`,
        email: `${id}@example.test`,
      })),
    });
    const [consented, silent] = await Promise.all([
      db.enquiry.create({
        data: {
          name: `Crmlead Consented ${suffix}`,
          email: `crm-consented-${suffix}@example.test`,
          school: 'PSYCHOLOGY',
          message: 'Interested in a consultation',
          consent: true,
        },
      }),
      db.enquiry.create({
        data: {
          name: `Crmlead Silent ${suffix}`,
          email: `crm-silent-${suffix}@example.test`,
          school: 'TRAINING',
          message: 'Just reading',
          consent: false,
        },
      }),
    ]);
    consentedLead = consented.id;
    silentLead = silent.id;
    const contact = await createClientRecord(db, {
      actor: { userId: consultantId, scope: 'own' },
      displayName: `Crmcontact ${suffix}`,
      contactConsent: true,
    });
    contactId = contact.id;
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('logs activities only with consent for outbound contact', async () => {
    const call = await recordCrmActivity(db, {
      actor: owner,
      type: 'CALL',
      direction: 'OUTBOUND',
      outcome: 'REACHED',
      summary: 'Explained consultation hours',
      enquiryId: consentedLead,
    });
    expect(call.outcome).toBe('REACHED');

    await expect(
      recordCrmActivity(db, {
        actor: owner,
        type: 'WHATSAPP',
        direction: 'OUTBOUND',
        summary: 'Follow-up message',
        enquiryId: silentLead,
      }),
    ).rejects.toMatchObject({ code: 'consent-required' });

    const inbound = await recordCrmActivity(db, {
      actor: owner,
      type: 'CALL',
      direction: 'INBOUND',
      summary: 'They called asking about dates',
      enquiryId: silentLead,
    });
    expect(inbound.direction).toBe('INBOUND');

    const note = await recordCrmActivity(db, {
      actor: owner,
      type: 'NOTE',
      direction: 'OUTBOUND',
      summary: 'Prefers evenings',
      enquiryId: silentLead,
    });
    expect(note.direction).toBeNull();

    await expect(
      db.crmActivity.update({
        where: { id: note.id },
        data: { summary: 'changed' },
      }),
    ).rejects.toThrow();
  });

  test('scopes contacts to the consultant who serves them', async () => {
    await expect(
      recordCrmActivity(db, {
        actor: consultant,
        type: 'NOTE',
        summary: 'Confirmed the next session',
        clientId: contactId,
      }),
    ).resolves.toMatchObject({ clientId: contactId });

    await expect(
      recordCrmActivity(db, {
        actor: otherConsultant,
        type: 'NOTE',
        summary: 'Should not be allowed',
        clientId: contactId,
      }),
    ).rejects.toMatchObject({ code: 'not-found' });

    await expect(
      recordCrmActivity(db, {
        actor: consultant,
        type: 'NOTE',
        summary: 'Leads are not theirs',
        enquiryId: consentedLead,
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
  });

  test('search obeys the same scope', async () => {
    const ownerResults = await searchCrmRecords(db, owner, `Crm`);
    expect(ownerResults.leads.length).toBeGreaterThanOrEqual(2);
    expect(ownerResults.contacts.some(({ id }) => id === contactId)).toBe(true);

    const consultantResults = await searchCrmRecords(db, consultant, 'Crm');
    expect(consultantResults.leads).toEqual([]);
    expect(consultantResults.contacts.map(({ id }) => id)).toContain(contactId);

    const otherResults = await searchCrmRecords(db, otherConsultant, 'Crm');
    expect(otherResults.contacts.map(({ id }) => id)).not.toContain(contactId);

    await expect(searchCrmRecords(db, owner, 'C')).resolves.toMatchObject({
      leads: [],
      contacts: [],
      receipts: [],
    });
  });
});
