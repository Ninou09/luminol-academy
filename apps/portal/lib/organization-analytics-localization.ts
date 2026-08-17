import type { Locale } from '@luminol/localization';

export type OrganizationAnalyticsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  privacyGroup: string;
  seatUtilization: string;
  assignedLearning: string;
  courseAnalytics: string;
  teamAnalytics: string;
  participantsProtected: string;
  protectedBody: string;
  allocatedSeats: string;
  availableSeats: string;
  utilization: string;
  assignments: string;
  completed: string;
  active: string;
  completion: string;
  noCourses: string;
  noTeams: string;
  privacyTitle: string;
  privacyBody: string;
};

const ORGANIZATION_ANALYTICS_COPY: Record<Locale, OrganizationAnalyticsCopy> = {
  en: {
    eyebrow: 'Organization outcomes',
    title: 'Organization analytics',
    intro:
      'Privacy-safe learning and seat-utilization aggregates for organizations you are authorized to manage.',
    back: 'Back to organization workspace',
    privacyGroup: 'Minimum privacy group',
    seatUtilization: 'Seat utilization',
    assignedLearning: 'Assigned learning',
    courseAnalytics: 'Course aggregates',
    teamAnalytics: 'Team aggregates',
    participantsProtected: 'Protected small group',
    protectedBody:
      'Detailed analytics stay hidden until at least five sponsored learners contribute to the aggregate.',
    allocatedSeats: 'Allocated seats',
    availableSeats: 'Available seats',
    utilization: 'Utilization',
    assignments: 'Assignments',
    completed: 'Completed',
    active: 'Active',
    completion: 'Completion',
    noCourses: 'No sponsored course analytics are available yet.',
    noTeams: 'No team analytics are available yet.',
    privacyTitle: 'Privacy boundary',
    privacyBody:
      'This analytics view is tenant-scoped and aggregate-only. It does not expose learner identities, assessment answers or scores, psychology content, enquiry messages, payment details, private certificate metadata, learner-authored text, raw search queries, session identifiers or IP addresses. It does not rank learners or infer diagnoses, wellbeing, intelligence, personality or employability.',
  },
  fr: {
    eyebrow: "Résultats de l'organisation",
    title: "Analytique de l'organisation",
    intro:
      "Agrégats d'apprentissage et d'utilisation des places respectueux de la confidentialité pour les organisations que vous êtes autorisé à gérer.",
    back: "Retour à l'espace organisation",
    privacyGroup: 'Groupe minimal de confidentialité',
    seatUtilization: 'Utilisation des places',
    assignedLearning: 'Apprentissage assigné',
    courseAnalytics: 'Agrégats par cours',
    teamAnalytics: 'Agrégats par équipe',
    participantsProtected: 'Petit groupe protégé',
    protectedBody:
      "Les analyses détaillées restent masquées jusqu'à ce qu'au moins cinq apprenants sponsorisés contribuent à l'agrégat.",
    allocatedSeats: 'Places attribuées',
    availableSeats: 'Places disponibles',
    utilization: 'Utilisation',
    assignments: 'Affectations',
    completed: 'Terminées',
    active: 'Actives',
    completion: 'Achèvement',
    noCourses: "Aucune analyse de cours sponsorisé n'est encore disponible.",
    noTeams: "Aucune analyse d'équipe n'est encore disponible.",
    privacyTitle: 'Limite de confidentialité',
    privacyBody:
      "Cette vue analytique est limitée au locataire autorisé et ne contient que des agrégats. Elle n'expose pas l'identité des apprenants, les réponses ou scores d'évaluation, le contenu psychologique, les messages de demande, les détails de paiement, les métadonnées privées des certificats, les textes rédigés par les apprenants, les recherches brutes, les identifiants de session ou les adresses IP. Elle ne classe pas les apprenants et n'infère aucun diagnostic, bien-être, intelligence, personnalité ou employabilité.",
  },
  ar: {
    eyebrow: 'نتائج المؤسسة',
    title: 'تحليلات المؤسسة',
    intro:
      'تجميعات تحافظ على الخصوصية حول التعلّم واستخدام المقاعد للمؤسسات التي تملك صلاحية إدارتها.',
    back: 'العودة إلى مساحة المؤسسة',
    privacyGroup: 'الحد الأدنى لمجموعة الخصوصية',
    seatUtilization: 'استخدام المقاعد',
    assignedLearning: 'التعلّم المعيّن',
    courseAnalytics: 'تجميعات الدورات',
    teamAnalytics: 'تجميعات الفرق',
    participantsProtected: 'مجموعة صغيرة محمية',
    protectedBody:
      'تبقى التحليلات التفصيلية مخفية إلى أن يساهم خمسة متعلمين ممولين على الأقل في التجميع.',
    allocatedSeats: 'المقاعد المخصصة',
    availableSeats: 'المقاعد المتاحة',
    utilization: 'نسبة الاستخدام',
    assignments: 'التعيينات',
    completed: 'المكتملة',
    active: 'النشطة',
    completion: 'نسبة الإكمال',
    noCourses: 'لا توجد تحليلات لدورات ممولة متاحة حاليًا.',
    noTeams: 'لا توجد تحليلات للفرق متاحة حاليًا.',
    privacyTitle: 'حدود الخصوصية',
    privacyBody:
      'هذه الصفحة محصورة في المؤسسة المخوّل لك إدارتها وتعرض تجميعات فقط. لا تعرض هويات المتعلمين أو إجابات التقييم ودرجاته أو المحتوى النفسي أو رسائل الاستفسار أو تفاصيل الدفع أو البيانات الخاصة للشهادات أو النصوص التي يكتبها المتعلمون أو عبارات البحث الخام أو معرّفات الجلسات أو عناوين IP. كما أنها لا ترتب المتعلمين ولا تستنتج تشخيصات أو حالة الرفاه أو الذكاء أو الشخصية أو قابلية التوظيف.',
  },
};

export function getOrganizationAnalyticsCopy(
  locale: Locale,
): OrganizationAnalyticsCopy {
  return ORGANIZATION_ANALYTICS_COPY[locale];
}
