import { describe, expect, it } from 'vitest';

import { getEnquiryProgrammeMixCopy } from './enquiry-programme-mix-localization';

describe('verified programme enquiry mix localization', () => {
  it('labels the protected programme mix in every admin locale', () => {
    expect(getEnquiryProgrammeMixCopy('en')).toMatchObject({
      eyebrow: 'Verified programme context',
      title: 'Programme enquiry mix',
    });
    expect(getEnquiryProgrammeMixCopy('fr')).toMatchObject({
      eyebrow: 'Contexte programme vérifié',
      title: 'Répartition des demandes par programme',
    });
    expect(getEnquiryProgrammeMixCopy('ar')).toMatchObject({
      eyebrow: 'سياق برنامج موثّق',
      title: 'توزيع الطلبات حسب البرنامج',
    });
  });

  it('formats enquiry counts without conversion or quality claims', () => {
    expect(getEnquiryProgrammeMixCopy('en').enquiryCount('4')).toBe(
      '4 enquiries',
    );
    expect(getEnquiryProgrammeMixCopy('fr').enquiryCount('4')).toBe(
      '4 demandes',
    );
    expect(getEnquiryProgrammeMixCopy('ar').enquiryCount('٤')).toBe(
      '٤ طلبات',
    );
  });
});
