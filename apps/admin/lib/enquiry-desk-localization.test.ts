import { describe, expect, it } from 'vitest';

import {
  getEnquiryAuditActionLabel,
  getEnquiryContactPreferenceLabel,
  getEnquiryDeliveryPreferenceLabel,
  getEnquiryDeskCopy,
  getEnquiryFirstResponseStepLabel,
  getEnquiryTimingPreferenceLabel,
} from './enquiry-desk-localization';

describe('enquiry desk localization', () => {
  it('keeps ownership, qualification and next-action controls available in every admin locale', () => {
    expect(getEnquiryDeskCopy('en')).toMatchObject({
      title: 'Enquiry follow-up desk',
      owner: 'Owner',
      city: 'City / area',
      programmeContext: 'Programme / offer',
      preferredContact: 'Preferred contact',
      deliveryPreference: 'Preferred format',
      timingPreference: 'Preferred timing',
      nextAction: 'Next action',
      dueToday: 'Due today',
      saveFollowUp: 'Save follow-up',
      outcome: 'Operational outcome',
      saveOutcome: 'Save outcome',
      unassignedActive: 'Active & unassigned',
      activeWithoutFollowUp: 'Active without follow-up',
      activeIncompleteQualification: 'Active with missing qualification',
      closedWithoutOutcome: 'Closed without outcome',
      filterByOwner: 'Filter by owner',
      myEnquiries: 'Assigned to me',
      firstResponseGuide: 'First-response guide',
      recentAuditChanges: 'Recent audited changes',
    });
    expect(getEnquiryDeskCopy('fr')).toMatchObject({
      title: 'Suivi des demandes',
      owner: 'Responsable',
      city: 'Ville / région',
      programmeContext: 'Programme / offre',
      preferredContact: 'Contact préféré',
      deliveryPreference: 'Format préféré',
      timingPreference: 'Délai souhaité',
      nextAction: 'Prochaine action',
      dueToday: 'À faire aujourd’hui',
      saveFollowUp: 'Enregistrer le suivi',
      outcome: 'Résultat opérationnel',
      saveOutcome: 'Enregistrer le résultat',
      unassignedActive: 'Actives non attribuées',
      activeWithoutFollowUp: 'Actives sans suivi planifié',
      activeIncompleteQualification: 'Actives avec qualification incomplète',
      closedWithoutOutcome: 'Clôturées sans résultat',
      filterByOwner: 'Filtrer par responsable',
      myEnquiries: 'Attribuées à moi',
      firstResponseGuide: 'Guide de première réponse',
      recentAuditChanges: 'Modifications auditées récentes',
    });
    expect(getEnquiryDeskCopy('ar')).toMatchObject({
      title: 'مكتب متابعة الطلبات',
      owner: 'مسؤول المتابعة',
      city: 'المدينة / المنطقة',
      programmeContext: 'البرنامج / العرض',
      preferredContact: 'وسيلة التواصل المفضلة',
      deliveryPreference: 'طريقة الحضور المفضلة',
      timingPreference: 'التوقيت المفضل',
      nextAction: 'الخطوة التالية',
      dueToday: 'مستحق اليوم',
      saveFollowUp: 'حفظ المتابعة',
      outcome: 'النتيجة التشغيلية',
      saveOutcome: 'حفظ النتيجة',
      unassignedActive: 'نشطة وغير مسندة',
      activeWithoutFollowUp: 'نشطة دون متابعة مجدولة',
      activeIncompleteQualification: 'نشطة ببيانات تأهيل ناقصة',
      closedWithoutOutcome: 'مغلقة دون نتيجة',
      filterByOwner: 'التصفية حسب المسؤول',
      myEnquiries: 'مسندة إليّ',
      firstResponseGuide: 'دليل الرد الأول',
      recentAuditChanges: 'أحدث التغييرات المدققة',
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

  it('localizes first-response channel guidance without generating message content', () => {
    expect(
      getEnquiryFirstResponseStepLabel('en', 'confirm-phone-permission'),
    ).toContain('confirm they agree');
    expect(
      getEnquiryFirstResponseStepLabel('fr', 'confirm-whatsapp-permission'),
    ).toContain('confirmez l’accord');
    expect(
      getEnquiryFirstResponseStepLabel('ar', 'schedule-follow-up'),
    ).toContain('تاريخ المتابعة');
  });

  it('localizes audit event actions in every admin locale', () => {
    expect(getEnquiryAuditActionLabel('en', 'status-changed')).toBe(
      'Status changed',
    );
    expect(getEnquiryAuditActionLabel('fr', 'follow-up-cleared')).toBe(
      'Suivi supprimé',
    );
    expect(getEnquiryAuditActionLabel('ar', 'outcome-recorded')).toBe(
      'تم تسجيل النتيجة',
    );
  });
});
