import { describe, expect, it } from 'vitest';

import {
  checkCrmStageMove,
  crmDealInputSchema,
  crmOfferFillRate,
  crmOfferInputSchema,
  crmOfferTransitions,
  crmQuickLeadPreferredContact,
  crmQuickLeadSchema,
  crmSectionForSchool,
  crmSectionFromSlug,
  crmSectionOfferKinds,
  crmSections,
  crmSectionSlugs,
  getCrmInitialStage,
  getCrmSectionStages,
  getCrmStageTransitions,
  scoreCrmLead,
} from './crm-sections';

describe('CRM section configuration', () => {
  it.each(crmSections)('%s has a coherent stage set', (section) => {
    const stages = getCrmSectionStages(section);
    const keys = stages.map(({ key }) => key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(stages[0]!.state).toBe('OPEN');
    expect(stages.some(({ state }) => state === 'WON')).toBe(true);
    expect(stages.some(({ state }) => state === 'LOST')).toBe(true);
    expect(keys.every((key) => /^[A-Z_]{2,32}$/.test(key))).toBe(true);
    expect(crmSectionOfferKinds[section].length).toBeGreaterThan(0);
  });

  it('round-trips section slugs', () => {
    for (const section of crmSections) {
      expect(crmSectionFromSlug(crmSectionSlugs[section])).toBe(section);
    }
    expect(crmSectionFromSlug('unknown')).toBeNull();
  });

  it('maps schools to sections', () => {
    expect(crmSectionForSchool('TRAINING')).toBe('PROFESSIONAL');
    expect(crmSectionForSchool('GENERAL')).toBeNull();
  });

  it('starts events at registration and other sections at new', () => {
    expect(getCrmInitialStage('EVENTS')).toBe('REGISTERED');
    expect(getCrmInitialStage('LANGUAGES')).toBe('NEW');
  });

  it('keeps won and lost stages terminal', () => {
    expect(getCrmStageTransitions('PSYCHOLOGY', 'WON')).toEqual([]);
    expect(getCrmStageTransitions('EVENTS', 'NO_SHOW')).toEqual([]);
    expect(getCrmStageTransitions('PSYCHOLOGY', 'NEW')).toContain('LOST');
    expect(getCrmStageTransitions('PSYCHOLOGY', 'UNKNOWN')).toEqual([]);
  });

  it('checks stage moves', () => {
    const move = (toStage: string, reason: string | null = null) =>
      checkCrmStageMove({
        section: 'PSYCHOLOGY',
        fromStage: 'CONTACTED',
        toStage,
        reason,
      });
    expect(move('QUALIFIED')).toBeNull();
    expect(move('PLACEMENT_TEST')).toBe('stage-invalid');
    expect(move('CONTACTED')).toBe('stage-invalid');
    expect(move('LOST')).toBe('reason-required');
    expect(move('LOST', 'Chose another provider')).toBeNull();
    expect(
      checkCrmStageMove({
        section: 'PSYCHOLOGY',
        fromStage: 'WON',
        toStage: 'NEW',
        reason: null,
      }),
    ).toBe('stage-closed');
    expect(
      checkCrmStageMove({
        section: 'EVENTS',
        fromStage: 'CONFIRMED',
        toStage: 'NO_SHOW',
        reason: null,
      }),
    ).toBeNull();
  });

  it('closes offers for good once done or cancelled', () => {
    expect(crmOfferTransitions.DONE).toEqual([]);
    expect(crmOfferTransitions.CANCELLED).toEqual([]);
    expect(crmOfferTransitions.FULL).toContain('OPEN');
  });
});

describe('CRM offer and deal input', () => {
  const offer = {
    section: 'LANGUAGES',
    kind: 'LANGUAGE_COURSE',
    title: 'French B1 evening group',
    priceDinars: '',
    startsOn: '2026-12-01',
    endsOn: '2027-02-28',
    capacity: '12',
    trainerUserId: '',
  };

  it('keeps an empty price unset instead of zero', () => {
    const parsed = crmOfferInputSchema.parse(offer);
    expect(parsed.priceDinars).toBeNull();
    expect(parsed.capacity).toBe(12);
    expect(parsed.trainerUserId).toBeNull();
  });

  it('rejects kinds from another section and reversed dates', () => {
    expect(
      crmOfferInputSchema.safeParse({ ...offer, kind: 'CONSULTATION' }).success,
    ).toBe(false);
    expect(
      crmOfferInputSchema.safeParse({ ...offer, endsOn: '2026-11-01' }).success,
    ).toBe(false);
  });

  it('requires a lead or a contact for a deal', () => {
    expect(
      crmDealInputSchema.safeParse({
        section: 'PSYCHOLOGY',
        enquiryId: '',
        clientId: '',
        offerId: '',
        valueDinars: '',
        expectedCloseOn: '',
      }).success,
    ).toBe(false);
    const parsed = crmDealInputSchema.parse({
      section: 'PSYCHOLOGY',
      enquiryId: 'lead_1',
      clientId: '',
      offerId: '',
      valueDinars: '4500',
      expectedCloseOn: '',
    });
    expect(parsed.valueDinars).toBe(4500);
    expect(parsed.clientId).toBeNull();
  });
});

describe('CRM quick-add lead', () => {
  const base = {
    name: 'Walk-in visitor',
    phone: '0550 12 34 56',
    email: '',
    source: 'walk-in',
    school: 'LANGUAGES',
    timingPreference: '',
    note: '',
    consent: 'yes',
  };

  it('accepts a phone-only lead with an explicit consent answer', () => {
    const parsed = crmQuickLeadSchema.parse(base);
    expect(parsed.email).toBe('');
    expect(parsed.timingPreference).toBeUndefined();
    expect(crmQuickLeadPreferredContact(parsed)).toBe('PHONE');
  });

  it('requires a way to reach the person and a consent answer', () => {
    expect(
      crmQuickLeadSchema.safeParse({ ...base, phone: '', email: '' }).success,
    ).toBe(false);
    expect(
      crmQuickLeadSchema.safeParse({ ...base, consent: undefined }).success,
    ).toBe(false);
  });

  it('prefers WhatsApp for WhatsApp leads', () => {
    expect(
      crmQuickLeadPreferredContact({ source: 'whatsapp', phone: '0550' }),
    ).toBe('WHATSAPP');
    expect(
      crmQuickLeadPreferredContact({ source: 'facebook', phone: undefined }),
    ).toBe('EMAIL');
  });
});

describe('CRM lead score', () => {
  const now = new Date('2026-11-13T10:00:00Z');
  const days = (count: number) => new Date(now.getTime() - count * 86_400_000);
  const base = {
    consent: true,
    phone: '0550123456',
    timingPreference: 'SOON',
    hasProgramme: true,
    contacted: true,
    createdAt: days(1),
    lastActivityAt: days(1),
    now,
  };

  it('ranks a ready, reachable lead hot', () => {
    expect(scoreCrmLead(base)).toMatchObject({ score: 100, band: 'hot' });
  });

  it('never ranks a lead without consent above cold', () => {
    const result = scoreCrmLead({ ...base, consent: false });
    expect(result.band).toBe('cold');
    expect(result.reasons).toContain('no-consent');
  });

  it('lowers leads left waiting without contact', () => {
    const waiting = scoreCrmLead({
      ...base,
      timingPreference: null,
      hasProgramme: false,
      contacted: false,
      createdAt: days(10),
      lastActivityAt: null,
    });
    expect(waiting).toMatchObject({ score: 25, band: 'cold' });
    expect(waiting.reasons).toContain('waiting-contact');
    expect(
      scoreCrmLead({
        ...base,
        timingPreference: 'LATER',
        hasProgramme: false,
        lastActivityAt: null,
      }).band,
    ).toBe('warm');
  });

  it('computes offer fill rates only with a capacity', () => {
    expect(crmOfferFillRate(3, 12)).toBe(25);
    expect(crmOfferFillRate(20, 12)).toBe(100);
    expect(crmOfferFillRate(3, null)).toBeNull();
  });
});
