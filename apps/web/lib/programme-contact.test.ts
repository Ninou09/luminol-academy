import { describe, expect, it } from 'vitest';

import { buildProgrammeContactHref } from './programme-contact';

describe('programme contact hrefs', () => {
  it('preserves the programme slug across localized contact routes', () => {
    expect(buildProgrammeContactHref('en', 'example-programme')).toBe(
      '/contact?programme=example-programme',
    );
    expect(buildProgrammeContactHref('fr', 'example-programme')).toBe(
      '/fr/contact?programme=example-programme',
    );
    expect(buildProgrammeContactHref('ar', 'example-programme')).toBe(
      '/ar/contact?programme=example-programme',
    );
  });

  it('encodes unexpected slug characters rather than leaking raw query syntax', () => {
    expect(buildProgrammeContactHref('en', 'programme & cohort')).toBe(
      '/contact?programme=programme+%26+cohort',
    );
  });
});
