import { describe, expect, it } from 'vitest';

import { buildEnquiryFirstResponseSteps } from './enquiry-first-response';

describe('enquiry first-response guidance', () => {
  it('keeps a fully qualified email enquiry concise and operational', () => {
    expect(
      buildEnquiryFirstResponseSteps({
        programmeTitleSnapshot: 'Verified programme',
        city: 'Blida',
        preferredContact: 'EMAIL',
        deliveryPreference: 'IN_PERSON',
        timingPreference: 'SOON',
        phone: null,
      }),
    ).toEqual([
      'acknowledge',
      'confirm-programme-objective',
      'agree-next-option',
      'use-email-preference',
      'schedule-follow-up',
    ]);
  });

  it('asks for missing qualification details without inventing them', () => {
    expect(
      buildEnquiryFirstResponseSteps({
        programmeTitleSnapshot: null,
        city: null,
        preferredContact: 'WHATSAPP',
        deliveryPreference: 'NOT_SURE',
        timingPreference: null,
        phone: null,
      }),
    ).toEqual([
      'acknowledge',
      'clarify-service-objective',
      'clarify-location',
      'clarify-format',
      'clarify-timing',
      'agree-next-option',
      'clarify-whatsapp-number',
      'schedule-follow-up',
    ]);
  });

  it('requires explicit channel permission before a phone follow-up', () => {
    const steps = buildEnquiryFirstResponseSteps({
      programmeTitleSnapshot: null,
      city: 'Algiers',
      preferredContact: 'PHONE',
      deliveryPreference: 'ONLINE',
      timingPreference: 'WITHIN_MONTH',
      phone: '+213000000000',
    });

    expect(steps).toContain('confirm-phone-permission');
    expect(steps).not.toContain('use-email-preference');
    expect(steps).not.toContain('confirm-whatsapp-permission');
  });
});
