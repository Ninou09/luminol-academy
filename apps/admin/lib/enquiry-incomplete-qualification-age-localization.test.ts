import { describe, expect, it } from 'vitest';

import { getIncompleteQualificationAgeCopy } from './enquiry-incomplete-qualification-age-localization';

describe('getIncompleteQualificationAgeCopy', () => {
  it('provides English copy and raw-count formatting', () => {
    const copy = getIncompleteQualificationAgeCopy('en');
    expect(copy.title).toBe('Incomplete qualification age');
    expect(copy.count('4')).toBe('4 enquiries with incomplete qualification');
  });

  it('provides French copy and raw-count formatting', () => {
    const copy = getIncompleteQualificationAgeCopy('fr');
    expect(copy.title).toBe('Âge des qualifications incomplètes');
    expect(copy.count('4')).toBe('4 demandes avec qualification incomplète');
  });

  it('provides Arabic copy and raw-count formatting', () => {
    const copy = getIncompleteQualificationAgeCopy('ar');
    expect(copy.title).toBe('عمر الطلبات ذات التأهيل غير المكتمل');
    expect(copy.count('4')).toBe('4 طلبات بتأهيل غير مكتمل');
  });
});
