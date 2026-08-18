import type { Locale } from '@luminol/localization';

export type AcademyAnalyticsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  summaryAria: string;
  publishedProgrammes: string;
  visibleProgrammes: string;
  suppressedProgrammes: string;
  privacyGuard: string;
  tableTitle: string;
  tableIntro: string;
  programme: string;
  participants: string;
  active: string;
  completed: string;
  recentActivity: string;
  certificates: string;
  reviews: string;
  suppressedTitle: string;
  suppressedReason: string;
  noProgrammes: string;
  professionalTitle: string;
  professionalIntro: string;
  professionalSubmitted: string;
  professionalWaitingReview: string;
  professionalInReview: string;
  professionalRevisionRequired: string;
  professionalApproved: string;
  professionalRejected: string;
  professionalNoProgrammes: string;
  professionalSuppressedTitle: string;
  professionalSuppressedReason: string;
  privacyTitle: string;
  privacyBody: string;
};

const ACADEMY_ANALYTICS_COPY: Record<Locale, AcademyAnalyticsCopy> = {
  en: {
    eyebrow: 'Learning outcomes',
    title: 'Academy analytics',
    intro:
      'Programme-level learning signals for authorized academy operators. Metrics are derived from existing learning records and small groups are hidden by design.',
    back: 'Back to administration',
    summaryAria: 'Academy analytics summary',
    publishedProgrammes: 'Published programmes',
    visibleProgrammes: 'Visible aggregates',
    suppressedProgrammes: 'Privacy-suppressed programmes',
    privacyGuard: 'Minimum privacy group',
    tableTitle: 'Programme outcomes',
    tableIntro:
      'Visible rows include only programmes that meet the minimum privacy group. Recent activity covers the fixed 30-day analytics window.',
    programme: 'Programme',
    participants: 'Participants',
    active: 'Active',
    completed: 'Completed',
    recentActivity: 'Recent activity',
    certificates: 'Certificates',
    reviews: 'Reviews needed',
    suppressedTitle: 'Protected small groups',
    suppressedReason:
      'Detailed metrics stay hidden until the programme reaches the minimum privacy group.',
    noProgrammes: 'No published programmes are available for analytics yet.',
    professionalTitle: 'Professional project workflow',
    professionalIntro:
      'Current project workflow counts are shown only when at least the minimum privacy group of distinct learners have submitted project work. Drafts are excluded.',
    professionalSubmitted: 'Submitted work',
    professionalWaitingReview: 'Waiting review',
    professionalInReview: 'In review',
    professionalRevisionRequired: 'Revision needed',
    professionalApproved: 'Approved',
    professionalRejected: 'Not approved',
    professionalNoProgrammes:
      'No published programmes with professional project work are available yet.',
    professionalSuppressedTitle: 'Protected project groups',
    professionalSuppressedReason:
      'Professional workflow counts stay hidden until at least the minimum privacy group of distinct learners have submitted work in that programme.',
    privacyTitle: 'Privacy boundary',
    privacyBody:
      'This view never exposes learner identities, assessment answers or scores, psychology content, enquiries, payment details, certificate metadata, project links, learner reflections, reviewer feedback, professional scores, raw search queries, session identifiers or IP addresses. It does not rank learners or infer diagnoses, wellbeing, intelligence, personality or employability.',
  },
  fr: {
    eyebrow: 'Résultats pédagogiques',
    title: "Analytique de l'académie",
    intro:
      "Indicateurs pédagogiques par programme pour les opérateurs autorisés de l'académie. Les métriques proviennent des données d'apprentissage existantes et les petits groupes sont masqués par conception.",
    back: "Retour à l'administration",
    summaryAria: "Résumé analytique de l'académie",
    publishedProgrammes: 'Programmes publiés',
    visibleProgrammes: 'Agrégats visibles',
    suppressedProgrammes: 'Programmes masqués pour confidentialité',
    privacyGuard: 'Groupe minimal de confidentialité',
    tableTitle: 'Résultats par programme',
    tableIntro:
      "Les lignes visibles concernent uniquement les programmes atteignant le seuil minimal de confidentialité. L'activité récente couvre la fenêtre analytique fixe de 30 jours.",
    programme: 'Programme',
    participants: 'Participants',
    active: 'Actifs',
    completed: 'Terminés',
    recentActivity: 'Activité récente',
    certificates: 'Certificats',
    reviews: 'Révisions requises',
    suppressedTitle: 'Petits groupes protégés',
    suppressedReason:
      "Les métriques détaillées restent masquées jusqu'à ce que le programme atteigne le groupe minimal de confidentialité.",
    noProgrammes:
      "Aucun programme publié n'est encore disponible pour l'analytique.",
    professionalTitle: 'Flux des projets professionnels',
    professionalIntro:
      'Les volumes actuels du flux de projets sont affichés uniquement lorsqu’au moins le groupe minimal de confidentialité d’apprenants distincts a soumis un projet. Les brouillons sont exclus.',
    professionalSubmitted: 'Travaux soumis',
    professionalWaitingReview: 'En attente',
    professionalInReview: 'En évaluation',
    professionalRevisionRequired: 'Révision demandée',
    professionalApproved: 'Approuvés',
    professionalRejected: 'Non approuvés',
    professionalNoProgrammes:
      'Aucun programme publié avec des projets professionnels n’est encore disponible.',
    professionalSuppressedTitle: 'Groupes de projets protégés',
    professionalSuppressedReason:
      'Les volumes du flux professionnel restent masqués jusqu’à ce qu’au moins le groupe minimal de confidentialité d’apprenants distincts ait soumis un travail dans ce programme.',
    privacyTitle: 'Limite de confidentialité',
    privacyBody:
      "Cette vue n'expose jamais l'identité des apprenants, les réponses ou scores d'évaluation, le contenu psychologique, les demandes, les détails de paiement, les métadonnées privées des certificats, les liens de projets, les réflexions des apprenants, les retours des évaluateurs, les notes professionnelles, les recherches brutes, les identifiants de session ou les adresses IP. Elle ne classe pas les apprenants et n'infère aucun diagnostic, bien-être, intelligence, personnalité ou employabilité.",
  },
  ar: {
    eyebrow: 'نتائج التعلّم',
    title: 'تحليلات الأكاديمية',
    intro:
      'مؤشرات تعلّم على مستوى البرامج للمشغّلين المخوّلين في الأكاديمية. تُشتق المقاييس من سجلات التعلّم الحالية، وتُخفى المجموعات الصغيرة لحماية الخصوصية.',
    back: 'العودة إلى الإدارة',
    summaryAria: 'ملخص تحليلات الأكاديمية',
    publishedProgrammes: 'البرامج المنشورة',
    visibleProgrammes: 'التجميعات الظاهرة',
    suppressedProgrammes: 'برامج مخفية لحماية الخصوصية',
    privacyGuard: 'الحد الأدنى لمجموعة الخصوصية',
    tableTitle: 'نتائج البرامج',
    tableIntro:
      'تظهر التفاصيل فقط للبرامج التي تبلغ الحد الأدنى لمجموعة الخصوصية. يغطي النشاط الحديث نافذة التحليلات الثابتة لآخر 30 يومًا.',
    programme: 'البرنامج',
    participants: 'المشاركون',
    active: 'النشطون',
    completed: 'المكتملون',
    recentActivity: 'النشاط الحديث',
    certificates: 'الشهادات',
    reviews: 'مراجعات مطلوبة',
    suppressedTitle: 'مجموعات صغيرة محمية',
    suppressedReason:
      'تبقى المقاييس التفصيلية مخفية إلى أن يبلغ البرنامج الحد الأدنى لمجموعة الخصوصية.',
    noProgrammes: 'لا توجد برامج منشورة متاحة للتحليلات حاليًا.',
    professionalTitle: 'سير عمل المشاريع المهنية',
    professionalIntro:
      'تظهر أعداد حالات المشاريع الحالية فقط عندما يقدّم عدد من المتعلمين المختلفين يساوي على الأقل الحد الأدنى لمجموعة الخصوصية. ولا تدخل المسودات في هذه الأعداد.',
    professionalSubmitted: 'الأعمال المقدمة',
    professionalWaitingReview: 'بانتظار المراجعة',
    professionalInReview: 'قيد المراجعة',
    professionalRevisionRequired: 'مطلوب تعديل',
    professionalApproved: 'المقبولة',
    professionalRejected: 'غير المقبولة',
    professionalNoProgrammes:
      'لا توجد حاليًا برامج منشورة تتضمن مشاريع مهنية متاحة للتحليلات.',
    professionalSuppressedTitle: 'مجموعات مشاريع محمية',
    professionalSuppressedReason:
      'تبقى أعداد سير العمل المهني مخفية إلى أن يقدّم العملَ في البرنامج عددٌ من المتعلمين المختلفين يساوي على الأقل الحد الأدنى لمجموعة الخصوصية.',
    privacyTitle: 'حدود الخصوصية',
    privacyBody:
      'لا تعرض هذه الصفحة هويات المتعلمين أو إجابات التقييم ودرجاته أو المحتوى النفسي أو الاستفسارات أو تفاصيل الدفع أو البيانات الخاصة للشهادات أو روابط المشاريع أو انعكاسات المتعلمين أو ملاحظات المراجعين أو درجات المشاريع المهنية أو عبارات البحث الخام أو معرّفات الجلسات أو عناوين IP. كما أنها لا ترتب المتعلمين ولا تستنتج تشخيصات أو حالة الرفاه أو الذكاء أو الشخصية أو قابلية التوظيف.',
  },
};

export function getAcademyAnalyticsCopy(locale: Locale): AcademyAnalyticsCopy {
  return ACADEMY_ANALYTICS_COPY[locale];
}
