import type { Locale } from '@luminol/localization';

export type SocialPublishingCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  calendar: string;
  accountRegistry: string;
  accountRegistryIntro: string;
  accountRef: string;
  displayName: string;
  externalAccountId: string;
  platform: string;
  active: string;
  inactive: string;
  createAccount: string;
  deactivate: string;
  activate: string;
  deliveryReview: string;
  deliveryReviewIntro: string;
  proposalId: string;
  materialize: string;
  contentRevision: string;
  format: string;
  caption: string;
  asset: string;
  schedule: string;
  notScheduled: string;
  noCredentials: string;
  noAccounts: string;
  attemptLedger: string;
  attemptLedgerIntro: string;
  planAttempt: string;
  planAttemptHelp: string;
  noAttempts: string;
  attemptCount: string;
  nextAttempt: string;
  providerReference: string;
  errorCode: string;
  none: string;
  systemActor: string;
  platformName: Record<'INSTAGRAM' | 'FACEBOOK', string>;
  eventType: Record<'CREATED' | 'UPDATED' | 'ACTIVATION_CHANGED', string>;
  attemptStatus: Record<
    'PLANNED' | 'IN_PROGRESS' | 'RETRY_SCHEDULED' | 'SUCCEEDED' | 'DEAD_LETTER',
    string
  >;
  attemptEventType: Record<
    'PLANNED' | 'STARTED' | 'SUCCEEDED' | 'PROVIDER_FAILED' | 'INVALIDATED',
    string
  >;
  deliveryError: {
    unavailable: string;
    notReady: string;
    notApproved: string;
    actionMismatch: string;
    contentNotPublishable: string;
    revisionMismatch: string;
    contentTargetMismatch: string;
    accountInactive: string;
    accountTargetMismatch: string;
    assetRequired: string;
    contentNotFound: string;
    accountNotFound: string;
    proposalNotFound: string;
  };
};

const english: SocialPublishingCopy = {
  eyebrow: 'Luminol AI Operator',
  title: 'Social publishing delivery',
  intro:
    'Register approved Instagram and Facebook destinations and inspect the exact delivery plan behind an approved content-calendar proposal.',
  back: 'Back to operations',
  calendar: 'Content calendar',
  accountRegistry: 'Publishing accounts',
  accountRegistryIntro:
    'Account records contain only destination metadata. Access tokens and app secrets are not stored here.',
  accountRef: 'Internal account reference',
  displayName: 'Display name',
  externalAccountId: 'External account / page ID',
  platform: 'Platform',
  active: 'Active',
  inactive: 'Inactive',
  createAccount: 'Register account',
  deactivate: 'Deactivate',
  activate: 'Activate',
  deliveryReview: 'Delivery-plan review',
  deliveryReviewIntro:
    'Enter an approved AI Operator proposal ID to materialize the exact reviewed revision without sending anything externally.',
  proposalId: 'AI Operator proposal ID',
  materialize: 'Review delivery plan',
  contentRevision: 'Content revision',
  format: 'Format',
  caption: 'Caption',
  asset: 'Asset',
  schedule: 'Schedule',
  notScheduled: 'Not scheduled',
  noCredentials:
    'No Meta credentials are stored or displayed. External publishing remains disabled.',
  noAccounts: 'No publishing accounts registered yet.',
  attemptLedger: 'Publish attempt ledger',
  attemptLedgerIntro:
    'Durable, idempotent execution records for approved revisions. This ledger records only bounded operational metadata and never stores captions, assets, credentials, or raw provider responses.',
  planAttempt: 'Plan publish attempt',
  planAttemptHelp:
    'Planning creates the durable execution record only. It does not publish or contact Meta.',
  noAttempts: 'No publish attempts have been planned yet.',
  attemptCount: 'Provider attempts',
  nextAttempt: 'Next eligible attempt',
  providerReference: 'Provider reference',
  errorCode: 'Last error code',
  none: 'None',
  systemActor: 'System',
  platformName: { INSTAGRAM: 'Instagram', FACEBOOK: 'Facebook' },
  eventType: {
    CREATED: 'Created',
    UPDATED: 'Updated',
    ACTIVATION_CHANGED: 'Activation changed',
  },
  attemptStatus: {
    PLANNED: 'Planned',
    IN_PROGRESS: 'In progress',
    RETRY_SCHEDULED: 'Retry scheduled',
    SUCCEEDED: 'Succeeded',
    DEAD_LETTER: 'Stopped',
  },
  attemptEventType: {
    PLANNED: 'Planned',
    STARTED: 'Started',
    SUCCEEDED: 'Succeeded',
    PROVIDER_FAILED: 'Provider failed',
    INVALIDATED: 'Invalidated',
  },
  deliveryError: {
    unavailable: 'Delivery plan is unavailable.',
    notReady: 'This proposal is not ready for delivery.',
    notApproved: 'This proposal has not been approved.',
    actionMismatch: 'The stored proposal no longer matches its action.',
    contentNotPublishable: 'The content is no longer in a publishable state.',
    revisionMismatch: 'The content revision no longer matches the approval.',
    contentTargetMismatch:
      'The content destination no longer matches the approval.',
    accountInactive: 'The publishing account is inactive.',
    accountTargetMismatch:
      'The publishing account does not match the approved destination.',
    assetRequired: 'The approved content is missing its required asset.',
    contentNotFound: 'The approved content item could not be found.',
    accountNotFound: 'The approved publishing account could not be found.',
    proposalNotFound: 'The AI Operator proposal could not be found.',
  },
};

