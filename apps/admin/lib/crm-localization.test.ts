import {
  crmActivityDirections,
  crmActivityOutcomes,
  crmActivityTypes,
} from '@luminol/validation/crm-activities';
import { describe, expect, it } from 'vitest';

import {
  crmFeedbackCodes,
  getCrmCopy,
  parseCrmFeedback,
} from './crm-localization';

describe('CRM localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'covers activity types, directions, outcomes and feedback in %s',
    (locale) => {
      const copy = getCrmCopy(locale);
      expect(copy.summaryHint).toBeTruthy();
      for (const type of crmActivityTypes) {
        expect(copy.activityTypeLabel[type]).toBeTruthy();
      }
      for (const direction of crmActivityDirections) {
        expect(copy.directionLabel[direction]).toBeTruthy();
      }
      for (const outcome of crmActivityOutcomes) {
        expect(copy.outcomeLabel[outcome]).toBeTruthy();
      }
      for (const code of crmFeedbackCodes) {
        expect(copy.feedback[code]).toBeTruthy();
      }
      expect(copy.timelineTitle.status('A', 'B')).toContain('B');
    },
  );

  it('parses only known feedback codes', () => {
    expect(parseCrmFeedback('consent-required')).toBe('consent-required');
    expect(parseCrmFeedback('drop table')).toBeNull();
  });
});
