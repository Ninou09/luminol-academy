import type { Locale } from '@luminol/localization';

import type { StaffDestinationKey } from './staff-navigation';

export type StaffNavigationCopy = {
  aria: string;
  crmLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  search: string;
  shellNote: string;
  destination: Record<StaffDestinationKey, string>;
};

const english: StaffNavigationCopy = {
  aria: 'Staff workspace',
  crmLabel: 'Luminol CRM',
  searchLabel: 'Search leads, contacts and receipts',
  searchPlaceholder: 'Name, phone, email or receipt…',
  search: 'Search',
  shellNote:
    'You only see the records your role allows. Nothing here sends messages automatically.',
  destination: {
    overview: 'Overview',
    dashboard: 'CRM dashboard',
    today: 'Today',
    pipeline: 'Pipeline',
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
  crmLabel: 'CRM Luminol',
  searchLabel: 'Rechercher prospects, contacts et reçus',
  searchPlaceholder: 'Nom, téléphone, e-mail ou reçu…',
  search: 'Rechercher',
  shellNote:
    'Vous ne voyez que ce que votre rôle autorise. Rien n’est envoyé automatiquement.',
  destination: {
    overview: 'Vue d’ensemble',
    dashboard: 'Tableau CRM',
    today: 'Aujourd’hui',
    pipeline: 'Pipeline',
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
  crmLabel: 'نظام Luminol لإدارة العملاء',
  searchLabel: 'البحث في الطلبات والعملاء والوصولات',
  searchPlaceholder: 'الاسم أو الهاتف أو البريد أو رقم الوصل…',
  search: 'بحث',
  shellNote: 'ترى فقط السجلات التي يسمح بها دورك. لا يُرسل أي شيء تلقائيًا.',
  destination: {
    overview: 'نظرة عامة',
    dashboard: 'لوحة المؤشرات',
    today: 'اليوم',
    pipeline: 'مسار العملاء',
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
