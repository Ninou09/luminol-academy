import {
  getAttendanceCertificateCopy,
  type Locale,
} from '@luminol/localization';

import { buildProgrammeContactHref } from './programme-contact';
import {
  isProgrammeWaitlist,
  localizeProgrammeEnquiryAction,
  localizeProgrammeWaitlistAction,
  localizeProgrammeWaitlistLabel,
} from './programme-presentation';

const enquiryCopy = {
  ar: {
    title: 'قبل التسجيل',
    guidance:
      'استفسر من فريقنا عن الموعد والرسوم ونمط التقديم. إرسال الاستفسار لا يعني تأكيد التسجيل.',
    context: 'يفتح نموذج استفسار مرتبطًا بهذا البرنامج.',
  },
  fr: {
    title: 'Avant de vous inscrire',
    guidance:
      'Vérifiez les dates, les tarifs et les modalités avec notre équipe. Une demande d’information ne confirme pas une inscription.',
    context: 'Ouvre une demande d’information pour ce programme.',
  },
  en: {
    title: 'Before you register',
    guidance:
      'Check the dates, fees and delivery format with our team. An enquiry is not a confirmed registration.',
    context: 'Opens an enquiry for this programme.',
  },
} as const satisfies Record<
  Locale,
  { title: string; guidance: string; context: string }
>;

export function getProgrammeEnquiryCard(locale: Locale, programmeSlug: string) {
  const isWaitlist = isProgrammeWaitlist(programmeSlug);
  return {
    ...enquiryCopy[locale],
    certificate: getAttendanceCertificateCopy(locale),
    status: isWaitlist ? localizeProgrammeWaitlistLabel(locale) : null,
    action: isWaitlist
      ? localizeProgrammeWaitlistAction(locale)
      : localizeProgrammeEnquiryAction(locale),
    href: buildProgrammeContactHref(locale, programmeSlug),
  };
}
