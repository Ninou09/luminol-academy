import { describe, expect, it } from 'vitest';

import { getEnquiryStatusMixCopy } from './enquiry-status-mix-localization';

describe('enquiry status mix localization', () => {
  it('frames the panel as workflow-state volume in every locale', () => {
    expect(getEnquiryStatusMixCopy('en')).toMatchObject({
      title: 'Active enquiry status mix',
      activeTotal: 'Active total',
    });
    expect(getEnquiryStatusMixCopy('fr')).toMatchObject({
      title: 'Répartition des statuts des demandes actives',
      activeTotal: 'Total actif',
    });
    expect(getEnquiryStatusMixCopy('ar')).toMatchObject({
      title: 'توزيع حالات الطلبات النشطة',
      activeTotal: 'إجمالي النشط',
    });
  });

  it('keeps counts raw and operational', () => {
    expect(getEnquiryStatusMixCopy('en').count('6')).toBe('6 active enquiries');
    expect(getEnquiryStatusMixCopy('fr').count('6')).toBe('6 demandes actives');
    expect(getEnquiryStatusMixCopy('ar').count('6')).toBe('6 طلبات نشطة');
  });
});
