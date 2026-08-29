import { describe, expect, it } from 'vitest';

import { getEnquiryWorkflowCopy } from './enquiry-workflow-localization';

describe('enquiry workflow coverage localization', () => {
  it('labels workflow completeness without conversion or lead-quality framing', () => {
    expect(getEnquiryWorkflowCopy('en')).toMatchObject({
      title: '30-day enquiry workflow coverage',
      ownerCoverage: 'Assigned owner',
      followUpCoverage: 'Follow-up plan',
      qualificationCoverage: 'Structured qualification',
    });
    expect(getEnquiryWorkflowCopy('fr')).toMatchObject({
      title: 'Couverture du suivi des demandes sur 30 jours',
      ownerCoverage: 'Responsable attribué',
      followUpCoverage: 'Plan de suivi',
      qualificationCoverage: 'Qualification structurée',
    });
    expect(getEnquiryWorkflowCopy('ar')).toMatchObject({
      title: 'اكتمال متابعة الطلبات خلال 30 يومًا',
      ownerCoverage: 'مسؤول محدد',
      followUpCoverage: 'خطة متابعة',
      qualificationCoverage: 'تأهيل منظم مكتمل',
    });
  });

  it('formats covered and active counts in every locale', () => {
    expect(getEnquiryWorkflowCopy('en').coveredOfActive('7', '10')).toBe(
      '7 of 10 active',
    );
    expect(getEnquiryWorkflowCopy('fr').coveredOfActive('7', '10')).toBe(
      '7 sur 10 actives',
    );
    expect(getEnquiryWorkflowCopy('ar').coveredOfActive('7', '10')).toBe(
      '7 من 10 طلبات نشطة',
    );
  });
});
