import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { createClientRecord } from './consultations';
import { CrmError, type CrmActor } from './crm';
import {
  changeCrmOfferStatus,
  createCrmDeal,
  createCrmOffer,
  createQuickCrmLead,
  crmDealWhere,
  moveCrmDeal,
} from './crm-deals';
import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const ownerId = `deal-owner-${suffix}`;
const agentId = `deal-agent-${suffix}`;
const consultantId = `deal-consultant-${suffix}`;
const otherId = `deal-other-${suffix}`;

const owner: CrmActor = {
  userId: ownerId,
  canWorkEnquiries: true,
  consultationScope: 'all',
  paymentScope: 'all',
};
const agent: CrmActor = {
  userId: agentId,
  canWorkEnquiries: true,
  consultationScope: null,
  paymentScope: null,
};
const consultant: CrmActor = {
  userId: consultantId,
  canWorkEnquiries: false,
  consultationScope: 'own',
  paymentScope: 'own',
};
const otherConsultant: CrmActor = { ...consultant, userId: otherId };

async function expectCrmError(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toBeInstanceOf(CrmError);
  await promise.catch((error: CrmError) => expect(error.code).toBe(code));
}

suite('CRM offers, opportunities and quick-add leads', () => {
  let leadId = '';
  let contactId = '';
  let offerId = '';

  beforeAll(async () => {
    await db.user.createMany({
      data: [ownerId, agentId, consultantId, otherId].map((id) => ({
        id,
        clerkId: `clerk-${id}`,
        email: `${id}@example.test`,
      })),
    });
    const lead = await db.enquiry.create({
      data: {
        name: `Deallead ${suffix}`,
        email: `deal-lead-${suffix}@example.test`,
        school: 'LANGUAGES',
        message: 'Wants an evening French group',
        consent: true,
      },
    });
    leadId = lead.id;
    const contact = await createClientRecord(db, {
      actor: { userId: consultantId, scope: 'own' },
      displayName: `Dealcontact ${suffix}`,
      contactConsent: true,
    });
    contactId = contact.id;
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('only offer managers create offers and prices stay unset', async () => {
    const input = {
      section: 'LANGUAGES',
      kind: 'LANGUAGE_COURSE',
      title: `French B1 ${suffix}`,
      priceDinars: '',
      startsOn: '2026-12-01',
      endsOn: '2027-02-28',
      capacity: '12',
      trainerUserId: '',
    };
    await expectCrmError(
      createCrmOffer(db, {
        actorUserId: agentId,
        canManageOffers: false,
        offer: input,
      }),
      'forbidden',
    );
    const offer = await createCrmOffer(db, {
      actorUserId: ownerId,
      canManageOffers: true,
      offer: input,
    });
    expect(offer).toMatchObject({ priceMinor: null, status: 'DRAFT' });
    offerId = offer.id;

    await changeCrmOfferStatus(db, {
      canManageOffers: true,
      offerId,
      fromStatus: 'DRAFT',
      toStatus: 'OPEN',
    });
    await expectCrmError(
      changeCrmOfferStatus(db, {
        canManageOffers: true,
        offerId,
        fromStatus: 'DRAFT',
        toStatus: 'OPEN',
      }),
      'conflict',
    );
  });

  test('creates one open lead opportunity per section with history', async () => {
    const deal = await createCrmDeal(db, {
      actor: agent,
      deal: {
        section: 'LANGUAGES',
        enquiryId: leadId,
        clientId: '',
        offerId,
        valueDinars: '18000',
        expectedCloseOn: '',
      },
    });
    expect(deal).toMatchObject({
      stage: 'NEW',
      state: 'OPEN',
      valueMinor: 1_800_000,
      ownerUserId: agentId,
    });

    await expectCrmError(
      createCrmDeal(db, {
        actor: agent,
        deal: {
          section: 'LANGUAGES',
          enquiryId: leadId,
          clientId: '',
          offerId: '',
          valueDinars: '',
          expectedCloseOn: '',
        },
      }),
      'duplicate-open',
    );
    await expectCrmError(
      createCrmDeal(db, {
        actor: agent,
        deal: {
          section: 'PSYCHOLOGY',
          enquiryId: leadId,
          clientId: '',
          offerId,
          valueDinars: '',
          expectedCloseOn: '',
        },
      }),
      'offer-unavailable',
    );

    const moved = await moveCrmDeal(db, {
      actor: agent,
      dealId: deal.id,
      toStage: 'PLACEMENT_TEST',
      expectedRevision: 1,
    });
    expect(moved.state).toBe('OPEN');
    await expectCrmError(
      moveCrmDeal(db, {
        actor: agent,
        dealId: deal.id,
        toStage: 'LEVEL_ASSIGNED',
        expectedRevision: 1,
      }),
      'conflict',
    );
    await expectCrmError(
      moveCrmDeal(db, { actor: agent, dealId: deal.id, toStage: 'LOST' }),
      'reason-required',
    );
    const lost = await moveCrmDeal(db, {
      actor: agent,
      dealId: deal.id,
      toStage: 'LOST',
      reason: 'Schedule does not fit',
    });
    expect(lost.state).toBe('LOST');
    await expectCrmError(
      moveCrmDeal(db, { actor: agent, dealId: deal.id, toStage: 'NEW' }),
      'stage-closed',
    );

    const stored = await db.crmDeal.findUniqueOrThrow({
      where: { id: deal.id },
      include: { events: { orderBy: { occurredAt: 'asc' } } },
    });
    expect(stored.closedAt).not.toBeNull();
    expect(stored.lostReason).toBe('Schedule does not fit');
    expect(stored.events.map(({ type, toStage }) => [type, toStage])).toEqual([
      ['CREATED', 'NEW'],
      ['STAGE_CHANGED', 'PLACEMENT_TEST'],
      ['STAGE_CHANGED', 'LOST'],
    ]);
    await expect(
      db.crmDealEvent.delete({ where: { id: stored.events[0]!.id } }),
    ).rejects.toThrow();
  });

  test('scopes contact opportunities to the consultant who reaches them', async () => {
    await expectCrmError(
      createCrmDeal(db, {
        actor: otherConsultant,
        deal: {
          section: 'PSYCHOLOGY',
          enquiryId: '',
          clientId: contactId,
          offerId: '',
          valueDinars: '',
          expectedCloseOn: '',
        },
      }),
      'not-found',
    );
    await expectCrmError(
      createCrmDeal(db, {
        actor: consultant,
        deal: {
          section: 'PSYCHOLOGY',
          enquiryId: leadId,
          clientId: '',
          offerId: '',
          valueDinars: '',
          expectedCloseOn: '',
        },
      }),
      'forbidden',
    );
    const deal = await createCrmDeal(db, {
      actor: consultant,
      deal: {
        section: 'PSYCHOLOGY',
        enquiryId: '',
        clientId: contactId,
        offerId: '',
        valueDinars: '',
        expectedCloseOn: '',
      },
    });
    const visible = (actor: CrmActor) =>
      db.crmDeal.count({
        where: { AND: [{ id: deal.id }, crmDealWhere(actor)!] },
      });
    expect(await visible(consultant)).toBe(1);
    expect(await visible(otherConsultant)).toBe(0);
    expect(await visible(owner)).toBe(1);
    expect(crmDealWhere({ ...agent, canWorkEnquiries: false })).toBeNull();
  });

  test('quick-adds a phone-only lead with source, consent and owner', async () => {
    await expectCrmError(
      createQuickCrmLead(db, {
        actor: consultant,
        lead: {
          name: 'Walk-in',
          phone: '0550123456',
          source: 'walk-in',
          school: 'LANGUAGES',
          consent: 'yes',
        },
      }),
      'forbidden',
    );
    const created = await createQuickCrmLead(db, {
      actor: agent,
      lead: {
        name: `Walkin ${suffix}`,
        phone: '0550 12 34 56',
        email: '',
        source: 'whatsapp',
        school: 'PSYCHOLOGY',
        timingPreference: 'SOON',
        note: 'Asked about family workshops',
        consent: 'no',
      },
    });
    const lead = await db.enquiry.findUniqueOrThrow({
      where: { id: created.id },
      include: { ownershipEvents: true },
    });
    expect(lead).toMatchObject({
      email: '',
      source: 'whatsapp',
      preferredContact: 'WHATSAPP',
      consent: false,
      status: 'NEW',
      ownerUserId: agentId,
    });
    expect(lead.ownershipEvents).toHaveLength(1);
  });
});
