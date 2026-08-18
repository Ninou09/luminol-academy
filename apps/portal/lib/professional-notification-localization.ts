import type { Locale } from '@luminol/localization';

export const PROFESSIONAL_NOTIFICATION_TEMPLATE_KEYS = [
  'professional_submission_submitted',
  'professional_submission_resubmitted',
  'professional_review_started',
  'professional_revision_requested',
  'professional_submission_approved',
  'professional_submission_rejected',
] as const;

export type ProfessionalNotificationTemplateKey =
  (typeof PROFESSIONAL_NOTIFICATION_TEMPLATE_KEYS)[number];

type ProfessionalNotificationCopy = {
  title: string;
  message: string;
  action: string;
};

const COPY = {
  en: {
    professional_submission_submitted: {
      title: 'Project ready for review',
      message:
        'A professional project assigned to you has been submitted and is ready for review.',
      action: 'Open reviews',
    },
    professional_submission_resubmitted: {
      title: 'Project resubmitted',
      message:
        'A professional project assigned to you has been resubmitted after revision and is ready for review.',
      action: 'Open reviews',
    },
    professional_review_started: {
      title: 'Project review started',
      message: 'A reviewer has started reviewing your professional project.',
      action: 'Open projects',
    },
    professional_revision_requested: {
      title: 'Revision requested',
      message:
        'Revisions are required for your professional project. Open Projects to read the reviewer feedback and resubmit.',
      action: 'Open projects',
    },
    professional_submission_approved: {
      title: 'Project approved',
      message:
        'Your professional project review is complete and the project was approved.',
      action: 'Open projects',
    },
    professional_submission_rejected: {
      title: 'Project not approved',
      message:
        'Your professional project review is complete and the project was not approved. Open Projects to read the reviewer feedback.',
      action: 'Open projects',
    },
  },
  fr: {
    professional_submission_submitted: {
      title: 'Projet prêt à être évalué',
      message:
        'Un projet professionnel qui vous est attribué a été envoyé et est prêt à être évalué.',
      action: 'Ouvrir les évaluations',
    },
    professional_submission_resubmitted: {
      title: 'Projet renvoyé',
      message:
        'Un projet professionnel qui vous est attribué a été renvoyé après révision et est prêt à être évalué.',
      action: 'Ouvrir les évaluations',
    },
    professional_review_started: {
      title: 'Évaluation du projet commencée',
      message:
        'Un évaluateur a commencé l’évaluation de votre projet professionnel.',
      action: 'Ouvrir les projets',
    },
    professional_revision_requested: {
      title: 'Révision demandée',
      message:
        'Des révisions sont nécessaires pour votre projet professionnel. Ouvrez Projets pour lire le retour de l’évaluateur et renvoyer votre travail.',
      action: 'Ouvrir les projets',
    },
    professional_submission_approved: {
      title: 'Projet approuvé',
      message:
        'L’évaluation de votre projet professionnel est terminée et le projet a été approuvé.',
      action: 'Ouvrir les projets',
    },
    professional_submission_rejected: {
      title: 'Projet non approuvé',
      message:
        'L’évaluation de votre projet professionnel est terminée et le projet n’a pas été approuvé. Ouvrez Projets pour lire le retour de l’évaluateur.',
      action: 'Ouvrir les projets',
    },
  },
  ar: {
    professional_submission_submitted: {
      title: 'المشروع جاهز للمراجعة',
      message: 'تم إرسال مشروع مهني معيّن لك وأصبح جاهزاً للمراجعة.',
      action: 'فتح المراجعات',
    },
    professional_submission_resubmitted: {
      title: 'تمت إعادة إرسال المشروع',
      message:
        'تمت إعادة إرسال مشروع مهني معيّن لك بعد التعديل وأصبح جاهزاً للمراجعة.',
      action: 'فتح المراجعات',
    },
    professional_review_started: {
      title: 'بدأت مراجعة المشروع',
      message: 'بدأ أحد المراجعين مراجعة مشروعك المهني.',
      action: 'فتح المشاريع',
    },
    professional_revision_requested: {
      title: 'مطلوب تعديل المشروع',
      message:
        'يتطلب مشروعك المهني تعديلات. افتح قسم المشاريع لقراءة ملاحظات المراجع ثم أعد الإرسال.',
      action: 'فتح المشاريع',
    },
    professional_submission_approved: {
      title: 'تم قبول المشروع',
      message: 'اكتملت مراجعة مشروعك المهني وتم قبول المشروع.',
      action: 'فتح المشاريع',
    },
    professional_submission_rejected: {
      title: 'لم يتم قبول المشروع',
      message:
        'اكتملت مراجعة مشروعك المهني ولم يتم قبول المشروع. افتح قسم المشاريع لقراءة ملاحظات المراجع.',
      action: 'فتح المشاريع',
    },
  },
} as const satisfies Record<
  Locale,
  Record<ProfessionalNotificationTemplateKey, ProfessionalNotificationCopy>
>;

export function isProfessionalNotificationTemplateKey(
  value: string,
): value is ProfessionalNotificationTemplateKey {
  return PROFESSIONAL_NOTIFICATION_TEMPLATE_KEYS.some((key) => key === value);
}

export function getProfessionalNotificationCopy(
  locale: Locale,
  templateKey: string,
): ProfessionalNotificationCopy | null {
  if (!isProfessionalNotificationTemplateKey(templateKey)) return null;
  return COPY[locale][templateKey];
}

export function getProfessionalNotificationHref(templateKey: string) {
  if (!isProfessionalNotificationTemplateKey(templateKey)) return null;
  return templateKey === 'professional_submission_submitted' ||
    templateKey === 'professional_submission_resubmitted'
    ? '/reviews'
    : '/projects';
}
