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
  deliveryUnavailable: string;
  noCredentials: string;
  noAccounts: string;
  platformName: Record<'INSTAGRAM' | 'FACEBOOK', string>;
  eventType: Record<'CREATED' | 'UPDATED' | 'ACTIVATION_CHANGED', string>;
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
  deliveryUnavailable: 'Delivery plan is unavailable.',
  noCredentials:
    'No Meta credentials are stored or displayed. External publishing remains disabled.',
  noAccounts: 'No publishing accounts registered yet.',
  platformName: { INSTAGRAM: 'Instagram', FACEBOOK: 'Facebook' },
  eventType: {
    CREATED: 'Created',
    UPDATED: 'Updated',
    ACTIVATION_CHANGED: 'Activation changed',
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
  deliveryUnavailable: 'Le plan de livraison est indisponible.',
  noCredentials:
    'Aucun identifiant Meta n’est stocké ni affiché. La publication externe reste désactivée.',
  noAccounts: 'Aucun compte de publication enregistré.',
  eventType: {
    CREATED: 'Créé',
    UPDATED: 'Mis à jour',
    ACTIVATION_CHANGED: 'Activation modifiée',
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
  deliveryUnavailable: 'خطة التسليم غير متاحة.',
  noCredentials:
    'لا يتم تخزين أو عرض بيانات اعتماد Meta. النشر الخارجي ما زال معطلاً.',
  noAccounts: 'لا توجد حسابات نشر مسجلة بعد.',
  eventType: {
    CREATED: 'تم الإنشاء',
    UPDATED: 'تم التحديث',
    ACTIVATION_CHANGED: 'تم تغيير حالة التفعيل',
  },
};

export function getSocialPublishingCopy(locale: Locale) {
  if (locale === 'fr') return french;
  if (locale === 'ar') return arabic;
  return english;
}
