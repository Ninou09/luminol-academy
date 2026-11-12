import type { Locale } from '@luminol/localization';

import type { PipelineBoardCopy } from '../app/crm/pipeline/pipeline-board';

export type CrmPipelineCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  filters: string;
  owner: string;
  ownerAll: string;
  ownerMine: string;
  ownerNone: string;
  school: string;
  any: string;
  source: string;
  search: string;
  overdueOnly: string;
  showSpam: string;
  apply: string;
  reset: string;
  limited: (count: string) => string;
  board: PipelineBoardCopy;
};

export type CrmDashboardCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  period: (days: string) => string;
  newLeads: string;
  contactedRate: string;
  convertedRate: string;
  medianResponse: string;
  within24h: string;
  overdueFollowUps: string;
  revenue: string;
  consultationsCompleted: string;
  noShowRate: string;
  bySource: string;
  bySchool: string;
  pipelineNow: string;
  team: string;
  teamMember: string;
  openLeads: string;
  activities: string;
  leads: string;
  converted: string;
  rate: string;
  noData: string;
  hours: (value: string) => string;
  notAvailable: string;
  openPipeline: string;
  definitions: string;
};

const english: { pipeline: CrmPipelineCopy; dashboard: CrmDashboardCopy } = {
  pipeline: {
    eyebrow: 'Luminol CRM',
    title: 'Lead pipeline',
    intro:
      'Every enquiry as a card. Drag a card to the next stage, or use its move control. Stage changes follow the governed enquiry rules and are audited.',
    filters: 'Filters',
    owner: 'Owner',
    ownerAll: 'Everyone',
    ownerMine: 'Mine',
    ownerNone: 'Unassigned',
    school: 'School',
    any: 'Any',
    source: 'Source',
    search: 'Name, email or phone',
    overdueOnly: 'Overdue follow-ups only',
    showSpam: 'Show spam',
    apply: 'Apply',
    reset: 'Reset',
    limited: (count) => `Showing the ${count} most recent matching leads.`,
    board: {
      moveTo: 'Move to',
      move: 'Move',
      moveFailed:
        'That move was not saved. The lead may have changed or the step is not allowed — the board has been restored.',
      moving: 'Saving…',
      unassigned: 'Unassigned',
      overdue: 'Overdue',
      noConsent: 'No contact consent',
      empty: 'No leads here.',
      dragHint:
        'Columns that accept the dragged card are highlighted. Allowed moves: New → In review → Contacted → Closed, and back one step.',
    },
  },
  dashboard: {
    eyebrow: 'Luminol CRM',
    title: 'CRM dashboard',
    intro: 'How leads arrive, how fast the team answers and what converts.',
    period: (days) => `Last ${days} days`,
    newLeads: 'New leads',
    contactedRate: 'Contacted',
    convertedRate: 'Became contacts',
    medianResponse: 'Median first response',
    within24h: 'Answered within 24 h',
    overdueFollowUps: 'Overdue follow-ups',
    revenue: 'Office payments received',
    consultationsCompleted: 'Consultations completed',
    noShowRate: 'No-show rate',
    bySource: 'Leads and conversion by source',
    bySchool: 'Leads and conversion by school',
    pipelineNow: 'Pipeline right now',
    team: 'Team activity',
    teamMember: 'Team member',
    openLeads: 'Open leads owned',
    activities: 'Activities logged',
    leads: 'Leads',
    converted: 'Converted',
    rate: 'Rate',
    noData: 'No data for this period.',
    hours: (value) => `${value} h`,
    notAvailable: '—',
    openPipeline: 'Open pipeline',
    definitions:
      'Contacted: the lead reached Contacted or Closed. Converted: a contact record was created from the lead. First response: time from arrival to the first stage change out of New.',
  },
};

const french: typeof english = {
  pipeline: {
    eyebrow: 'CRM Luminol',
    title: 'Pipeline des prospects',
    intro:
      'Chaque demande est une carte. Glissez-la vers l’étape suivante ou utilisez son contrôle de déplacement. Les changements suivent les règles des demandes et sont tracés.',
    filters: 'Filtres',
    owner: 'Responsable',
    ownerAll: 'Tout le monde',
    ownerMine: 'Les miens',
    ownerNone: 'Non attribués',
    school: 'École',
    any: 'Toutes',
    source: 'Source',
    search: 'Nom, e-mail ou téléphone',
    overdueOnly: 'Relances en retard uniquement',
    showSpam: 'Afficher les indésirables',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    limited: (count) => `Affichage des ${count} prospects les plus récents.`,
    board: {
      moveTo: 'Passer à',
      move: 'Déplacer',
      moveFailed:
        'Ce déplacement n’a pas été enregistré. Le prospect a peut-être changé ou l’étape n’est pas autorisée — le tableau a été rétabli.',
      moving: 'Enregistrement…',
      unassigned: 'Non attribué',
      overdue: 'En retard',
      noConsent: 'Pas de consentement',
      empty: 'Aucun prospect.',
      dragHint:
        'Les colonnes qui acceptent la carte sont mises en évidence. Déplacements autorisés : Nouvelle → En examen → Contactée → Clôturée, et retour d’une étape.',
    },
  },
  dashboard: {
    eyebrow: 'CRM Luminol',
    title: 'Tableau CRM',
    intro:
      'Comment arrivent les prospects, à quelle vitesse l’équipe répond et ce qui convertit.',
    period: (days) => `${days} derniers jours`,
    newLeads: 'Nouveaux prospects',
    contactedRate: 'Contactés',
    convertedRate: 'Devenus contacts',
    medianResponse: 'Première réponse (médiane)',
    within24h: 'Réponse sous 24 h',
    overdueFollowUps: 'Relances en retard',
    revenue: 'Encaissements',
    consultationsCompleted: 'Consultations effectuées',
    noShowRate: 'Taux d’absence',
    bySource: 'Prospects et conversion par source',
    bySchool: 'Prospects et conversion par école',
    pipelineNow: 'Pipeline actuel',
    team: 'Activité de l’équipe',
    teamMember: 'Membre',
    openLeads: 'Prospects ouverts attribués',
    activities: 'Activités enregistrées',
    leads: 'Prospects',
    converted: 'Convertis',
    rate: 'Taux',
    noData: 'Aucune donnée pour cette période.',
    hours: (value) => `${value} h`,
    notAvailable: '—',
    openPipeline: 'Ouvrir le pipeline',
    definitions:
      'Contacté : le prospect a atteint Contactée ou Clôturée. Converti : une fiche contact a été créée. Première réponse : délai entre l’arrivée et le premier changement d’étape depuis Nouvelle.',
  },
};

