import {
  officePaymentMethods,
  officePaymentPurposes,
} from '@luminol/validation/office-payments';
import { describe, expect, it } from 'vitest';

import { officePaymentFeedbackCodes } from './office-payment-scope';
import { getOfficePaymentsCopy } from './office-payments-localization';

describe('office payments localization', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'covers methods, purposes and feedback in %s',
    (locale) => {
      const copy = getOfficePaymentsCopy(locale);
      expect(copy.boundary).toBeTruthy();
      for (const method of officePaymentMethods) {
        expect(copy.method[method]).toBeTruthy();
      }
      for (const purpose of officePaymentPurposes) {
        expect(copy.purpose[purpose]).toBeTruthy();
      }
      for (const code of officePaymentFeedbackCodes) {
        expect(copy.feedback[code]).toBeTruthy();
      }
    },
  );
});
