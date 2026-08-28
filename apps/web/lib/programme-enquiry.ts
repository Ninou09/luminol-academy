import type { Locale } from '@luminol/localization';

import type { PublicProgrammeDetail } from './programme-detail';
import { isProgrammeWaitlist } from './programme-presentation';

export type PublicEnquirySchool =
  | 'GENERAL'
  | 'PSYCHOLOGY'
  | 'LANGUAGES'
  | 'TRAINING';

const SCHOOL_TO_ENQUIRY = {
  psychology: 'PSYCHOLOGY',
  languages: 'LANGUAGES',
  training: 'TRAINING',
} as const satisfies Record<
  PublicProgrammeDetail['school'],
  Exclude<PublicEnquirySchool, 'GENERAL'>,
>;

const INTEREST_COPY = {
  en: {
    programme: (title: string) => `I'd like to know more about ${title}.`,
    waitlist: (title: string) =>
      `I'd like to register my interest in the next cohort of ${title}.`,
  },
  fr: {
    programme: (title: string) => `Je souhaite en savoir plus sur ${title}.`,
    waitlist: (title: string) =>
      `Je souhaite signaler mon intérêt pour la prochaine cohorte de ${title}.`,
  },
  ar: {
    programme: (title: string) => `أرغب في معرفة المزيد عن برنامج ${title}.`,
    waitlist: (title: string) =>
      `أرغب في تسجيل اهتمامي بالفوج القادم لبرنامج ${title}.`,
  },
} as const satisfies Record<
  Locale,
  {
    programme: (title: string) => string;
    waitlist: (title: string) => string;
  },
>;

export function getProgrammeEnquiryDefaults(
  locale: Locale,
  programme: Pick<PublicProgrammeDetail, 'school' | 'slug' | 'title'>,
): { school: PublicEnquirySchool; message: string } {
  const title = programme.title.trim();
  const copy = INTEREST_COPY[locale];

  return {
    school: SCHOOL_TO_ENQUIRY[programme.school],
    message: isProgrammeWaitlist(programme.slug.current)
      ? copy.waitlist(title)
      : copy.programme(title),
  };
}

export function getProgrammeSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(
    /^\/(?:ar|fr|en)\/programmes\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/,
  );
  return match?.[1] ?? null;
}
