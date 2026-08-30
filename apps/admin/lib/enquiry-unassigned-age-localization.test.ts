import { describe, expect, it } from 'vitest';

import { getUnassignedEnquiryAgeCopy } from './enquiry-unassigned-age-localization';

describe('getUnassignedEnquiryAgeCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s unassigned-age copy',
    (locale) => {
      const copy = getUnassignedEnquiryAgeCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(30);
      expect(copy.total.length).toBeGreaterThan(0);
      expect(copy.under24Hours.length).toBeGreaterThan(0);
      expect(copy.oneToThreeDays.length).toBeGreaterThan(0);
      expect(copy.fourToSevenDays.length).toBeGreaterThan(0);
      expect(copy.overSevenDays.length).toBeGreaterThan(0);
      expect(copy.count('6')).toContain('6');
    },
  );

  it('frames the English panel as workflow backlog rather than urgency or quality', () => {
    const copy = getUnassignedEnquiryAgeCopy('en');

    expect(copy.intro).toContain('operational backlog');
    expect(copy.intro).toContain('not urgency');
    expect(copy.intro).toContain('lead quality');
  });
});
