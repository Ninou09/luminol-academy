import type { Locale } from '@luminol/localization';

export type ContentCalendarCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  aiQueue: string;
  createTitle: string;
  createIntro: string;
  recentTitle: string;
  recentIntro: string;
  noItems: string;
  titleLabel: string;
  captionLabel: string;
  platformLabel: string;
  accountRefLabel: string;
  formatFieldLabel: string;
  assetReferenceLabel: string;
  scheduledUtcLabel: string;
  timezoneLabel: string;
  scheduleHelp: string;
  create: string;
  edit: string;
  save: string;
  status: string;
  revision: string;
  schedule: string;
  unscheduled: string;
  proposal: string;
  proposalPending: string;
  proposalExists: string;
  proposePublish: string;
  proposalHelp: string;
  noExternalPublish: string;
  auditHistory: string;
  created: string;
  updated: string;
  by: string;
  lifecycle: string;
  moveTo: string;
  statusLabel: Record<'DRAFT' | 'READY' | 'SCHEDULED' | 'ARCHIVED', string>;
  formatName: Record<
    'REEL' | 'CAROUSEL' | 'STATIC_POST' | 'STORY' | 'OTHER',
    string
  >;
  platformName: Record<'INSTAGRAM' | 'FACEBOOK', string>;
};

const english: ContentCalendarCopy = {
  eyebrow: 'Luminol AI Operator',
  title: 'Content calendar',
  intro:
    'Plan reviewed Instagram and Facebook content inside the Operating System, then send an exact revision into the existing AI Operator approval queue.',
  back: 'Back to operations',
  aiQueue: 'AI approval queue',
  createTitle: 'Create content item',
  createIntro:
    'New items start as drafts. Move them to Ready only after the content is reviewed.',
  recentTitle: 'Content plan',
  recentIntro: 'The latest first-party calendar records and their approval state.',
  noItems: 'No content calendar items yet.',
  titleLabel: 'Title / topic',
  captionLabel: 'Caption / copy',
  platformLabel: 'Platform',
  accountRefLabel: 'Account reference',
  formatFieldLabel: 'Format',
  assetReferenceLabel: 'Asset reference (optional)',
  scheduledUtcLabel: 'Scheduled UTC time (optional)',
  timezoneLabel: 'Display timezone (IANA, optional)',
  scheduleHelp:
    'When scheduling, provide both a future UTC time and an IANA timezone such as Africa/Algiers.',
  create: 'Create draft',
  edit: 'Edit content',
  save: 'Save revision',
  status: 'Status',
  revision: 'Revision',
  schedule: 'Schedule',
  unscheduled: 'Not scheduled',
  proposal: 'Publish proposal',
  proposalPending: 'Proposal queued for review',
  proposalExists: 'A proposal already exists for this exact revision.',
  proposePublish: 'Send to AI approval queue',
  proposalHelp:
    'Ready or Scheduled items can create one idempotent approval proposal per exact content revision.',
  noExternalPublish:
    'This calendar does not publish externally. Instagram/Facebook execution remains disabled.',
  auditHistory: 'Audit history',
  created: 'Created',
  updated: 'Updated',
  by: 'by',
  lifecycle: 'Lifecycle',
  moveTo: 'Move to',
  statusLabel: {
    DRAFT: 'Draft',
    READY: 'Ready',
    SCHEDULED: 'Scheduled',
    ARCHIVED: 'Archived',
  },
  formatName: {
    REEL: 'Reel',
    CAROUSEL: 'Carousel',
    STATIC_POST: 'Static post',
    STORY: 'Story',
    OTHER: 'Other',
  },
  platformName: { INSTAGRAM: 'Instagram', FACEBOOK: 'Facebook' },
};

