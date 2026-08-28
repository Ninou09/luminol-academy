import { describe, expect, it } from 'vitest';

import { getEnquiryDeskCopy } from './enquiry-desk-localization';

describe('enquiry desk localization', () => {
  it('keeps follow-up and ownership actions available in every admin locale', () => {
    expect(getEnquiryDeskCopy('en')).toMatchObject({
      title: 'Enquiry follow-up desk',
      email: 'Email',
      call: 'Call',
      owner: 'Owner',
      assignToMe: 'Assign to me',
      unassign: 'Unassign',
    });
    expect(getEnquiryDeskCopy('fr')).toMatchObject({
      title: 'Suivi des demandes',
      email: 'E-mail',
      call: 'Appeler',
      owner: 'Responsable',
      assignToMe: 'Me l’attribuer',
      unassign: 'Désattribuer',
    });
    expect(getEnquiryDeskCopy('ar')).toMatchObject({
      title: 'مكتب متابعة الطلبات',
      email: 'البريد الإلكتروني',
      call: 'اتصال',
      owner: 'مسؤول المتابعة',
      assignToMe: 'إسناده إليّ',
      unassign: 'إلغاء الإسناد',
    });
  });
});
