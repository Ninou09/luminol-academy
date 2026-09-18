import type { Locale } from './index';

const attendanceCertificateCopy = {
  ar: {
    title: 'شهادة حضور',
    participation: 'حضر برنامج لومينول',
    scope:
      'شهادة حضور صادرة عن أكاديمية لومينول، ولا تمثل اعتمادًا أكاديميًا أو ترخيصًا لمزاولة مهنة.',
  },
  fr: {
    title: 'Attestation de présence',
    participation: 'a participé au programme Luminol',
    scope:
      'Cette attestation de présence est délivrée par Luminol Academy. Elle ne constitue ni une accréditation académique ni une autorisation d’exercice professionnel.',
  },
  en: {
    title: 'Attendance certificate',
    participation: 'attended the Luminol programme',
    scope:
      'This attendance certificate is issued by Luminol Academy. It does not confer academic accreditation or a licence to practise.',
  },
} as const satisfies Record<
  Locale,
  { title: string; participation: string; scope: string }
>;

export function getAttendanceCertificateCopy(locale: Locale) {
  return attendanceCertificateCopy[locale];
}
