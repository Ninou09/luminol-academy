import { describe, expect, it } from 'vitest';

import { getLearnerOutcomesCopy } from './learner-outcomes';

describe('learner outcomes localization', () => {
  it.each(['en', 'fr', 'ar'] as const)('provides complete %s copy', (locale) => {
    const copy = getLearnerOutcomesCopy(locale);

    expect(copy.nav).toBeTruthy();
    expect(copy.title).toBeTruthy();
    expect(copy.activeProgrammes).toBeTruthy();
    expect(copy.completedProgrammes).toBeTruthy();
    expect(copy.completedLessons).toBeTruthy();
    expect(copy.inProgressLessons).toBeTruthy();
    expect(copy.certificatesEarned).toBeTruthy();
    expect(copy.latestActivity).toBeTruthy();
    expect(copy.privacyBody).toBeTruthy();
  });

  it('keeps Arabic labels localized', () => {
    const copy = getLearnerOutcomesCopy('ar');

    expect(copy.nav).toBe('التقدّم');
    expect(copy.activeProgrammes).toBe('البرامج النشطة');
    expect(copy.latestActivity).toBe('آخر نشاط تعليمي');
  });

  it('states the non-scoring and privacy boundaries', () => {
    expect(getLearnerOutcomesCopy('en').intro).toContain('not a score');
    expect(getLearnerOutcomesCopy('en').privacyBody).toContain(
      'does not use assessment answers',
    );
  });
});
