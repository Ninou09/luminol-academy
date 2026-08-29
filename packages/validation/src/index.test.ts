import { describe, expect, it } from 'vitest';
import { contactSchema, localeSchema } from './index';

const validEnquiry = {
  name: 'Luminol Learner',
  email: 'learner@example.com',
  phone: '',
  city: 'Blida',
  preferredContact: 'EMAIL',
  deliveryPreference: 'FLEXIBLE',
  timingPreference: 'WITHIN_MONTH',
  school: 'LANGUAGES',
  message: 'I would like to understand the available language pathways.',
  locale: 'en',
  consent: true,
  website: '',
};

describe('contactSchema', () => {
  it('accepts a complete public enquiry', () => {
    expect(contactSchema.safeParse(validEnquiry).success).toBe(true);
  });

  it('requires privacy consent', () => {
    expect(
      contactSchema.safeParse({ ...validEnquiry, consent: false }).success,
    ).toBe(false);
  });

  it('rejects honeypot submissions', () => {
    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        website: 'https://spam.example',
      }).success,
    ).toBe(false);
  });

  it('rejects unsupported school and qualification values', () => {
    expect(
      contactSchema.safeParse({ ...validEnquiry, school: 'UNKNOWN' }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        preferredContact: 'MESSENGER',
      }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        deliveryPreference: 'HYBRID_ONLY',
      }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...validEnquiry, timingPreference: 'URGENT' })
        .success,
    ).toBe(false);
  });

  it('accepts a bounded programme slug and rejects arbitrary offer text', () => {
    const result = contactSchema.safeParse({
      ...validEnquiry,
      programmeSlug: 'Acceptance-Commitment-Therapy',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.programmeSlug).toBe('acceptance-commitment-therapy');
    }

    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        programmeSlug: 'not a valid programme slug',
      }).success,
    ).toBe(false);
  });

  it('accepts bounded campaign attribution and normalizes blank values away', () => {
    const result = contactSchema.safeParse({
      ...validEnquiry,
      landingPath: '/en/programmes/act',
      utmSource: ' instagram ',
      utmMedium: 'paid_social',
      utmCampaign: 'august-psychology',
      utmContent: 'reel-03',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        landingPath: '/en/programmes/act',
        utmSource: 'instagram',
        utmMedium: 'paid_social',
        utmCampaign: 'august-psychology',
        utmContent: 'reel-03',
      });
    }

    const blank = contactSchema.safeParse({
      ...validEnquiry,
      landingPath: '',
      utmSource: '   ',
    });
    expect(blank.success).toBe(true);
    if (blank.success) {
      expect(blank.data.landingPath).toBeUndefined();
      expect(blank.data.utmSource).toBeUndefined();
    }
  });

  it('rejects oversized campaign values and non-path landing context', () => {
    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        utmCampaign: 'x'.repeat(161),
      }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        landingPath: 'https://example.com/en/contact?utm_source=test',
      }).success,
    ).toBe(false);
  });

  it('requires a phone number for phone and WhatsApp follow-up', () => {
    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        preferredContact: 'PHONE',
        phone: '',
      }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        preferredContact: 'WHATSAPP',
        phone: '0555 12 34 56',
      }).success,
    ).toBe(true);
  });

  it('rejects missing city and oversized messages', () => {
    expect(contactSchema.safeParse({ ...validEnquiry, city: '' }).success).toBe(
      false,
    );
    expect(
      contactSchema.safeParse({
        ...validEnquiry,
        message: 'x'.repeat(2_001),
      }).success,
    ).toBe(false);
  });
});

describe('localeSchema', () => {
  it('accepts supported locales', () =>
    expect(localeSchema.parse('ar')).toBe('ar'));

  it('rejects unsupported locales', () =>
    expect(() => localeSchema.parse('de')).toThrow());
});
