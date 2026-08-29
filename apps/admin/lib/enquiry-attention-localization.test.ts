import { describe, expect, it } from 'vitest';

import {
  getIncompleteQualificationAttentionLabel,
  getNoRecordedContactAttentionCopy,
} from './enquiry-attention-localization';

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

  it('explains no-recorded-contact semantics in every admin locale', () => {
    expect(getNoRecordedContactAttentionCopy('en')).toMatchObject({
      label: 'Active with no recorded contact',
    });
    expect(getNoRecordedContactAttentionCopy('en').note).toContain(
      'status history only',
    );
    expect(getNoRecordedContactAttentionCopy('en').note).toContain(
      'does not prove',
    );

    expect(getNoRecordedContactAttentionCopy('fr')).toMatchObject({
      label: 'Actives sans contact enregistré',
    });
    expect(getNoRecordedContactAttentionCopy('fr').note).toContain(
      'historique des statuts',
    );

    expect(getNoRecordedContactAttentionCopy('ar')).toMatchObject({
      label: 'نشطة بلا تواصل مسجل',
    });
    expect(getNoRecordedContactAttentionCopy('ar').note).toContain(
      'سجل الحالات',
    );
  });
});