const french: SocialPublishingCopy = {
  ...english,
  eyebrow: 'Opérateur IA Luminol',
  title: 'Livraison des publications sociales',
  intro:
    'Enregistrez les destinations Instagram et Facebook validées et inspectez le plan de livraison exact associé à une proposition approuvée du calendrier de contenu.',
  back: 'Retour aux opérations',
  calendar: 'Calendrier de contenu',
  accountRegistry: 'Comptes de publication',
  accountRegistryIntro:
    'Les comptes ne contiennent que les métadonnées de destination. Aucun jeton d’accès ni secret d’application n’est stocké ici.',
  accountRef: 'Référence interne du compte',
  displayName: 'Nom affiché',
  externalAccountId: 'ID externe du compte / de la page',
  platform: 'Plateforme',
  active: 'Actif',
  inactive: 'Inactif',
  createAccount: 'Enregistrer le compte',
  deactivate: 'Désactiver',
  activate: 'Activer',
  deliveryReview: 'Revue du plan de livraison',
  deliveryReviewIntro:
    'Saisissez l’ID d’une proposition approuvée de l’Opérateur IA pour matérialiser la révision exacte sans rien envoyer à l’extérieur.',
  proposalId: 'ID de proposition de l’Opérateur IA',
  materialize: 'Examiner le plan de livraison',
  contentRevision: 'Révision du contenu',
  format: 'Format',
  caption: 'Légende',
  asset: 'Ressource',
  schedule: 'Planification',
  notScheduled: 'Non planifié',
  noCredentials:
    'Aucun identifiant Meta n’est stocké ni affiché. La publication externe reste désactivée.',
  noAccounts: 'Aucun compte de publication enregistré.',
  attemptLedger: 'Registre des tentatives de publication',
  attemptLedgerIntro:
    'Registre durable et idempotent des révisions approuvées. Il conserve uniquement des métadonnées opérationnelles bornées, sans légendes, ressources, identifiants ni réponses brutes du fournisseur.',
  planAttempt: 'Planifier la tentative',
  planAttemptHelp:
    'La planification crée uniquement l’enregistrement durable. Elle ne publie rien et ne contacte pas Meta.',
  noAttempts: 'Aucune tentative de publication n’a encore été planifiée.',
  attemptCount: 'Tentatives fournisseur',
  nextAttempt: 'Prochaine tentative possible',
  providerReference: 'Référence fournisseur',
  errorCode: 'Dernier code d’erreur',
  none: 'Aucun',
  systemActor: 'Système',
  eventType: {
    CREATED: 'Créé',
    UPDATED: 'Mis à jour',
    ACTIVATION_CHANGED: 'Activation modifiée',
  },
  attemptStatus: {
    PLANNED: 'Planifiée',
    IN_PROGRESS: 'En cours',
    RETRY_SCHEDULED: 'Nouvel essai planifié',
    SUCCEEDED: 'Réussie',
    DEAD_LETTER: 'Arrêtée',
  },
  attemptEventType: {
    PLANNED: 'Planifiée',
    STARTED: 'Démarrée',
    SUCCEEDED: 'Réussie',
    PROVIDER_FAILED: 'Échec du fournisseur',
    INVALIDATED: 'Invalidée',
  },
  deliveryError: {
    unavailable: 'Le plan de livraison est indisponible.',
    notReady: 'Cette proposition n’est pas prête pour la livraison.',
    notApproved: 'Cette proposition n’a pas été approuvée.',
    actionMismatch:
      'La proposition enregistrée ne correspond plus à son action.',
    contentNotPublishable: 'Le contenu n’est plus dans un état publiable.',
    revisionMismatch:
      'La révision du contenu ne correspond plus à l’approbation.',
    contentTargetMismatch:
      'La destination du contenu ne correspond plus à l’approbation.',
    accountInactive: 'Le compte de publication est inactif.',
    accountTargetMismatch:
      'Le compte de publication ne correspond pas à la destination approuvée.',
    assetRequired: 'Le contenu approuvé ne contient plus la ressource requise.',
    contentNotFound: 'Le contenu approuvé est introuvable.',
    accountNotFound: 'Le compte de publication approuvé est introuvable.',
    proposalNotFound: 'La proposition de l’Opérateur IA est introuvable.',
  },
};

