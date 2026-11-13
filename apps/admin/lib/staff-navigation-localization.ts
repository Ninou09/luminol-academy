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
  subtitle: string;
  footer: (date: string) => string;
  waiting: (count: string) => string;
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
    dashboard: 'Insights',
    today: 'Today',
    pipeline: 'Leads',
    consultations: 'Consultations',
    clients: 'Contacts',
    sections: 'Sections',
    payments: 'Payments',
    enquiries: 'Enquiry desk',
    tasks: 'Tasks',
    team: 'Team',
    calendar: 'Editorial calendar',
    approvals: 'Approvals',
    activity: 'Activity log',
  },
  subtitle: 'Operations dashboard',
  footer: (date) => `Blida · ${date} · Currency: DA`,
  waiting: (count) => `${count} waiting`,
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
    dashboard: 'Analyses',
    today: 'Aujourd’hui',
    pipeline: 'Prospects',
    consultations: 'Consultations',
    clients: 'Contacts',
    sections: 'Sections',
    payments: 'Encaissements',
    enquiries: 'Bureau des demandes',
    tasks: 'Tâches',
    team: 'Équipe',
    calendar: 'Calendrier éditorial',
    approvals: 'Validations',
    activity: 'Journal d’activité',
  },
  subtitle: 'Tableau de bord opérationnel',
  footer: (date) => `Blida · ${date} · Devise : DA`,
  waiting: (count) => `${count} en attente`,
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
    dashboard: 'المؤشرات',
    today: 'اليوم',
    pipeline: 'العملاء المحتملون',
    consultations: 'الاستشارات',
    clients: 'جهات الاتصال',
    sections: 'الأقسام',
    payments: 'المدفوعات',
    enquiries: 'مكتب الطلبات',
    tasks: 'المهام',
    team: 'الفريق',
    calendar: 'التقويم التحريري',
    approvals: 'الموافقات',
    activity: 'سجل النشاط',
  },
  subtitle: 'لوحة التشغيل',
  footer: (date) => `البليدة · ${date} · العملة: دج`,
  waiting: (count) => `${count} في الانتظار`,
};

const copies: Record<Locale, StaffNavigationCopy> = {
  en: english,
  fr: french,
  ar: arabic,
};

export function getStaffNavigationCopy(locale: Locale): StaffNavigationCopy {
  return copies[locale];
}
