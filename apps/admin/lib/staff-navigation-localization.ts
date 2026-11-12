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
    today: 'Today',
    consultations: 'Consultations',
    clients: 'Clients',
    payments: 'Payments',
    enquiries: 'Enquiries',
    tasks: 'Tasks',
    team: 'Team',
  },
};

const french: StaffNavigationCopy = {
  aria: 'Espace équipe',
  destination: {
    overview: 'Vue d’ensemble',
    today: 'Aujourd’hui',
    consultations: 'Consultations',
    clients: 'Clients',
    payments: 'Encaissements',
    enquiries: 'Demandes',
    tasks: 'Tâches',
    team: 'Équipe',
  },
};

const arabic: StaffNavigationCopy = {
  aria: 'مساحة الفريق',
  destination: {
    overview: 'نظرة عامة',
    today: 'اليوم',
    consultations: 'الاستشارات',
    clients: 'العملاء',
    payments: 'المدفوعات',
    enquiries: 'الطلبات',
    tasks: 'المهام',
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
