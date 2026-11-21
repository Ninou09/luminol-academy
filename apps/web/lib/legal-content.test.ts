import { describe, expect, it } from 'vitest';

import { LEGAL_DOCUMENTS, getLegalDocument } from './legal-content';

describe('public legal documents', () => {
  it('publishes privacy, terms, and booking information in every locale', () => {
    expect(LEGAL_DOCUMENTS).toEqual(['privacy', 'terms', 'booking']);

    for (const locale of ['ar', 'fr', 'en'] as const) {
      for (const document of LEGAL_DOCUMENTS) {
        const content = getLegalDocument(locale, document);
        expect(content.title.length).toBeGreaterThan(5);
        expect(content.intro.length).toBeGreaterThan(20);
        expect(content.sections.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('states the privacy boundary and attendance-certificate scope', () => {
    const privacy = getLegalDocument('en', 'privacy');
    const terms = getLegalDocument('en', 'terms');

    expect(JSON.stringify(privacy)).toContain('enquiry');
    expect(JSON.stringify(privacy)).toContain('authorized');
    expect(JSON.stringify(terms)).toContain('attendance');
    expect(JSON.stringify(terms)).not.toContain('accredited certificate');
  });
});
