import { describe, expect, it } from 'vitest';

import {
  getEnquiryContactPreferenceLabel,
  getEnquiryDeliveryPreferenceLabel,
  getEnquiryDeskCopy,
  getEnquiryTimingPreferenceLabel,
} from './enquiry-desk-localization';

describe('enquiry desk localization', () => {
  it('keeps ownership, qualification and next-action controls available in every admin locale', () => {
    expect(getEnquiryDeskCopy('en')).toMatchObject({
      title: 'Enquiry follow-up desk',
      owner: 'Owner',
      city: 'City / area',
      preferredContact: 'Preferred contact',
      deliveryPreference: 'Preferred format',
      timingPreference: 'Preferred timing',
      nextAction: 'Next action',
      dueToday: 'Due today',
      saveFollowUp: 'Save follow-up',
      outcome: 'Operational outcome',
      saveOutcome: 'Save outcome',
      unassignedActive: 'Active & unassigned',
      closedWithoutOutcome: 'Closed without outcome',
      filterByOwner: 'Filter by owner',
      myEnquiries: 'Assigned to me',
    });
    expect(getEnquiryDeskCopy('fr')).toMatchObject({
      title: 'Suivi des demandes',
      owner: 'Responsable',
      city: 'Ville / région',
      preferredContact: 'Contact préféré',
      deliveryPreference: 'Format préféré',
      timingPreference: 'Délai souhaité',
      nextAction: 'Prochaine action',
      dueToday: 'À faire aujourd’hui',
      saveFollowUp: 'Enregistrer le suivi',
      outcome: 'Résultat opérationnel',
      saveOutcome: 'Enregistrer le résultat',
      unassignedActive: 'Actives non attribuées',
      closedWithoutOutcome: 'Clôturées sans résultat',
      filterByOwner: 'Filtrer par responsable',
      myEnquiries: 'Attribuées à moi',
    });
    expect(getEnquiryDeskCopy('ar')).toMatchObject({
      title: 'مكتب متابعة الطلبات',
      owner: 'مسؤول المتابعة',
      city: 'المدينة / المنطقة',
      preferredContact: 'وسيلة التواصل المفضلة',
      deliveryPreference: 'طريقة الحضور المفضلة',
      timingPreference: 'التوقيت المفضل',
      nextAction: 'الخطوة التالية',
      dueToday: 'مستحق اليوم',
      saveFollowUp: 'حفظ المتابعة',
      outcome: 'النتيجة التشغيلية',
      saveOutcome: 'حفظ النتيجة',
      unassignedActive: 'نشطة وغير مسندة',
      closedWithoutOutcome: 'مغلقة دون نتيجة',
      filterByOwner: 'التصفية حسب المسؤول',
      myEnquiries: 'مسندة إليّ',
    });
  });

  it('localizes structured qualification values and legacy fallbacks', () => {
    expect(getEnquiryContactPreferenceLabel('en', 'WHATSAPP')).toBe('WhatsApp');
    expect(getEnquiryDeliveryPreferenceLabel('fr', 'IN_PERSON')).toBe(
      'En présentiel',
    );
    expect(getEnquiryTimingPreferenceLabel('ar', 'WITHIN_MONTH')).toBe(
      'خلال شهر',
    );
    expect(getEnquiryContactPreferenceLabel('en', null)).toBe('Not provided');
  });
});
