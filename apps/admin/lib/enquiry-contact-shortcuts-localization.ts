import type { Locale } from '@luminol/localization';

import type { EnquiryContactShortcutKind } from './enquiry-contact-shortcuts';

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  boundary: string;
  unavailable: string;
  preferred: string;
  label: (kind: EnquiryContactShortcutKind) => string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Manual contact shortcuts',
    title: 'Open a stored contact channel',
    intro:
      'These shortcuts use only the contact details already stored on this enquiry. Nothing is sent automatically.',
    boundary:
      'Opening a shortcut does not record CONTACTED and does not prove that a message, call, reply or conversation occurred. Record workflow changes separately.',
    unavailable: 'No safe contact shortcut is available from the stored values.',
    preferred: 'Preferred',
    label: (kind) => {
      if (kind === 'email') return 'Email';
      if (kind === 'phone') return 'Call';
      return 'WhatsApp';
    },
  },
  fr: {
    eyebrow: 'Raccourcis de contact manuels',
    title: 'Ouvrir un canal de contact enregistré',
    intro:
      'Ces raccourcis utilisent uniquement les coordonnées déjà enregistrées sur cette demande. Aucun message n’est envoyé automatiquement.',
    boundary:
      'L’ouverture d’un raccourci n’enregistre pas le statut CONTACTED et ne prouve pas qu’un message, un appel, une réponse ou une conversation a eu lieu. Enregistrez séparément les changements du flux de travail.',
    unavailable:
      'Aucun raccourci de contact sûr n’est disponible à partir des valeurs enregistrées.',
    preferred: 'Préféré',
    label: (kind) => {
      if (kind === 'email') return 'E-mail';
      if (kind === 'phone') return 'Appeler';
      return 'WhatsApp';
    },
  },
  ar: {
    eyebrow: 'اختصارات تواصل يدوية',
    title: 'فتح قناة تواصل مسجلة',
    intro:
      'تستخدم هذه الاختصارات فقط بيانات التواصل المسجلة مسبقًا في هذا الطلب. لا يتم إرسال أي شيء تلقائيًا.',
    boundary:
      'فتح الاختصار لا يسجل حالة CONTACTED ولا يثبت حدوث رسالة أو مكالمة أو رد أو محادثة. يجب تسجيل تغييرات سير العمل بشكل منفصل.',
    unavailable: 'لا يتوفر اختصار تواصل آمن من القيم المسجلة.',
    preferred: 'المفضل',
    label: (kind) => {
      if (kind === 'email') return 'البريد الإلكتروني';
      if (kind === 'phone') return 'اتصال';
      return 'واتساب';
    },
  },
};

export function getEnquiryContactShortcutsCopy(locale: Locale): Copy {
  return COPY[locale];
}
