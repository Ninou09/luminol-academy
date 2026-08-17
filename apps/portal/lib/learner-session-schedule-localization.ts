import type { Locale } from '@luminol/localization';
import type { AttendanceStatus } from '@luminol/professional';

export type LearnerSessionScheduleCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  upcoming: string;
  past: string;
  noUpcoming: string;
  noPast: string;
  session: string;
  cohort: string;
  programme: string;
  starts: string;
  ends: string;
  timeZone: string;
  status: string;
  attendance: string;
  attendanceRecordedAt: string;
  notRecorded: string;
  privacyTitle: string;
  privacyBody: string;
  boundedNotice: string;
  back: string;
  attendanceLabels: Record<AttendanceStatus, string>;
  sessionStatuses: Record<'SCHEDULED' | 'COMPLETED' | 'CANCELLED', string>;
};

const COPY: Record<Locale, LearnerSessionScheduleCopy> = {
  en: {
    nav: 'Schedule',
    eyebrow: 'My cohort schedule',
    title: 'Your sessions and attendance, in one private view.',
    intro:
      'See your own upcoming and previous cohort sessions. Attendance shown here belongs only to your learner membership and is not a comparison or ranking.',
    upcoming: 'Upcoming sessions',
    past: 'Past and closed sessions',
    noUpcoming: 'No upcoming sessions are currently scheduled for your active cohort memberships.',
    noPast: 'No previous sessions are available yet.',
    session: 'Session',
    cohort: 'Cohort',
    programme: 'Programme',
    starts: 'Starts',
    ends: 'Ends',
    timeZone: 'Timezone',
    status: 'Status',
    attendance: 'Your attendance',
    attendanceRecordedAt: 'Attendance last recorded',
    notRecorded: 'Not recorded',
    privacyTitle: 'Private by design',
    privacyBody:
      'This page is scoped to your synchronized user account. It does not expose other learners, instructor notes, psychology content, organization data, payment data or attendance recorder identities.',
    boundedNotice:
      'The schedule is deliberately bounded to the most recent 100 relevant sessions.',
    back: 'Back to dashboard',
    attendanceLabels: {
      PRESENT: 'Present',
      ABSENT: 'Absent',
      LATE: 'Late',
      EXCUSED: 'Excused',
    },
    sessionStatuses: {
      SCHEDULED: 'Scheduled',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    },
  },
  fr: {
    nav: 'Calendrier',
    eyebrow: 'Mon calendrier de groupe',
    title: 'Vos séances et votre présence dans une vue privée.',
    intro:
      'Consultez vos propres séances de groupe à venir et passées. La présence affichée ici concerne uniquement votre appartenance apprenant et ne constitue ni une comparaison ni un classement.',
    upcoming: 'Séances à venir',
    past: 'Séances passées et clôturées',
    noUpcoming:
      'Aucune séance à venir n’est actuellement planifiée pour vos appartenances actives.',
    noPast: 'Aucune séance précédente n’est disponible pour le moment.',
    session: 'Séance',
    cohort: 'Groupe',
    programme: 'Programme',
    starts: 'Début',
    ends: 'Fin',
    timeZone: 'Fuseau horaire',
    status: 'Statut',
    attendance: 'Votre présence',
    attendanceRecordedAt: 'Dernier enregistrement de présence',
    notRecorded: 'Non enregistrée',
    privacyTitle: 'Privé par conception',
    privacyBody:
      'Cette page est limitée à votre compte utilisateur synchronisé. Elle n’expose pas les autres apprenants, les notes des formateurs, le contenu psychologique, les données d’organisation, les données de paiement ni l’identité de la personne ayant enregistré la présence.',
    boundedNotice:
      'Le calendrier est volontairement limité aux 100 séances pertinentes les plus récentes.',
    back: 'Retour au tableau de bord',
    attendanceLabels: {
      PRESENT: 'Présent',
      ABSENT: 'Absent',
      LATE: 'En retard',
      EXCUSED: 'Excusé',
    },
    sessionStatuses: {
      SCHEDULED: 'Planifiée',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    },
  },
  ar: {
    nav: 'الجدول',
    eyebrow: 'جدول مجموعتي',
    title: 'جلساتك وحضورك في عرض خاص واحد.',
    intro:
      'اطّلع على جلسات مجموعتك القادمة والسابقة الخاصة بك. حالة الحضور المعروضة هنا مرتبطة بعضويتك التعليمية أنت فقط، وليست مقارنة أو ترتيباً.',
    upcoming: 'الجلسات القادمة',
    past: 'الجلسات السابقة والمغلقة',
    noUpcoming: 'لا توجد جلسات قادمة مجدولة حالياً لعضوياتك النشطة في المجموعات.',
    noPast: 'لا توجد جلسات سابقة متاحة بعد.',
    session: 'الجلسة',
    cohort: 'المجموعة',
    programme: 'البرنامج',
    starts: 'البداية',
    ends: 'النهاية',
    timeZone: 'المنطقة الزمنية',
    status: 'الحالة',
    attendance: 'حضورك',
    attendanceRecordedAt: 'آخر تسجيل للحضور',
    notRecorded: 'غير مسجل',
    privacyTitle: 'خصوصية مدمجة في التصميم',
    privacyBody:
      'هذه الصفحة محصورة في حسابك المتزامن. ولا تعرض متعلمين آخرين أو ملاحظات المدرّسين أو المحتوى النفسي أو بيانات المؤسسات أو الدفع أو هوية من سجّل الحضور.',
    boundedNotice: 'الجدول محدود عمداً بأحدث 100 جلسة ذات صلة.',
    back: 'العودة إلى لوحة التحكم',
    attendanceLabels: {
      PRESENT: 'حاضر',
      ABSENT: 'غائب',
      LATE: 'متأخر',
      EXCUSED: 'غياب بعذر',
    },
    sessionStatuses: {
      SCHEDULED: 'مجدولة',
      COMPLETED: 'مكتملة',
      CANCELLED: 'ملغاة',
    },
  },
};

export function getLearnerSessionScheduleCopy(locale: Locale) {
  return COPY[locale];
}
