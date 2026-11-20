import type { Locale } from '@luminol/localization';

import type { ActivityArea } from './activity-log';

export type ActivityLogCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  filters: string;
  allAreas: string;
  apply: string;
  area: Record<ActivityArea, string>;
  period: (days: string) => string;
  empty: string;
  limited: (count: string) => string;
  leadStatus: (from: string, to: string) => string;
  consultation: (status: string) => string;
  paymentRecorded: (receipt: string) => string;
  paymentVoided: (receipt: string) => string;
  task: (status: string) => string;
  approval: (status: string) => string;
  roleGranted: (role: string) => string;
  roleRevoked: (role: string) => string;
  calendar: (status: string) => string;
};

const english: ActivityLogCopy = {
  eyebrow: 'Luminol Operations',
  title: 'Activity log',
  intro:
    'What the team recorded, newest first. Read-only: it is built from the append-only histories and changes nothing.',
  filters: 'Filters',
  allAreas: 'All areas',
  apply: 'Apply',
  area: {
    leads: 'Leads',
    opportunities: 'Opportunities',
    consultations: 'Consultations',
    payments: 'Payments',
    tasks: 'Tasks and approvals',
    calendar: 'Editorial calendar',
    team: 'Team',
  },
  period: (days) => (days === '1' ? 'Today' : `Last ${days} days`),
  empty: 'Nothing recorded in this period.',
  limited: (count) => `Showing the ${count} most recent entries.`,
  leadStatus: (from, to) => `Lead stage: ${from} → ${to}`,
  consultation: (status) => `Consultation · ${status}`,
  paymentRecorded: (receipt) => `Payment ${receipt} recorded`,
  paymentVoided: (receipt) => `Payment ${receipt} voided`,
  task: (status) => `Task · ${status}`,
  approval: (status) => `Approval · ${status}`,
  roleGranted: (role) => `Role granted: ${role}`,
  roleRevoked: (role) => `Role revoked: ${role}`,
  calendar: (status) => `Editorial item · ${status}`,
};

const french: ActivityLogCopy = {
  eyebrow: 'Luminol Opérations',
  title: 'Journal d’activité',
  intro:
    'Ce que l’équipe a enregistré, du plus récent au plus ancien. Lecture seule : construit à partir des historiques non modifiables, il ne change rien.',
  filters: 'Filtres',
  allAreas: 'Tous les domaines',
  apply: 'Appliquer',
  area: {
    leads: 'Prospects',
    opportunities: 'Opportunités',
    consultations: 'Consultations',
    payments: 'Paiements',
    tasks: 'Tâches et validations',
    calendar: 'Calendrier éditorial',
    team: 'Équipe',
  },
  period: (days) => (days === '1' ? 'Aujourd’hui' : `${days} derniers jours`),
  empty: 'Rien d’enregistré sur cette période.',
  limited: (count) => `Affichage des ${count} entrées les plus récentes.`,
  leadStatus: (from, to) => `Étape du prospect : ${from} → ${to}`,
  consultation: (status) => `Consultation · ${status}`,
  paymentRecorded: (receipt) => `Paiement ${receipt} enregistré`,
  paymentVoided: (receipt) => `Paiement ${receipt} annulé`,
  task: (status) => `Tâche · ${status}`,
  approval: (status) => `Validation · ${status}`,
  roleGranted: (role) => `Rôle attribué : ${role}`,
  roleRevoked: (role) => `Rôle retiré : ${role}`,
  calendar: (status) => `Publication · ${status}`,
};

const arabic: ActivityLogCopy = {
  eyebrow: 'عمليات Luminol',
  title: 'سجل النشاط',
  intro:
    'ما سجّله الفريق، الأحدث أولًا. للقراءة فقط: مبني من السجلات غير القابلة للتعديل ولا يغيّر شيئًا.',
  filters: 'عوامل التصفية',
  allAreas: 'كل المجالات',
  apply: 'تطبيق',
  area: {
    leads: 'العملاء المحتملون',
    opportunities: 'الفرص',
    consultations: 'الاستشارات',
    payments: 'المدفوعات',
    tasks: 'المهام والموافقات',
    calendar: 'التقويم التحريري',
    team: 'الفريق',
  },
  period: (days) => (days === '1' ? 'اليوم' : `آخر ${days} يومًا`),
  empty: 'لا شيء مسجّل في هذه الفترة.',
  limited: (count) => `عرض آخر ${count} عنصرًا.`,
  leadStatus: (from, to) => `مرحلة العميل: ${from} ← ${to}`,
  consultation: (status) => `استشارة · ${status}`,
  paymentRecorded: (receipt) => `تسجيل الدفعة ${receipt}`,
  paymentVoided: (receipt) => `إلغاء الدفعة ${receipt}`,
  task: (status) => `مهمة · ${status}`,
  approval: (status) => `موافقة · ${status}`,
  roleGranted: (role) => `منح الدور: ${role}`,
  roleRevoked: (role) => `سحب الدور: ${role}`,
  calendar: (status) => `منشور · ${status}`,
};

const copies: Record<Locale, ActivityLogCopy> = {
  en: english,
  fr: french,
  ar: arabic,
};

export function getActivityLogCopy(locale: Locale): ActivityLogCopy {
  return copies[locale];
}
