import type { Locale } from '@luminol/localization';

/**
 * Optional direct channels, switched on from the hosting environment:
 * NEXT_PUBLIC_WHATSAPP_NUMBER (international digits, e.g. 213XXXXXXXXX) and
 * NEXT_PUBLIC_BOOKING_URL (an https scheduling link such as Cal.com).
 * Nothing is shown until Luminol provides real values.
 */
/** Official Luminol contact details, confirmed by the academy. */
export const officialContacts = {
  whatsapp: '+213556914517',
  whatsappDisplay: '+213 556 91 45 17',
  phone: '+213777077197',
  phoneDisplay: '+213 777 07 71 97',
  email: 'luminolacademy09@gmail.com',
} as const;

/** Luminol Academy, Villa No. 2, Ezzayat Street, Blida (from Google Maps). */
export const officialAddress = {
  latitude: 36.487462285152,
  longitude: 2.8340435028076,
  street: {
    en: 'Villa No. 2, Ezzayat Street',
    fr: 'Villa n° 2, rue Ezzayat',
    ar: 'شارع الزيات، فيلا رقم 2',
  },
  city: { en: '09000 Blida', fr: '09000 Blida', ar: 'البليدة 09000' },
  country: { en: 'Algeria', fr: 'Algérie', ar: 'الجزائر' },
  schemaStreet: 'شارع الزيات، فيلا رقم 2',
  directionsHref:
    'https://www.google.com/maps/dir/?api=1&destination=36.487462285152%2C2.8340435028076',
  mapHref:
    'https://www.google.com/maps/search/?api=1&query=36.487462285152%2C2.8340435028076',
} as const satisfies {
  latitude: number;
  longitude: number;
  street: Record<Locale, string>;
  city: Record<Locale, string>;
  country: Record<Locale, string>;
  schemaStreet: string;
  directionsHref: string;
  mapHref: string;
};

export const addressCopy: Record<
  Locale,
  { title: string; directions: string; open: string; visit: string }
> = {
  en: {
    title: 'Visit the academy',
    directions: 'Get directions',
    open: 'Open in Google Maps',
    visit: 'Address',
  },
  fr: {
    title: 'Venir à l’académie',
    directions: 'Itinéraire',
    open: 'Ouvrir dans Google Maps',
    visit: 'Adresse',
  },
  ar: {
    title: 'زر الأكاديمية',
    directions: 'احصل على الاتجاهات',
    open: 'افتح في خرائط Google',
    visit: 'العنوان',
  },
};

export function getWhatsAppHref(message?: string): string | null {
  const digits = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || officialContacts.whatsapp
  ).replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function getBookingHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export const channelCopy: Record<
  Locale,
  {
    write: string;
    book: string;
    whatsapp: string;
    whatsappAria: string;
    whatsappMessage: string;
  }
> = {
  en: {
    write: 'Write to us',
    book: 'Book a time',
    whatsapp: 'WhatsApp',
    whatsappAria: 'Message Luminol on WhatsApp',
    whatsappMessage: 'Hello Luminol, I would like some information.',
  },
  fr: {
    write: 'Nous écrire',
    book: 'Réserver un créneau',
    whatsapp: 'WhatsApp',
    whatsappAria: 'Écrire à Luminol sur WhatsApp',
    whatsappMessage: 'Bonjour Luminol, je souhaite avoir des informations.',
  },
  ar: {
    write: 'اكتب إلينا',
    book: 'احجز موعدًا',
    whatsapp: 'واتساب',
    whatsappAria: 'راسل لومينول عبر واتساب',
    whatsappMessage: 'مرحبًا لومينول، أود الحصول على بعض المعلومات.',
  },
};

/** Official Luminol social profiles. */
export const socialLinks = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/luminol_academy_psy/',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/luminol.academy',
  },
] as const;

/** Opening hours: Sunday to Thursday, 08:00–17:00 (Algeria time). */
export const openingHours = {
  schema: 'Su,Mo,Tu,We,Th 08:00-17:00',
  label: {
    en: 'Sunday – Thursday · 8:00 – 17:00',
    fr: 'Du dimanche au jeudi · 8 h – 17 h',
    ar: 'من الأحد إلى الخميس · 8:00 – 17:00',
  },
  title: {
    en: 'Opening hours',
    fr: 'Horaires',
    ar: 'أوقات العمل',
  },
  note: {
    en: 'Algeria time (GMT+1).',
    fr: 'Heure d’Algérie (GMT+1).',
    ar: 'بتوقيت الجزائر (GMT+1).',
  },
} as const satisfies {
  schema: string;
  label: Record<Locale, string>;
  title: Record<Locale, string>;
  note: Record<Locale, string>;
};

export const followCopy: Record<Locale, string> = {
  en: 'Follow Luminol',
  fr: 'Suivre Luminol',
  ar: 'تابع لومينول',
};

export const contactLabels: Record<
  Locale,
  {
    title: string;
    call: string;
    callHint: string;
    whatsapp: string;
    whatsappHint: string;
    email: string;
    emailHint: string;
  }
> = {
  en: {
    title: 'Talk to the team directly',
    call: 'Call reception',
    callHint: 'Phone',
    whatsapp: 'Message on WhatsApp',
    whatsappHint: 'WhatsApp',
    email: 'Write an email',
    emailHint: 'Email',
  },
  fr: {
    title: 'Parler directement à l’équipe',
    call: 'Appeler l’accueil',
    callHint: 'Téléphone',
    whatsapp: 'Écrire sur WhatsApp',
    whatsappHint: 'WhatsApp',
    email: 'Envoyer un e-mail',
    emailHint: 'E-mail',
  },
  ar: {
    title: 'تحدّث مع الفريق مباشرة',
    call: 'اتصل بالاستقبال',
    callHint: 'الهاتف',
    whatsapp: 'راسلنا عبر واتساب',
    whatsappHint: 'واتساب',
    email: 'أرسل بريدًا إلكترونيًا',
    emailHint: 'البريد الإلكتروني',
  },
};
