import { describe, expect, it } from 'vitest';

import { getIncompleteQualificationAttentionLabel } from './enquiry-attention-localization';

describe('enquiry attention localization', () => {
  it('provides incomplete qualification labels in every admin locale', () => {
    expect(getIncompleteQualificationAttentionLabel('en')).toBe(
      'Active with incomplete qualification',
    );
    expect(getIncompleteQualificationAttentionLabel('fr')).toBe(
      'Actives avec qualification incomplète',
    );
    expect(getIncompleteQualificationAttentionLabel('ar')).toBe(
      'نشطة ببيانات تأهيل غير مكتملة',
    );
  });
});
