import { describe, expect, it } from 'vitest';

import { getEnquiryDeskCopy } from './enquiry-desk-localization';

describe('enquiry desk localization', () => {
  it('keeps ownership and next-action follow-up controls available in every admin locale', () => {
    expect(getEnquiryDeskCopy('en')).toMatchObject({
      title: 'Enquiry follow-up desk',
      owner: 'Owner',
      assignToMe: 'Assign to me',
      nextAction: 'Next action',
      dueToday: 'Due today',
      overdue: 'Overdue',
      saveFollowUp: 'Save follow-up',
    });
    expect(getEnquiryDeskCopy('fr')).toMatchObject({
      title: 'Suivi des demandes',
      owner: 'Responsable',
      assignToMe: 'Me l’attribuer',
      nextAction: 'Prochaine action',
      dueToday: 'À faire aujourd’hui',
      overdue: 'En retard',
      saveFollowUp: 'Enregistrer le suivi',
    });
    expect(getEnquiryDeskCopy('ar')).toMatchObject({
      title: 'مكتب متابعة الطلبات',
      owner: 'مسؤول المتابعة',
      assignToMe: 'إسناده إليّ',
      nextAction: 'الخطوة التالية',
      dueToday: 'مستحق اليوم',
      overdue: 'متأخر',
      saveFollowUp: 'حفظ المتابعة',
    });
  });
});
