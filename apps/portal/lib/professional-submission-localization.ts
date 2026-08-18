import type { Locale } from '@luminol/localization';
import type { ProfessionalSubmissionStatus } from '@luminol/database';

type SubmissionCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  available: string;
  programme: string;
  status: string;
  noProjects: string;
  startDraft: string;
  artifactUrl: string;
  artifactHint: string;
  reflection: string;
  reflectionHint: string;
  saveDraft: string;
  submit: string;
  resubmit: string;
  submittedOn: string;
  reviewedOn: string;
  openArtifact: string;
  privacyTitle: string;
  privacyBody: string;
  statuses: Record<ProfessionalSubmissionStatus, string>;
};

const copy = {
  en: {
    nav: 'Projects',
    eyebrow: 'Practical work',
    title: 'My project submissions',
    intro:
      'Create and submit practical project work only for programmes you are currently eligible to access. Your submissions stay private to you and explicitly assigned reviewers.',
    back: 'Back to dashboard',
    available: 'Available project work',
    programme: 'Programme',
    status: 'Status',
    noProjects: 'No eligible professional project work is available yet.',
    startDraft: 'Start draft',
    artifactUrl: 'Project link',
    artifactHint: 'Use a valid https:// or http:// link to your project artifact.',
    reflection: 'Reflection',
    reflectionHint:
      'When submitting, include at least 20 characters describing your work and decisions.',
    saveDraft: 'Save draft',
    submit: 'Submit for review',
    resubmit: 'Resubmit for review',
    submittedOn: 'Submitted',
    reviewedOn: 'Last reviewed',
    openArtifact: 'Open submitted project',
    privacyTitle: 'Private by design',
    privacyBody:
      'Only your own project records are shown here. Project content is not used for learner ranking or aggregate analytics.',
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
    nav: 'Projets',
    eyebrow: 'Travaux pratiques',
    title: 'Mes projets soumis',
    intro:
      'Créez et soumettez vos travaux pratiques uniquement pour les programmes auxquels vous avez actuellement accès. Vos contenus restent privés entre vous et les évaluateurs explicitement désignés.',
    back: 'Retour au tableau de bord',
    available: 'Projets disponibles',
    programme: 'Programme',
    status: 'Statut',
    noProjects: 'Aucun projet professionnel éligible n’est disponible pour le moment.',
    startDraft: 'Commencer un brouillon',
    artifactUrl: 'Lien du projet',
    artifactHint: 'Utilisez un lien valide commençant par https:// ou http://.',
    reflection: 'Réflexion',
    reflectionHint:
      'Lors de l’envoi, ajoutez au moins 20 caractères décrivant votre travail et vos décisions.',
    saveDraft: 'Enregistrer le brouillon',
    submit: 'Envoyer pour évaluation',
    resubmit: 'Renvoyer pour évaluation',
    submittedOn: 'Envoyé',
    reviewedOn: 'Dernière évaluation',
    openArtifact: 'Ouvrir le projet soumis',
    privacyTitle: 'Privé par conception',
    privacyBody:
      'Seuls vos propres projets sont affichés ici. Le contenu de vos projets n’est pas utilisé pour classer les apprenants ni pour les analyses agrégées.',
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
    nav: 'المشاريع',
    eyebrow: 'العمل التطبيقي',
    title: 'مشاريعي المقدمة',
    intro:
      'أنشئ وقدّم أعمالك التطبيقية فقط ضمن البرامج التي يحق لك الوصول إليها حالياً. تبقى مشاركاتك خاصة بينك وبين المراجعين المعيّنين بشكل صريح.',
    back: 'العودة إلى لوحة التحكم',
    available: 'المشاريع المتاحة',
    programme: 'البرنامج',
    status: 'الحالة',
    noProjects: 'لا توجد حالياً مشاريع مهنية مؤهلة متاحة لك.',
    startDraft: 'بدء مسودة',
    artifactUrl: 'رابط المشروع',
    artifactHint: 'استخدم رابطاً صالحاً يبدأ بـ https:// أو http://.',
    reflection: 'الانعكاس والتعليق',
    reflectionHint:
      'عند التقديم، اكتب 20 حرفاً على الأقل تصف فيها عملك والقرارات التي اتخذتها.',
    saveDraft: 'حفظ المسودة',
    submit: 'إرسال للمراجعة',
    resubmit: 'إعادة الإرسال للمراجعة',
    submittedOn: 'تاريخ الإرسال',
    reviewedOn: 'آخر مراجعة',
    openArtifact: 'فتح المشروع المقدم',
    privacyTitle: 'الخصوصية من الأساس',
    privacyBody:
      'تظهر هنا مشاريعك أنت فقط. ولا يُستخدم محتوى مشاريعك لترتيب المتعلمين أو في التحليلات التجميعية.',
    statuses: {
      DRAFT: 'مسودة',
      SUBMITTED: 'تم الإرسال',
      IN_REVIEW: 'قيد المراجعة',
      REVISION_REQUIRED: 'مطلوب تعديل',
      APPROVED: 'مقبول',
      REJECTED: 'مرفوض',
    },
  },
} as const satisfies Record<Locale, SubmissionCopy>;

export function getProfessionalSubmissionCopy(locale: Locale): SubmissionCopy {
  return copy[locale];
}
