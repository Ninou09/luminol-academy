import { readFile } from 'node:fs/promises';

import { getAttendanceCertificateCopy } from '@luminol/localization';
import { describe, expect, it } from 'vitest';

import { getProgrammeEnquiryCard } from './programme-enquiry-card';

const slug = 'acceptance-commitment-therapy-act';

describe('course enquiry presentation', () => {
  it.each(['ar', 'fr', 'en'] as const)(
    'uses the complete shared attendance scope in %s',
    (locale) => {
      const card = getProgrammeEnquiryCard(locale, slug);
      expect(card.certificate).toEqual(getAttendanceCertificateCopy(locale));
      expect(card.title).toBeTruthy();
      expect(card.guidance).toBeTruthy();
      expect(card.context).toBeTruthy();
    },
  );
  it.each(['ar', 'fr', 'en'] as const)(
    'opens a contextual %s enquiry rather than a booking',
    (locale) => {
      const card = getProgrammeEnquiryCard(locale, slug);
      expect(card.href).toBe(`/${locale}/contact?programme=${slug}`);
    },
  );
  it('keeps the ACT waitlist explicit without invented dates, prices or places', () => {
    const card = getProgrammeEnquiryCard('en', slug);
    expect(card.status).toBe('Next cohort · Waitlist');
    expect(card.action).toBe('Ask about next cohort');
    expect(card.guidance).toContain(
      'An enquiry is not a confirmed registration.',
    );
    expect(JSON.stringify(card)).not.toMatch(
      /\b(?:DZD|USD|EUR|seats left|enrol now)\b/,
    );
  });
  it('does not apply the ACT waitlist to other programmes', () => {
    const card = getProgrammeEnquiryCard('en', 'another-published-course');
    expect(card.action).toBe('Ask about this programme');
    expect(card.status).toBeNull();
    expect(card.href).toContain('programme=another-published-course');
  });
  it('encodes programme context instead of allowing extra URL parameters', () => {
    const card = getProgrammeEnquiryCard(
      'en',
      'course&redirect=https://example.invalid',
    );
    expect(card.href).toBe(
      '/en/contact?programme=course%26redirect%3Dhttps%3A%2F%2Fexample.invalid',
    );
  });
  it('renders the shared scope, named region and descriptive enquiry link', async () => {
    const source = await readFile(
      new URL('../components/programme-enquiry-card.tsx', import.meta.url),
      'utf8',
    );
    expect(source).toContain('aria-labelledby="programme-enquiry-title"');
    expect(source).toContain('aria-describedby="programme-enquiry-guidance"');
    expect(source).toContain('{card.certificate.scope}');
    expect(source).toContain('href={card.href}');
    expect(source).not.toContain('<form');
  });
  it('mounts the card without changing programme-media publication conditions', async () => {
    const source = await readFile(
      new URL('../app/programmes/[slug]/page.tsx', import.meta.url),
      'utf8',
    );
    expect(source).toContain('<ProgrammeEnquiryCard');
    expect(source).toContain('programmeSlug={programme.slug.current}');
    expect(source).toContain('!isWaitlist && programme.image');
    expect(source).toContain('buildSanityProgrammeImageUrl(programme.image)');
    expect(source).toContain('alt={programme.image.alt}');
  });
});
