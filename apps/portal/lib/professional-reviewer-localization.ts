import type { Locale } from '@luminol/localization';
import type { ProfessionalSubmissionStatus } from '@luminol/database';

type ReviewerCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  queue: string;
  history: string;
  noQueue: string;
  noHistory: string;
  project: string;
  programme: string;
  status: string;
  submitted: string;
  updated: string;
  open: string;
  back: string;
  backToReviews: string;
  detailEyebrow: string;
  artifact: string;
  openArtifact: string;
  noArtifact: string;
  reflection: string;
  noReflection: string;
  privacyTitle: string;
  privacyBody: string;
  startReviewTitle: string;
  startReviewBody: string;
  startReview: string;
  decisionTitle: string;
  decisionBody: string;
  score: string;
  scoreHint: string;
  feedback: string;
  feedbackHint: string;
  requiresRevision: string;
  submitDecision: string;
  decisionHistory: string;
  noDecisionHistory: string;
  decisionRecorded: string;
  governanceTitle: string;
  governanceBody: string;
  statuses: Record<ProfessionalSubmissionStatus, string>;
};

const COPY = {
  en: {
    nav: 'Reviews',
    eyebrow: 'Assigned reviews',
    title: 'Professional project review workspace',
    intro:
      'See only professional submissions explicitly assigned to your synchronized reviewer account. Review decisions use the governed project-review contract and are recorded as immutable history.',
    queue: 'Current review queue',
    history: 'Assigned history',
    noQueue: 'No submissions are currently waiting for your review.',
    noHistory: 'No other assigned submissions are available.',
    project: 'Project',
    programme: 'Programme',
    status: 'Status',
    submitted: 'Submitted',
    updated: 'Updated',
    open: 'Open assigned submission',
    back: 'Back to dashboard',
    backToReviews: 'Back to reviews',
    detailEyebrow: 'Assigned submission',
    artifact: 'Project artifact',
    openArtifact: 'Open project artifact',
    noArtifact: 'No valid project artifact link is available.',
    reflection: 'Learner reflection',
    noReflection: 'No reflection is available for this submission.',
    privacyTitle: 'Exact assignment only',
    privacyBody:
      'Submission content is loaded only after your persisted reviewer assignment is verified. No unrelated learner, psychology, finance, certificate, organization or network data is exposed.',
    startReviewTitle: 'Start this review',
    startReviewBody:
      'Starting the review moves this assigned submission into the in-review state and records an audit event.',
    startReview: 'Start review',
    decisionTitle: 'Record a governed decision',
    decisionBody:
      'Enter your human score and learner-visible feedback. A revision request takes priority; otherwise scores of 70 or above are approved and lower scores are rejected under the existing review contract.',
    score: 'Score (0–100)',
    scoreHint: 'Enter the score you assigned after reviewing the project.',
    feedback: 'Learner-visible feedback',
    feedbackHint: 'Write 10–5000 characters. Do not include private reviewer notes.',
    requiresRevision: 'Request a revision instead of a final decision',
    submitDecision: 'Record review decision',
    decisionHistory: 'Review decision history',
    noDecisionHistory: 'No review decision has been recorded yet.',
    decisionRecorded: 'Recorded',
    governanceTitle: 'Human review only',
    governanceBody:
      'No AI grading or automatic certification is used. The reviewer supplies the score, revision choice and feedback; the resulting lifecycle state is recorded with append-only review and audit history.',
    statuses: {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      IN_REVIEW: 'In review',
      REVISION_REQUIRED: 'Revision required',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    },
  },
  fr: {
    nav: 'Évaluations',
    eyebrow: 'Évaluations attribuées',
    title: 'Espace d’évaluation des projets professionnels',
    intro:
      'Consultez uniquement les projets professionnels explicitement attribués à votre compte évaluateur synchronisé. Les décisions suivent le contrat d’évaluation encadré et sont conservées dans un historique immuable.',
    queue: 'File d’évaluation actuelle',
    history: 'Historique attribué',
    noQueue: 'Aucun projet n’attend actuellement votre évaluation.',
    noHistory: 'Aucun autre projet attribué n’est disponible.',
    project: 'Projet',
    programme: 'Programme',
    status: 'Statut',
    submitted: 'Envoyé',
    updated: 'Mis à jour',
    open: 'Ouvrir le projet attribué',
    back: 'Retour au tableau de bord',
    backToReviews: 'Retour aux évaluations',
    detailEyebrow: 'Projet attribué',
    artifact: 'Livrable du projet',
    openArtifact: 'Ouvrir le livrable',
    noArtifact: 'Aucun lien de livrable valide n’est disponible.',
    reflection: 'Réflexion de l’apprenant',
    noReflection: 'Aucune réflexion n’est disponible pour ce projet.',
    privacyTitle: 'Attribution exacte uniquement',
    privacyBody:
      'Le contenu n’est chargé qu’après vérification de votre attribution persistée comme évaluateur. Aucune donnée sans rapport sur les apprenants, la psychologie, la finance, les certificats, les organisations ou le réseau n’est exposée.',
    startReviewTitle: 'Commencer cette évaluation',
    startReviewBody:
      'Le démarrage place ce projet attribué en cours d’évaluation et enregistre un événement d’audit.',
    startReview: 'Commencer l’évaluation',
    decisionTitle: 'Enregistrer une décision encadrée',
    decisionBody:
      'Saisissez votre note humaine et un retour visible par l’apprenant. Une demande de révision est prioritaire ; sinon une note de 70 ou plus est approuvée et une note inférieure est rejetée selon le contrat existant.',
    score: 'Note (0–100)',
    scoreHint: 'Saisissez la note attribuée après votre évaluation du projet.',
    feedback: 'Retour visible par l’apprenant',
    feedbackHint:
      'Écrivez entre 10 et 5000 caractères. N’incluez pas de notes privées de l’évaluateur.',
    requiresRevision: 'Demander une révision au lieu d’une décision finale',
    submitDecision: 'Enregistrer la décision',
    decisionHistory: 'Historique des décisions',
    noDecisionHistory: 'Aucune décision d’évaluation n’a encore été enregistrée.',
    decisionRecorded: 'Enregistré',
    governanceTitle: 'Évaluation humaine uniquement',
    governanceBody:
      'Aucune notation par IA ni certification automatique n’est utilisée. L’évaluateur fournit la note, le choix de révision et le retour ; l’état résultant est conservé avec un historique d’évaluation et d’audit immuable.',
    statuses: {
      DRAFT: 'Brouillon',
      SUBMITTED: 'Envoyé',
      IN_REVIEW: 'En évaluation',
      REVISION_REQUIRED: 'Révision demandée',
      APPROVED: 'Approuvé',
      REJECTED: 'Rejeté',
    },
  },
  ar: {
    nav: 'المراجعات',
    eyebrow: 'المراجعات المعيّنة',
    title: 'مساحة مراجعة المشاريع المهنية',
    intro:
      'اطّلع فقط على المشاريع المهنية المعيّنة صراحةً لحساب المراجع المتزامن الخاص بك. تتبع القرارات عقد المراجعة المنظم وتُحفظ في سجل غير قابل للتعديل.',
    queue: 'قائمة المراجعة الحالية',
    history: 'سجل الأعمال المعيّنة',
    noQueue: 'لا توجد حالياً مشاريع تنتظر مراجعتك.',
    noHistory: 'لا توجد أعمال أخرى معيّنة متاحة.',
    project: 'المشروع',
    programme: 'البرنامج',
    status: 'الحالة',
    submitted: 'تاريخ الإرسال',
    updated: 'آخر تحديث',
    open: 'فتح المشروع المعيّن',
    back: 'العودة إلى لوحة التحكم',
    backToReviews: 'العودة إلى المراجعات',
    detailEyebrow: 'مشروع معيّن',
    artifact: 'مخرج المشروع',
    openArtifact: 'فتح مخرج المشروع',
    noArtifact: 'لا يوجد رابط صالح لمخرج المشروع.',
    reflection: 'انعكاس المتعلم',
    noReflection: 'لا يوجد انعكاس متاح لهذا المشروع.',
    privacyTitle: 'التعيين الصريح فقط',
    privacyBody:
      'لا يتم تحميل محتوى المشروع إلا بعد التحقق من تعيينك المحفوظ كمراجع. ولا تُعرض بيانات غير مرتبطة بالمتعلمين أو علم النفس أو الشؤون المالية أو الشهادات أو المؤسسات أو الشبكة.',
    startReviewTitle: 'بدء هذه المراجعة',
    startReviewBody:
      'يؤدي بدء المراجعة إلى نقل المشروع المعيّن إلى حالة قيد المراجعة وتسجيل حدث تدقيق.',
    startReview: 'بدء المراجعة',
    decisionTitle: 'تسجيل قرار مراجعة منظم',
    decisionBody:
      'أدخل الدرجة التي منحتها والتغذية الراجعة المرئية للمتعلم. طلب التعديل له الأولوية؛ وإلا تُقبل الدرجات من 70 فما فوق وتُرفض الدرجات الأدنى وفق عقد المراجعة الحالي.',
    score: 'الدرجة (0–100)',
    scoreHint: 'أدخل الدرجة التي منحتها بعد مراجعة المشروع.',
    feedback: 'تغذية راجعة مرئية للمتعلم',
    feedbackHint:
      'اكتب من 10 إلى 5000 حرف. لا تُدرج ملاحظات خاصة بالمراجع.',
    requiresRevision: 'طلب تعديل بدلاً من قرار نهائي',
    submitDecision: 'تسجيل قرار المراجعة',
    decisionHistory: 'سجل قرارات المراجعة',
    noDecisionHistory: 'لم يتم تسجيل أي قرار مراجعة بعد.',
    decisionRecorded: 'تم التسجيل',
    governanceTitle: 'مراجعة بشرية فقط',
    governanceBody:
      'لا يُستخدم تصحيح بالذكاء الاصطناعي ولا اعتماد تلقائي. يحدد المراجع الدرجة وخيار التعديل والتغذية الراجعة، وتُحفظ الحالة الناتجة في سجل مراجعة وتدقيق غير قابل للتعديل.',
    statuses: {
      DRAFT: 'مسودة',
      SUBMITTED: 'تم الإرسال',
      IN_REVIEW: 'قيد المراجعة',
      REVISION_REQUIRED: 'مطلوب تعديل',
      APPROVED: 'مقبول',
      REJECTED: 'مرفوض',
    },
  },
} as const satisfies Record<Locale, ReviewerCopy>;

export function getProfessionalReviewerCopy(locale: Locale): ReviewerCopy {
  return COPY[locale];
}
