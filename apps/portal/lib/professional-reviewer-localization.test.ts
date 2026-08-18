import { describe, expect, it } from 'vitest';

import { getProfessionalReviewerCopy } from './professional-reviewer-localization';

const locales = ['en', 'fr', 'ar'] as const;
const statuses = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
] as const;

describe('professional reviewer localization', () => {
  it.each(locales)('has complete reviewer copy for %s', (locale) => {
    const copy = getProfessionalReviewerCopy(locale);

    expect(copy.nav.trim()).not.toBe('');
    expect(copy.title.trim()).not.toBe('');
    expect(copy.privacyBody.trim()).not.toBe('');
    expect(copy.readOnlyBody.trim()).not.toBe('');
    expect(copy.noArtifact.trim()).not.toBe('');

    for (const status of statuses) {
      expect(copy.statuses[status].trim()).not.toBe('');
    }
  });

  it('localizes reviewer lifecycle labels', () => {
    const arabic = getProfessionalReviewerCopy('ar');
    const french = getProfessionalReviewerCopy('fr');

    expect(arabic.statuses.IN_REVIEW).not.toBe('IN_REVIEW');
    expect(french.statuses.REVISION_REQUIRED).not.toBe('REVISION_REQUIRED');
  });
});
