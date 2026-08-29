import { describe, expect, it } from 'vitest';

import { getEnquiryFollowUpTimingCopy } from './enquiry-follow-up-timing-localization';

describe('enquiry follow-up timing localization', () => {
  it('labels the operational schedule in every locale', () => {
    expect(getEnquiryFollowUpTimingCopy('en')).toMatchObject({
      title: 'Active enquiry follow-up timing',
      missingPlan: 'Missing complete plan',
      next24Hours: 'Next 24 hours',
    });
    expect(getEnquiryFollowUpTimingCopy('fr')).toMatchObject({
      title: 'Calendrier de suivi des demandes actives',
      missingPlan: 'Plan complet manquant',
      next24Hours: 'Prochaines 24 heures',
    });
    expect(getEnquiryFollowUpTimingCopy('ar')).toMatchObject({
      title: 'توقيت متابعة الطلبات النشطة',
      missingPlan: 'خطة كاملة مفقودة',
      next24Hours: 'خلال 24 ساعة القادمة',
    });
  });

  it('keeps counts raw and operational', () => {
    expect(getEnquiryFollowUpTimingCopy('en').count('3')).toBe(
      '3 active enquiries',
    );
    expect(getEnquiryFollowUpTimingCopy('fr').count('3')).toBe(
      '3 demandes actives',
    );
    expect(getEnquiryFollowUpTimingCopy('ar').count('3')).toBe('3 طلبات نشطة');
  });
});
