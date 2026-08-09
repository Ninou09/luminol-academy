import type { Locale } from '@luminol/localization';
import { describe, expect, it } from 'vitest';

import { getAdminCopy, getAdminEnumLabel } from './admin-localization';

const locales: Locale[] = ['ar', 'fr', 'en'];

describe('administration localization', () => {
  it('provides complete visible administration copy for every locale', () => {
    for (const locale of locales) {
      const copy = getAdminCopy(locale);
      expect(copy.metadata.title.length).toBeGreaterThan(0);
      expect(copy.shell.administration.length).toBeGreaterThan(0);
      expect(copy.dashboard.title.length).toBeGreaterThan(0);
      expect(copy.search.title.length).toBeGreaterThan(0);
      expect(copy.finance.title.length).toBeGreaterThan(0);
      expect(copy.certificates.title.length).toBeGreaterThan(0);
      expect(copy.notifications.title.length).toBeGreaterThan(0);
    }
  });

  it('keeps localized administrative concepts distinct', () => {
    expect(getAdminCopy('ar').shell.search).not.toBe(getAdminCopy('fr').shell.search);
    expect(getAdminCopy('fr').dashboard.recentEnquiries).not.toBe(getAdminCopy('en').dashboard.recentEnquiries);
    expect(getAdminCopy('ar').finance.reconciliation).not.toBe(getAdminCopy('en').finance.reconciliation);
  });

  it('localizes operational enums used by protected pages', () => {
    expect(getAdminEnumLabel('ar', 'PSYCHOLOGY')).toBe('علم النفس');
    expect(getAdminEnumLabel('fr', 'TRAINING')).toBe('Formation professionnelle');
    expect(getAdminEnumLabel('ar', 'CONTACTED')).toBe('تم التواصل');
    expect(getAdminEnumLabel('fr', 'IN_REVIEW')).toBe('En examen');
    expect(getAdminEnumLabel('ar', 'RETRY_SCHEDULED')).toBe('إعادة المحاولة مجدولة');
    expect(getAdminEnumLabel('fr', 'SUPERSEDED')).toBe('Remplacé');
  });
});
