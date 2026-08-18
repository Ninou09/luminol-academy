import { describe, expect, it } from 'vitest';

import { getProfessionalSubmissionCopy } from './professional-submission-localization';

const locales = ['en', 'fr', 'ar'] as const;
const statuses = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
] as const;

describe('professional submission localization', () => {
  it.each(locales)('provides complete learner project copy for %s', (locale) => {
    const copy = getProfessionalSubmissionCopy(locale);

    expect(copy.nav.trim()).not.toBe('');
    expect(copy.title.trim()).not.toBe('');
    expect(copy.privacyBody.trim()).not.toBe('');
    expect(copy.submit.trim()).not.toBe('');
    expect(copy.resubmit.trim()).not.toBe('');

    for (const status of statuses) {
      expect(copy.statuses[status].trim()).not.toBe('');
    }
  });

  it('keeps learner-facing copy localized instead of exposing lifecycle keys', () => {
    expect(getProfessionalSubmissionCopy('ar').statuses.REVISION_REQUIRED).not.toBe(
      'REVISION_REQUIRED',
    );
    expect(getProfessionalSubmissionCopy('fr').statuses.IN_REVIEW).not.toBe(
      'IN_REVIEW',
    );
  });
});
