import type { Locale } from '@luminol/localization';

const LEARNER_OUTCOMES_COPY = {
  en: {
    nav: 'Progress',
    eyebrow: 'My learning outcomes',
    title: 'See the progress your learning has created.',
    intro:
      'A private summary of your own Luminol learning records. These numbers describe completed activity only; they are not a score, ranking, diagnosis or prediction.',
    activeProgrammes: 'Active programmes',
    completedProgrammes: 'Completed programmes',
    completedLessons: 'Completed lessons',
    inProgressLessons: 'Lessons in progress',
    certificatesEarned: 'Active certificates',
    latestActivity: 'Latest learning activity',
    noActivity: 'No learning activity yet',
    privacyTitle: 'Private by design',
    privacyBody:
      'This view is visible only to you and is built from your enrolment, lesson-progress and certificate status records. It does not use assessment answers, psychology content, enquiry messages, payment details or private certificate metadata.',
    back: 'Back to dashboard',
  },
  fr: {
    nav: 'Progression',
    eyebrow: 'Mes résultats d’apprentissage',
    title: 'Visualisez les progrès créés par votre apprentissage.',
    intro:
      'Un résumé privé de vos propres données d’apprentissage Luminol. Ces chiffres décrivent uniquement l’activité accomplie ; ils ne constituent ni une note, ni un classement, ni un diagnostic, ni une prédiction.',
    activeProgrammes: 'Programmes actifs',
    completedProgrammes: 'Programmes terminés',
    completedLessons: 'Leçons terminées',
    inProgressLessons: 'Leçons en cours',
    certificatesEarned: 'Certificats actifs',
    latestActivity: 'Dernière activité d’apprentissage',
    noActivity: 'Aucune activité d’apprentissage pour le moment',
    privacyTitle: 'Privé par conception',
    privacyBody:
      'Cette vue n’est visible que par vous et repose sur vos statuts d’inscription, de progression des leçons et de certificats. Elle n’utilise pas les réponses aux évaluations, le contenu psychologique, les demandes de contact, les données de paiement ni les métadonnées privées des certificats.',
    back: 'Retour au tableau de bord',
  },
  ar: {
    nav: 'التقدّم',
    eyebrow: 'نتائج تعلّمي',
    title: 'تابع التقدّم الذي حققته في رحلتك التعليمية.',
    intro:
      'ملخص خاص بسجلات تعلّمك أنت فقط في لومينول. هذه الأرقام تصف النشاط المنجز ولا تمثل تقييماً أو ترتيباً أو تشخيصاً أو تنبؤاً.',
    activeProgrammes: 'البرامج النشطة',
    completedProgrammes: 'البرامج المكتملة',
    completedLessons: 'الدروس المكتملة',
    inProgressLessons: 'الدروس قيد التقدّم',
    certificatesEarned: 'الشهادات النشطة',
    latestActivity: 'آخر نشاط تعليمي',
    noActivity: 'لا يوجد نشاط تعليمي بعد',
    privacyTitle: 'خصوصية مدمجة في التصميم',
    privacyBody:
      'هذه الصفحة مرئية لك وحدك، وتُبنى من حالات التسجيل وتقدّم الدروس والشهادات الخاصة بك. ولا تستخدم إجابات التقييم أو المحتوى النفسي أو رسائل الاستفسار أو بيانات الدفع أو البيانات الخاصة المرفقة بالشهادات.',
    back: 'العودة إلى لوحة التحكم',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function getLearnerOutcomesCopy(locale: Locale) {
  return LEARNER_OUTCOMES_COPY[locale];
}
