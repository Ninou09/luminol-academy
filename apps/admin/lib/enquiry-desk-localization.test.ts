import { describe, expect, it } from 'vitest';

import { getEnquiryDeskCopy } from './enquiry-desk-localization';

describe('enquiry desk localization', () => {
  it('keeps follow-up actions available in every admin locale', () => {
    expect(getEnquiryDeskCopy('en')).toMatchObject({
      title: 'Enquiry follow-up desk',
      email: 'Email',
      call: 'Call',
    });
    expect(getEnquiryDeskCopy('fr')).toMatchObject({
      title: 'Suivi des demandes',
      email: 'E-mail',
      call: 'Appeler',
    });
    expect(getEnquiryDeskCopy('ar')).toMatchObject({
      title: 'مكتب متابعة الطلبات',
      email: 'البريد الإلكتروني',
      call: 'اتصال',
    });
  });
});
