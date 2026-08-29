import { describe, expect, it } from 'vitest';

import { getRecentEnquiryStatusMixCopy } from './enquiry-recent-status-mix-localization';

describe('getRecentEnquiryStatusMixCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s recent-status copy',
    (locale) => {
      const copy = getRecentEnquiryStatusMixCopy(locale);

      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(20);
      expect(copy.noData.length).toBeGreaterThan(0);
      expect(copy.count('9')).toContain('9');
    },
  );

  it('keeps closed status separate from conversion and treatment-success claims', () => {
    const copy = getRecentEnquiryStatusMixCopy('en');

    expect(copy.intro).toContain('does not imply a sale');
    expect(copy.intro).toContain('treatment success');
    expect(copy.intro).toContain('does not measure conversion');
  });
});
