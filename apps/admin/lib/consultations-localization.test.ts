import {
  consultationModes,
  consultationStatuses,
} from '@luminol/validation/consultations';
import { describe, expect, it } from 'vitest';

import { consultationFeedbackCodes } from './consultation-scope';
import {
  getClientsCopy,
  getConsultationsCopy,
} from './consultations-localization';

describe('consultation localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'covers every status, mode and feedback code in %s',
    (locale) => {
      const copy = getConsultationsCopy(locale);
      const clients = getClientsCopy(locale);

      expect(copy.boundary).toBeTruthy();
      expect(clients.boundary).toBeTruthy();
      for (const status of consultationStatuses) {
        expect(copy.status[status]).toBeTruthy();
        expect(copy.moveTo[status]).toBeTruthy();
      }
      for (const mode of consultationModes) {
        expect(copy.mode[mode]).toBeTruthy();
      }
      for (const code of consultationFeedbackCodes) {
        expect(copy.feedback[code]).toBeTruthy();
        expect(clients.feedback[code]).toBeTruthy();
      }
    },
  );

  it('states the non-clinical boundary in English', () => {
    expect(getConsultationsCopy('en').boundary).toContain('clinical');
  });
});