const french: ContentCalendarCopy = {
  ...english,
  eyebrow: 'Opérateur IA Luminol',
  title: 'Calendrier de contenu',
  intro:
    'Planifiez les contenus Instagram et Facebook validés dans le système d’exploitation, puis envoyez une révision exacte vers la file d’approbation de l’Opérateur IA.',
  back: 'Retour aux opérations',
  aiQueue: 'File d’approbation IA',
  createTitle: 'Créer un contenu',
  createIntro:
    'Les nouveaux contenus commencent en brouillon. Passez-les à Prêt uniquement après validation du contenu.',
  recentTitle: 'Plan de contenu',
  recentIntro: 'Les derniers contenus du calendrier et leur état d’approbation.',
  noItems: 'Aucun contenu planifié pour le moment.',
  titleLabel: 'Titre / sujet',
  captionLabel: 'Légende / texte',
  platformLabel: 'Plateforme',
  accountRefLabel: 'Référence du compte',
  formatFieldLabel: 'Format',
  assetReferenceLabel: 'Référence du média (facultatif)',
  scheduledUtcLabel: 'Heure UTC planifiée (facultatif)',
  timezoneLabel: 'Fuseau d’affichage IANA (facultatif)',
  scheduleHelp:
    'Pour planifier, indiquez une heure UTC future et un fuseau IANA, par exemple Africa/Algiers.',
  create: 'Créer le brouillon',
  edit: 'Modifier le contenu',
  save: 'Enregistrer la révision',
  status: 'Statut',
  revision: 'Révision',
  schedule: 'Planification',
  unscheduled: 'Non planifié',
  proposal: 'Proposition de publication',
  proposalPending: 'Proposition envoyée pour validation',
  proposalExists: 'Une proposition existe déjà pour cette révision exacte.',
  proposePublish: 'Envoyer à la file d’approbation IA',
  proposalHelp:
    'Les contenus Prêts ou Planifiés peuvent créer une seule proposition idempotente par révision exacte.',
  noExternalPublish:
    'Ce calendrier ne publie rien à l’extérieur. L’exécution Instagram/Facebook reste désactivée.',
  auditHistory: 'Historique d’audit',
  created: 'Créé',
  updated: 'Mis à jour',
  by: 'par',
  lifecycle: 'Cycle de vie',
  moveTo: 'Passer à',
  statusLabel: {
    DRAFT: 'Brouillon',
    READY: 'Prêt',
    SCHEDULED: 'Planifié',
    ARCHIVED: 'Archivé',
  },
  formatName: {
    REEL: 'Reel',
    CAROUSEL: 'Carrousel',
    STATIC_POST: 'Publication statique',
    STORY: 'Story',
    OTHER: 'Autre',
  },
};

const arabic: ContentCalendarCopy = {
  ...english,
  eyebrow: 'مشغّل Luminol بالذكاء الاصطناعي',
  title: 'تقويم المحتوى',
  intro:
    'خطّط لمحتوى إنستغرام وفيسبوك داخل نظام التشغيل، ثم أرسل نسخة محددة منه إلى قائمة موافقات مشغّل الذكاء الاصطناعي.',
  back: 'العودة إلى العمليات',
  aiQueue: 'قائمة موافقات الذكاء الاصطناعي',
  createTitle: 'إنشاء عنصر محتوى',
  createIntro:
    'تبدأ العناصر الجديدة كمسودات. انقلها إلى جاهز فقط بعد مراجعة المحتوى.',
  recentTitle: 'خطة المحتوى',
  recentIntro: 'أحدث عناصر التقويم وحالة الموافقة الخاصة بها.',
  noItems: 'لا توجد عناصر في تقويم المحتوى بعد.',
  titleLabel: 'العنوان / الموضوع',
  captionLabel: 'النص / الوصف',
  platformLabel: 'المنصة',
  accountRefLabel: 'مرجع الحساب',
  formatFieldLabel: 'الصيغة',
  assetReferenceLabel: 'مرجع الملف (اختياري)',
  scheduledUtcLabel: 'وقت UTC المجدول (اختياري)',
  timezoneLabel: 'المنطقة الزمنية للعرض IANA (اختياري)',
  scheduleHelp:
    'عند الجدولة، أدخل وقت UTC مستقبليًا ومنطقة IANA مثل Africa/Algiers.',
  create: 'إنشاء مسودة',
  edit: 'تعديل المحتوى',
  save: 'حفظ النسخة',
  status: 'الحالة',
  revision: 'النسخة',
  schedule: 'الجدولة',
  unscheduled: 'غير مجدول',
  proposal: 'اقتراح النشر',
  proposalPending: 'تم إرسال الاقتراح للمراجعة',
  proposalExists: 'يوجد اقتراح بالفعل لهذه النسخة المحددة.',
  proposePublish: 'إرسال إلى قائمة الموافقات',
  proposalHelp:
    'يمكن للعناصر الجاهزة أو المجدولة إنشاء اقتراح موافقة واحد فقط لكل نسخة محددة.',
  noExternalPublish:
    'هذا التقويم لا ينشر خارجيًا. تنفيذ النشر على إنستغرام وفيسبوك ما زال معطلاً.',
  auditHistory: 'سجل التدقيق',
  created: 'أُنشئ',
  updated: 'حُدّث',
  by: 'بواسطة',
  lifecycle: 'دورة الحالة',
  moveTo: 'نقل إلى',
  statusLabel: {
    DRAFT: 'مسودة',
    READY: 'جاهز',
    SCHEDULED: 'مجدول',
    ARCHIVED: 'مؤرشف',
  },
  formatName: {
    REEL: 'ريل',
    CAROUSEL: 'كاروسيل',
    STATIC_POST: 'منشور ثابت',
    STORY: 'ستوري',
    OTHER: 'أخرى',
  },
  platformName: { INSTAGRAM: 'إنستغرام', FACEBOOK: 'فيسبوك' },
};

export function getContentCalendarCopy(locale: Locale): ContentCalendarCopy {
  if (locale === 'fr') return french;
  if (locale === 'ar') return arabic;
  return english;
}
