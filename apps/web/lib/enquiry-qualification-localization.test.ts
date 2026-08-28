import { describe, expect, it } from 'vitest';

import { getEnquiryQualificationCopy } from './enquiry-qualification-localization';

describe('enquiry qualification localization', () => {
  it('keeps routing questions available in every public locale', () => {
    expect(getEnquiryQualificationCopy('en')).toMatchObject({
      city: 'City / area',
      preferredContact: 'Preferred contact',
      deliveryPreference: 'Preferred format',
      timingPreference: 'Preferred timing',
      contactWhatsapp: 'WhatsApp',
    });
    expect(getEnquiryQualificationCopy('fr')).toMatchObject({
      city: 'Ville / région',
      preferredContact: 'Moyen de contact préféré',
      deliveryPreference: 'Format préféré',
      timingPreference: 'Délai souhaité',
      contactWhatsapp: 'WhatsApp',
    });
    expect(getEnquiryQualificationCopy('ar')).toMatchObject({
      city: 'المدينة / المنطقة',
      preferredContact: 'وسيلة التواصل المفضلة',
      deliveryPreference: 'طريقة الحضور المفضلة',
      timingPreference: 'التوقيت المفضل',
      contactWhatsapp: 'واتساب',
    });
  });
});
