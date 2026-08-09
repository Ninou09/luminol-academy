import { describe, expect, it } from 'vitest';

import type { Locale } from '@luminol/localization';
import {
  getLessonTypeLabel,
  getPortalCopy,
  getPortalStatusLabel,
  getSkillLabel,
} from './portal-localization';

const locales: Locale[] = ['ar', 'fr', 'en'];

describe('learner portal localization', () => {
  it('provides complete core navigation and learner copy for every locale', () => {
    for (const locale of locales) {
      const copy = getPortalCopy(locale);
      expect(copy.shell.portal.length).toBeGreaterThan(0);
      expect(copy.shell.search.length).toBeGreaterThan(0);
      expect(copy.dashboard.myProgrammes.length).toBeGreaterThan(0);
      expect(copy.search.title.length).toBeGreaterThan(0);
      expect(copy.account.title.length).toBeGreaterThan(0);
      expect(copy.notifications.title.length).toBeGreaterThan(0);
      expect(copy.finance.title.length).toBeGreaterThan(0);
      expect(copy.course.resume.length).toBeGreaterThan(0);
      expect(copy.lesson.completeContinue.length).toBeGreaterThan(0);
      expect(copy.languages.title.length).toBeGreaterThan(0);
      expect(copy.placement.result.length).toBeGreaterThan(0);
    }
  });

  it('keeps the three interface languages meaningfully distinct', () => {
    expect(getPortalCopy('ar').dashboard.welcome).not.toBe(
      getPortalCopy('fr').dashboard.welcome,
    );
    expect(getPortalCopy('fr').search.action).not.toBe(
      getPortalCopy('en').search.action,
    );
  });

  it('localizes governed system labels with deterministic fallbacks', () => {
    expect(getPortalStatusLabel('ar', 'COMPLETED')).toBe('مكتمل');
    expect(getLessonTypeLabel('fr', 'VIDEO')).toBe('Vidéo');
    expect(getSkillLabel('en', 'LISTENING')).toBe('Listening');
    expect(getPortalStatusLabel('en', 'CUSTOM_STATUS')).toBe('Custom status');
  });
});
