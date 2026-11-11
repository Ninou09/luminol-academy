import type { Locale } from '@luminol/localization';

import type { StaffDestinationKey } from './staff-navigation';

export type StaffNavigationCopy = {
  aria: string;
  destination: Record<StaffDestinationKey, string>;
};

const english: StaffNavigationCopy = {
  aria: 'Staff workspace',
  destination: {
    overview: 'Overview',
    enquiries: 'Enquiries',
    team: 'Team',
  },
};

const french: StaffNavigationCopy = {
  aria: 'Espace équipe',
  destination: {
    overview: 'Vue d’ensemble',
    enquiries: 'Demandes',
    team: 'Équipe',
  },
};

const arabic: StaffNavigationCopy = {
  aria: 'مساحة الفريق',
  destination: {
    overview: 'نظرة عامة',
    enquiries: 'الطلبات',
    team: 'الفريق',
  },
};

const copies: Record<Locale, StaffNavigationCopy> = {
  en: english,
  fr: french,
  ar: arabic,
};

export function getStaffNavigationCopy(locale: Locale): StaffNavigationCopy {
  return copies[locale];
}
