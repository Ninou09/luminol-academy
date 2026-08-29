import { describe, expect, it } from 'vitest';

import { getEnquiryAgeCopy } from './enquiry-age-localization';

describe('enquiry age localization', () => {
  it('frames the metric as operational backlog context in every locale', () => {
    expect(getEnquiryAgeCopy('en')).toMatchObject({
      title: 'Active enquiry age',
      under24Hours: 'Under 24 hours',
      overSevenDays: 'Over 7 days',
    });
    expect(getEnquiryAgeCopy('fr')).toMatchObject({
      title: 'Âge des demandes actives',
      under24Hours: 'Moins de 24 heures',
      overSevenDays: 'Plus de 7 jours',
    });
    expect(getEnquiryAgeCopy('ar')).toMatchObject({
      title: 'عمر الطلبات النشطة',
      under24Hours: 'أقل من 24 ساعة',
      overSevenDays: 'أكثر من 7 أيام',
    });
  });

  it('keeps count copy raw and operational', () => {
    expect(getEnquiryAgeCopy('en').count('4')).toBe('4 active enquiries');
    expect(getEnquiryAgeCopy('fr').count('4')).toBe('4 demandes actives');
    expect(getEnquiryAgeCopy('ar').count('4')).toBe('4 طلبات نشطة');
  });
});
