import { describe, expect, it } from 'vitest';

import { getEnquiryOutcomeCoverageCopy } from './enquiry-outcome-coverage-localization';

describe('enquiry outcome coverage localization', () => {
  it('frames outcome coverage as operational completeness in every locale', () => {
    expect(getEnquiryOutcomeCoverageCopy('en')).toMatchObject({
      title: '30-day enquiry outcome-recording coverage',
      recorded: 'Outcome recorded',
      missing: 'Outcome missing',
      coverage: 'Outcome-recording coverage',
    });
    expect(getEnquiryOutcomeCoverageCopy('fr')).toMatchObject({
      title: 'Couverture de saisie des résultats sur 30 jours',
      recorded: 'Résultat enregistré',
      missing: 'Résultat manquant',
      coverage: 'Couverture de saisie des résultats',
    });
    expect(getEnquiryOutcomeCoverageCopy('ar')).toMatchObject({
      title: 'اكتمال تسجيل نتائج الطلبات خلال 30 يومًا',
      recorded: 'تم تسجيل النتيجة',
      missing: 'النتيجة غير مكتملة',
      coverage: 'اكتمال تسجيل النتائج',
    });
  });

  it('formats recorded and closed counts without classifying the outcome text', () => {
    expect(getEnquiryOutcomeCoverageCopy('en').recordedOfClosed('7', '10')).toBe(
      '7 of 10 closed',
    );
  });
});
