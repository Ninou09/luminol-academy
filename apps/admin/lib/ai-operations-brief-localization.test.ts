import { describe, expect, it } from 'vitest';

import {
  getAiOperationsBriefCopy,
  getAiOperationsBriefItemText,
} from './ai-operations-brief-localization';

describe('getAiOperationsBriefCopy', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'provides complete %s AI Operator operations brief copy',
    (locale) => {
      const copy = getAiOperationsBriefCopy(locale);

      expect(copy.eyebrow).toContain('Luminol AI Operator');
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(80);
      expect(copy.mode.length).toBeGreaterThan(0);
      expect(copy.action.length).toBeGreaterThan(0);
      expect(copy.allClearTitle.length).toBeGreaterThan(0);
      expect(copy.allClearBody.length).toBeGreaterThan(30);

      const qualification = getAiOperationsBriefItemText(
        copy,
        {
          kind: 'qualificationGap',
          count: 3,
          qualificationGap: 'city',
          query: 'qualificationGap=city',
        },
        '3',
      );
      expect(qualification.title.length).toBeGreaterThan(0);
      expect(qualification.body).toContain('3');

      const attribution = getAiOperationsBriefItemText(
        copy,
        {
          kind: 'attributionGap',
          count: 4,
          attributionGap: 'utmSource',
          query: 'attributionGap=utmSource',
        },
        '4',
      );
      expect(attribution.title.length).toBeGreaterThan(0);
      expect(attribution.body).toContain('4');
    },
  );

  it('keeps English copy bounded to operational decision support', () => {
    const copy = getAiOperationsBriefCopy('en');

    expect(copy.intro).toContain('read-only operational brief');
    expect(copy.intro).toContain('same protected CRM and dashboard data');
    expect(copy.intro).toContain('does not infer intent');
    expect(copy.intro).toContain('clinical need');
    expect(copy.intro).toContain('campaign performance');
    expect(copy.intro).toContain('ROI');
  });
});
