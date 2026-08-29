import { describe, expect, it } from 'vitest';

import { getEnquiryAttributionCopy } from './enquiry-attribution-localization';

describe('enquiry campaign attribution localization', () => {
  it('labels protected attribution fields in every admin locale', () => {
    expect(getEnquiryAttributionCopy('en')).toMatchObject({
      campaignAttribution: 'Campaign attribution',
      landingPath: 'Landing path',
    });
    expect(getEnquiryAttributionCopy('fr')).toMatchObject({
      campaignAttribution: 'Attribution de campagne',
      landingPath: 'Page d’arrivée',
    });
    expect(getEnquiryAttributionCopy('ar')).toMatchObject({
      campaignAttribution: 'إسناد الحملة',
      landingPath: 'مسار صفحة الوصول',
    });
  });
});