const arabic: typeof english = {
  pipeline: {
    eyebrow: 'نظام Luminol لإدارة العملاء',
    title: 'مسار العملاء المحتملين',
    intro:
      'كل طلب بطاقة. اسحب البطاقة إلى المرحلة التالية أو استخدم زر النقل. تتبع التغييرات قواعد الطلبات وتُسجَّل.',
    filters: 'التصفية',
    owner: 'المسؤول',
    ownerAll: 'الجميع',
    ownerMine: 'طلباتي',
    ownerNone: 'غير مسندة',
    school: 'المدرسة',
    any: 'الكل',
    source: 'المصدر',
    search: 'الاسم أو البريد أو الهاتف',
    overdueOnly: 'المتابعات المتأخرة فقط',
    showSpam: 'إظهار الرسائل المزعجة',
    apply: 'تطبيق',
    reset: 'إعادة الضبط',
    limited: (count) => `عرض أحدث ${count} طلبًا مطابقًا.`,
    board: {
      moveTo: 'نقل إلى',
      move: 'نقل',
      moveFailed:
        'لم يُحفظ النقل. ربما تغيّر الطلب أو أن الخطوة غير مسموحة — أُعيد اللوح كما كان.',
      moving: 'جارٍ الحفظ…',
      unassigned: 'غير مسند',
      overdue: 'متأخرة',
      noConsent: 'بدون موافقة على الاتصال',
      empty: 'لا طلبات هنا.',
      dragHint:
        'تُبرز الأعمدة التي تقبل البطاقة المسحوبة. النقل المسموح: جديد ← قيد المراجعة ← تم التواصل ← مغلق، والرجوع خطوة واحدة.',
    },
  },
  dashboard: {
    eyebrow: 'نظام Luminol لإدارة العملاء',
    title: 'لوحة مؤشرات العملاء',
    intro: 'كيف تصل الطلبات، وما سرعة رد الفريق، وما الذي يتحوّل إلى عملاء.',
    period: (days) => `آخر ${days} يومًا`,
    newLeads: 'طلبات جديدة',
    contactedRate: 'تم التواصل',
    convertedRate: 'أصبحوا جهات اتصال',
    medianResponse: 'وسيط أول رد',
    within24h: 'الرد خلال 24 ساعة',
    overdueFollowUps: 'متابعات متأخرة',
    revenue: 'المدفوعات المستلمة',
    consultationsCompleted: 'استشارات مكتملة',
    noShowRate: 'نسبة الغياب',
    bySource: 'الطلبات والتحويل حسب المصدر',
    bySchool: 'الطلبات والتحويل حسب المدرسة',
    pipelineNow: 'المسار حاليًا',
    team: 'نشاط الفريق',
    teamMember: 'العضو',
    openLeads: 'طلبات مفتوحة مسندة',
    activities: 'أنشطة مسجّلة',
    leads: 'الطلبات',
    converted: 'المحوّلة',
    rate: 'النسبة',
    noData: 'لا بيانات لهذه الفترة.',
    hours: (value) => `${value} ساعة`,
    notAvailable: '—',
    openPipeline: 'فتح المسار',
    definitions:
      'تم التواصل: وصل الطلب إلى «تم التواصل» أو «مغلق». التحويل: أُنشئت بطاقة جهة اتصال من الطلب. أول رد: المدة بين وصول الطلب وأول تغيير للمرحلة من «جديد».',
  },
};

const copies: Record<Locale, typeof english> = {
  en: english,
  fr: french,
  ar: arabic,
};

export function getCrmPipelineCopy(locale: Locale): CrmPipelineCopy {
  return copies[locale].pipeline;
}

export function getCrmDashboardCopy(locale: Locale): CrmDashboardCopy {
  return copies[locale].dashboard;
}
