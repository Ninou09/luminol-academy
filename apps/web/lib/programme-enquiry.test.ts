import { describe, expect, it } from 'vitest';

import {
  getProgrammeEnquiryDefaults,
  getProgrammeSlugFromPathname,
} from './programme-enquiry';

const actProgramme = {
  school: 'psychology',
  slug: { current: 'acceptance-commitment-therapy-act' },
  title: 'العلاج بالتقبل والالتزام ACT',
} as const;

describe('getProgrammeEnquiryDefaults', () => {
  it.each([
    [
      'en',
      "I'd like to register my interest in the next cohort of العلاج بالتقبل والالتزام ACT.",
    ],
    [
      'fr',
      'Je souhaite signaler mon intérêt pour la prochaine cohorte de العلاج بالتقبل والالتزام ACT.',
    ],
    [
      'ar',
      'أرغب في تسجيل اهتمامي بالفوج القادم لبرنامج العلاج بالتقبل والالتزام ACT.',
    ],
  ] as const)('localizes ACT waitlist interest for %s', (locale, message) => {
    expect(getProgrammeEnquiryDefaults(locale, actProgramme)).toEqual({
      school: 'PSYCHOLOGY',
      message,
    });
  });

  it('uses the programme school and generic interest copy for non-waitlist programmes', () => {
    expect(
      getProgrammeEnquiryDefaults('en', {
        school: 'languages',
        slug: { current: 'english-conversation' },
        title: 'English Conversation',
      }),
    ).toEqual({
      school: 'LANGUAGES',
      message: "I'd like to know more about English Conversation.",
    });
  });
});

describe('getProgrammeSlugFromPathname', () => {
  it.each([
    ['/en/programmes/acceptance-commitment-therapy-act', 'acceptance-commitment-therapy-act'],
    ['/fr/programmes/english-conversation/', 'english-conversation'],
    ['/ar/programmes/act-101', 'act-101'],
  ] as const)('extracts a safe localized programme slug from %s', (pathname, slug) => {
    expect(getProgrammeSlugFromPathname(pathname)).toBe(slug);
  });

  it.each([
    '/en/programmes',
    '/en/contact',
    '/en/programmes/../draft',
    '/de/programmes/english-conversation',
    '/en/programmes/English-Conversation',
  ])('fails closed for non-programme or unsafe path %s', (pathname) => {
    expect(getProgrammeSlugFromPathname(pathname)).toBeNull();
  });
});
