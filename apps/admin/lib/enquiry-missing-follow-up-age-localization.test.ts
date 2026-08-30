import { describe, expect, it } from 'vitest';

import { getMissingFollowUpPlanAgeCopy } from './enquiry-missing-follow-up-age-localization';

describe('getMissingFollowUpPlanAgeCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s missing-follow-up-age copy',
    (locale) => {
      const copy = getMissingFollowUpPlanAgeCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(40);
      expect(copy.under24Hours.length).toBeGreaterThan(0);
      expect(copy.oneToThreeDays.length).toBeGreaterThan(0);
      expect(copy.fourToSevenDays.length).toBeGreaterThan(0);
      expect(copy.overSevenDays.length).toBeGreaterThan(0);
      expect(copy.count('7')).toContain('7');
    },
  );

  it('keeps English framing limited to recorded workflow backlog context', () => {
    const copy = getMissingFollowUpPlanAgeCopy('en');

    expect(copy.intro).toContain('no complete recorded follow-up plan');
    expect(copy.intro).toContain('not urgency');
    expect(copy.intro).toContain('lead quality');
  });
});
