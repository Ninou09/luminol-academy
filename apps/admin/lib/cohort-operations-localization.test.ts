import { describe, expect, it } from 'vitest';

import { getCohortOperationsCopy } from './cohort-operations-localization';

describe('cohort operations localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s copy',
    (locale) => {
      const copy = getCohortOperationsCopy(locale);
      expect(copy.title.length).toBeGreaterThan(4);
      expect(copy.assignInstructor.length).toBeGreaterThan(2);
      expect(copy.addOrMoveLearner.length).toBeGreaterThan(2);
      expect(copy.historyNotice.length).toBeGreaterThan(20);
    },
  );

  it('keeps Arabic and French surfaces localized', () => {
    expect(getCohortOperationsCopy('ar').title).toContain('المجموعات');
    expect(getCohortOperationsCopy('fr').title).toContain('Groupes');
  });
});
