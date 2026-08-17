import { describe, expect, it } from 'vitest';

import { getInstructorWorkspaceCopy } from './instructor-workspace-localization';

describe('instructor workspace localization', () => {
  it.each(['en', 'fr', 'ar'] as const)('provides complete %s copy', (locale) => {
    const copy = getInstructorWorkspaceCopy(locale);

    expect(copy.nav).toBeTruthy();
    expect(copy.title).toBeTruthy();
    expect(copy.intro).toBeTruthy();
    expect(copy.roles.LEAD).toBeTruthy();
    expect(copy.roles.ASSISTANT).toBeTruthy();
    expect(copy.roles.REVIEWER).toBeTruthy();
    expect(copy.statuses.ACTIVE).toBeTruthy();
    expect(copy.privacyBody).toBeTruthy();
  });

  it('keeps Arabic labels localized', () => {
    const copy = getInstructorWorkspaceCopy('ar');

    expect(copy.nav).toBe('المدرّس');
    expect(copy.title).toBe('مجموعات المدرّس');
    expect(copy.roles.LEAD).toBe('المدرّس الرئيسي');
  });

  it('states the persisted-assignment and sensitive-data boundaries', () => {
    const copy = getInstructorWorkspaceCopy('en');

    expect(copy.intro).toContain('persisted assignments');
    expect(copy.privacyBody).toContain('exact persisted instructor assignment');
    expect(copy.privacyBody).toContain('does not expose psychology content');
    expect(copy.privacyBody).toContain('does not grant academy administration');
  });
});
