import type { Locale } from '@luminol/localization';
import type { AttendanceStatus } from '@luminol/professional';

export type InstructorAttendanceCopy = {
  eyebrow: string;
  title: string;
  sessions: string;
  session: string;
  attendance: string;
  attendanceCount: string;
  openAttendance: string;
  noSessions: string;
  back: string;
  course: string;
  role: string;
  sessionStatus: string;
  starts: string;
  ends: string;
  timeZone: string;
  roster: string;
  learner: string;
  learnerFallback: string;
  currentAttendance: string;
  notRecorded: string;
  recordedAt: string;
  save: string;
  readonlyTitle: string;
  readonlyBody: string;
  noEligibleLearners: string;
  futureSession: string;
  statusLabels: Record<AttendanceStatus, string>;
  sessionStatuses: Record<'SCHEDULED' | 'COMPLETED' | 'CANCELLED', string>;
};

const COPY: Record<Locale, InstructorAttendanceCopy> = {
  en: {
    eyebrow: 'Session attendance',
    title: 'Attendance workspace',
    sessions: 'Cohort sessions',
    session: 'Session',
    attendance: 'Attendance',
    attendanceCount: 'Recorded attendance',
    openAttendance: 'Open attendance',
    noSessions:
      'No available first-party sessions are recorded for this cohort.',
    back: 'Back to cohort teaching view',
    course: 'Programme',
    role: 'Your role',
    sessionStatus: 'Session status',
    starts: 'Starts',
    ends: 'Ends',
    timeZone: 'Timezone',
    roster: 'Eligible learner roster',
    learner: 'Learner',
    learnerFallback: 'Learner',
    currentAttendance: 'Current attendance',
    notRecorded: 'Not recorded',
    recordedAt: 'Last recorded',
    save: 'Save attendance',
    readonlyTitle: 'Read-only attendance',
    readonlyBody:
      'Reviewer assignments can inspect attendance state but cannot create or change attendance records.',
    noEligibleLearners:
      'No active learner memberships are eligible for attendance in this session.',
    futureSession:
      'Attendance can be recorded only after the session start time.',
    statusLabels: {
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
    eyebrow: 'Présence à la séance',
    title: 'Espace de présence',
    sessions: 'Séances du groupe',
    session: 'Séance',
    attendance: 'Présence',
    attendanceCount: 'Présences enregistrées',
    openAttendance: 'Ouvrir la présence',
    noSessions:
      "Aucune séance interne disponible n'est enregistrée pour ce groupe.",
    back: "Retour à la vue d'enseignement du groupe",
    course: 'Programme',
    role: 'Votre rôle',
    sessionStatus: 'Statut de la séance',
    starts: 'Début',
    ends: 'Fin',
    timeZone: 'Fuseau horaire',
    roster: 'Liste des apprenants éligibles',
    learner: 'Apprenant',
    learnerFallback: 'Apprenant',
    currentAttendance: 'Présence actuelle',
    notRecorded: 'Non enregistrée',
    recordedAt: 'Dernier enregistrement',
    save: 'Enregistrer la présence',
    readonlyTitle: 'Présence en lecture seule',
    readonlyBody:
      "Les affectations d'évaluateur peuvent consulter la présence mais ne peuvent ni créer ni modifier les enregistrements.",
    noEligibleLearners:
      "Aucune appartenance active d'apprenant n'est éligible pour cette séance.",
    futureSession:
      "La présence ne peut être enregistrée qu'après le début de la séance.",
    statusLabels: {
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
    eyebrow: 'حضور الجلسة',
    title: 'مساحة إدارة الحضور',
    sessions: 'جلسات المجموعة',
    session: 'الجلسة',
    attendance: 'الحضور',
    attendanceCount: 'الحضور المسجل',
    openAttendance: 'فتح سجل الحضور',
    noSessions: 'لا توجد جلسات داخلية متاحة ومسجلة لهذه المجموعة.',
    back: 'العودة إلى عرض تدريس المجموعة',
    course: 'البرنامج',
    role: 'دورك',
    sessionStatus: 'حالة الجلسة',
    starts: 'البداية',
    ends: 'النهاية',
    timeZone: 'المنطقة الزمنية',
    roster: 'قائمة المتعلمين المؤهلين',
    learner: 'المتعلم',
    learnerFallback: 'متعلم',
    currentAttendance: 'حالة الحضور الحالية',
    notRecorded: 'غير مسجل',
    recordedAt: 'آخر تسجيل',
    save: 'حفظ الحضور',
    readonlyTitle: 'الحضور للقراءة فقط',
    readonlyBody:
      'يمكن للمراجع الاطلاع على حالة الحضور، لكنه لا يستطيع إنشاء سجلات الحضور أو تعديلها.',
    noEligibleLearners:
      'لا توجد عضويات نشطة لمتعلمين مؤهلين للحضور في هذه الجلسة.',
    futureSession: 'يمكن تسجيل الحضور فقط بعد وقت بداية الجلسة.',
    statusLabels: {
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

export function getInstructorAttendanceCopy(locale: Locale) {
  return COPY[locale];
}
