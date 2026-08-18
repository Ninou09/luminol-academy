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
  readOnlyTitle: string;
  readOnlyBody: string;
  statuses: Record<ProfessionalSubmissionStatus, string>;
};

const COPY = {
  en: {
    nav: 'Reviews',
    eyebrow: 'Assigned reviews',
    title: 'Professional project review workspace',
    intro:
      'See only professional submissions explicitly assigned to your synchronized reviewer account. This slice is read-only; review decisions are not available here yet.',
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
    readOnlyTitle: 'Read-only review view',
    readOnlyBody:
      'This workspace currently presents assigned work only. Review decisions and governed feedback are delivered in the next milestone slice.',
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
      'Consultez uniquement les projets professionnels explicitement attribués à votre compte évaluateur synchronisé. Cette étape est en lecture seule : les décisions d’évaluation ne sont pas encore disponibles ici.',
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
    readOnlyTitle: 'Vue d’évaluation en lecture seule',
    readOnlyBody:
      'Cet espace présente actuellement uniquement les travaux attribués. Les décisions et retours encadrés seront ajoutés dans la prochaine étape du jalon.',
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
      'اطّلع فقط على المشاريع المهنية المعيّنة صراحةً لحساب المراجع المتزامن الخاص بك. هذه المرحلة للقراءة فقط، ولا تتضمن قرارات المراجعة بعد.',
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
    readOnlyTitle: 'عرض مراجعة للقراءة فقط',
    readOnlyBody:
      'تعرض هذه المساحة حالياً الأعمال المعيّنة فقط. وستُضاف قرارات المراجعة والتغذية الراجعة المنظمة في المرحلة التالية من المعلم.',
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