const arabic: SocialPublishingCopy = {
  ...english,
  eyebrow: 'مشغّل Luminol بالذكاء الاصطناعي',
  title: 'تسليم النشر على الشبكات الاجتماعية',
  intro:
    'سجّل وجهات إنستغرام وفيسبوك المعتمدة وراجع خطة التسليم الدقيقة المرتبطة باقتراح معتمد من تقويم المحتوى.',
  back: 'العودة إلى العمليات',
  calendar: 'تقويم المحتوى',
  accountRegistry: 'حسابات النشر',
  accountRegistryIntro:
    'تحتوي سجلات الحسابات على بيانات الوجهة فقط. لا يتم تخزين رموز الوصول أو أسرار التطبيقات هنا.',
  accountRef: 'مرجع الحساب الداخلي',
  displayName: 'اسم العرض',
  externalAccountId: 'معرّف الحساب / الصفحة الخارجي',
  platform: 'المنصة',
  active: 'نشط',
  inactive: 'غير نشط',
  createAccount: 'تسجيل الحساب',
  deactivate: 'تعطيل',
  activate: 'تفعيل',
  deliveryReview: 'مراجعة خطة التسليم',
  deliveryReviewIntro:
    'أدخل معرّف اقتراح معتمد من مشغّل الذكاء الاصطناعي لمراجعة النسخة الدقيقة دون إرسال أي شيء خارجياً.',
  proposalId: 'معرّف اقتراح مشغّل الذكاء الاصطناعي',
  materialize: 'مراجعة خطة التسليم',
  contentRevision: 'نسخة المحتوى',
  format: 'التنسيق',
  caption: 'النص',
  asset: 'الملف',
  schedule: 'الجدولة',
  notScheduled: 'غير مجدول',
  noCredentials:
    'لا يتم تخزين أو عرض بيانات اعتماد Meta. النشر الخارجي ما زال معطلاً.',
  noAccounts: 'لا توجد حسابات نشر مسجلة بعد.',
  attemptLedger: 'سجل محاولات النشر',
  attemptLedgerIntro:
    'سجل دائم وغير مكرر للنسخ المعتمدة. يحتفظ فقط ببيانات تشغيلية محدودة ولا يخزن النصوص أو الملفات أو بيانات الاعتماد أو ردود المزوّد الخام.',
  planAttempt: 'تخطيط محاولة النشر',
  planAttemptHelp:
    'التخطيط ينشئ سجل التنفيذ الدائم فقط. لا ينشر المحتوى ولا يتصل بـ Meta.',
  noAttempts: 'لم يتم تخطيط أي محاولة نشر بعد.',
  attemptCount: 'محاولات المزوّد',
  nextAttempt: 'المحاولة التالية المتاحة',
  providerReference: 'مرجع المزوّد',
  errorCode: 'آخر رمز خطأ',
  none: 'لا يوجد',
  systemActor: 'النظام',
  eventType: {
    CREATED: 'تم الإنشاء',
    UPDATED: 'تم التحديث',
    ACTIVATION_CHANGED: 'تم تغيير حالة التفعيل',
  },
  attemptStatus: {
    PLANNED: 'مخططة',
    IN_PROGRESS: 'قيد التنفيذ',
    RETRY_SCHEDULED: 'إعادة المحاولة مجدولة',
    SUCCEEDED: 'نجحت',
    DEAD_LETTER: 'متوقفة',
  },
  attemptEventType: {
    PLANNED: 'تم التخطيط',
    STARTED: 'بدأت',
    SUCCEEDED: 'نجحت',
    PROVIDER_FAILED: 'فشل المزوّد',
    INVALIDATED: 'أُبطلت',
  },
  deliveryError: {
    unavailable: 'خطة التسليم غير متاحة.',
    notReady: 'هذا الاقتراح غير جاهز للتسليم.',
    notApproved: 'لم تتم الموافقة على هذا الاقتراح.',
    actionMismatch: 'الاقتراح المحفوظ لم يعد مطابقاً للإجراء المرتبط به.',
    contentNotPublishable: 'المحتوى لم يعد في حالة تسمح بالنشر.',
    revisionMismatch: 'نسخة المحتوى لم تعد مطابقة للموافقة.',
    contentTargetMismatch: 'وجهة المحتوى لم تعد مطابقة للموافقة.',
    accountInactive: 'حساب النشر غير نشط.',
    accountTargetMismatch: 'حساب النشر لا يطابق الوجهة المعتمدة.',
    assetRequired: 'المحتوى المعتمد يفتقد الملف المطلوب.',
    contentNotFound: 'تعذر العثور على عنصر المحتوى المعتمد.',
    accountNotFound: 'تعذر العثور على حساب النشر المعتمد.',
    proposalNotFound: 'تعذر العثور على اقتراح مشغّل الذكاء الاصطناعي.',
  },
};

export function getSocialPublishingCopy(locale: Locale) {
  if (locale === 'fr') return french;
  if (locale === 'ar') return arabic;
  return english;
}
