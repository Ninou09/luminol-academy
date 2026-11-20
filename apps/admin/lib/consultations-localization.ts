import type { Locale } from '@luminol/localization';
import type {
  ConsultationModeValue,
  ConsultationStatusValue,
} from '@luminol/validation/consultations';

import type { ConsultationFeedbackCode } from './consultation-scope';

export type ConsultationsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  boundary: string;
  hours: string;
  weekOf: (label: string) => string;
  previousWeek: string;
  nextWeek: string;
  thisWeek: string;
  dateLabel: string;
  go: string;
  createTitle: string;
  createIntro: string;
  clientLabel: string;
  noClients: string;
  manageClients: string;
  consultantLabel: string;
  noConsultants: string;
  timeLabel: string;
  durationLabel: string;
  minutes: (value: string) => string;
  modeLabel: string;
  initialStatusLabel: string;
  priceLabel: string;
  noteLabel: string;
  noteHelp: string;
  book: string;
  noAppointments: string;
  reschedule: string;
  saveTime: string;
  editNote: string;
  saveNote: string;
  saved: string;
  paid: string;
  recordPayment: string;
  status: Record<ConsultationStatusValue, string>;
  mode: Record<ConsultationModeValue, string>;
  moveTo: Record<ConsultationStatusValue, string>;
  feedback: Record<ConsultationFeedbackCode, string>;
};

export type ClientsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  boundary: string;
  searchLabel: string;
  search: string;
  createTitle: string;
  createIntro: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  localeLabel: string;
  localeName: Record<'ar' | 'fr' | 'en', string>;
  consentLabel: string;
  consentHelp: string;
  noteLabel: string;
  create: string;
  fromEnquiryTitle: string;
  fromEnquiryIntro: string;
  useEnquiry: string;
  noEnquiries: string;
  prefilledFrom: (name: string) => string;
  listTitle: string;
  noClients: string;
  consentYes: string;
  consentNo: string;
  fromEnquiry: string;
  edit: string;
  save: string;
  archiveLabel: string;
  upcoming: (count: string) => string;
  book: string;
  saved: string;
  feedback: Record<ConsultationFeedbackCode, string>;
};

const englishFeedback: Record<ConsultationFeedbackCode, string> = {
  'not-found': 'That record is not available in your workspace.',
  forbidden: 'Your role cannot make this change.',
  'ineligible-consultant': 'Choose an active consultant.',
  stale: 'Someone changed this appointment meanwhile. Review it and try again.',
  transition: 'That status change is not allowed for this appointment.',
  'not-started':
    'Attendance can be recorded only once the session has started.',
  overlap: 'The consultant already has an appointment at that time.',
  'already-converted': 'This enquiry already has a client record.',
  'invalid-duration': 'Choose a duration between 30 and 120 minutes.',
  misaligned: 'Start times must fall on a 15-minute step.',
  'closed-day': 'Consultations are closed on Friday.',
  'outside-hours':
    'Sessions must start and end between 08:00 and 17:00 Blida time.',
  invalid: 'Some fields are missing or invalid. Check the form and retry.',
};

const frenchFeedback: Record<ConsultationFeedbackCode, string> = {
  'not-found': 'Cet élément n’est pas disponible dans votre espace.',
  forbidden: 'Votre rôle ne permet pas cette modification.',
  'ineligible-consultant': 'Choisissez un(e) consultant(e) actif(ve).',
  stale:
    'Ce rendez-vous a été modifié entre-temps. Vérifiez-le puis réessayez.',
  transition: 'Ce changement de statut n’est pas autorisé.',
  'not-started':
    'La présence ne peut être enregistrée qu’une fois la séance commencée.',
  overlap: 'La/le consultant(e) a déjà un rendez-vous à cette heure.',
  'already-converted': 'Cette demande a déjà une fiche client.',
  'invalid-duration': 'Choisissez une durée entre 30 et 120 minutes.',
  misaligned: 'L’heure de début doit tomber sur un pas de 15 minutes.',
  'closed-day': 'Les consultations sont fermées le vendredi.',
  'outside-hours':
    'Les séances doivent commencer et finir entre 08:00 et 17:00 (heure de Blida).',
  invalid:
    'Certains champs manquent ou sont invalides. Vérifiez le formulaire.',
};

const arabicFeedback: Record<ConsultationFeedbackCode, string> = {
  'not-found': 'هذا العنصر غير متاح في مساحة عملك.',
  forbidden: 'دورك لا يسمح بهذا التعديل.',
  'ineligible-consultant': 'اختر أخصائيًا نشطًا.',
  stale: 'تم تعديل هذا الموعد في الأثناء. راجعه ثم أعد المحاولة.',
  transition: 'تغيير الحالة هذا غير مسموح لهذا الموعد.',
  'not-started': 'لا يمكن تسجيل الحضور إلا بعد بدء الجلسة.',
  overlap: 'لدى الأخصائي موعد آخر في هذا الوقت.',
  'already-converted': 'هذا الطلب لديه بطاقة عميل بالفعل.',
  'invalid-duration': 'اختر مدة بين 30 و120 دقيقة.',
  misaligned: 'يجب أن يكون وقت البدء على فواصل 15 دقيقة.',
  'closed-day': 'الاستشارات مغلقة يوم الجمعة.',
  'outside-hours': 'يجب أن تبدأ الجلسة وتنتهي بين 08:00 و17:00 بتوقيت البليدة.',
  invalid: 'بعض الحقول ناقصة أو غير صحيحة. راجع النموذج وأعد المحاولة.',
};

const englishConsultations: ConsultationsCopy = {
  eyebrow: 'Luminol Operations',
  title: 'Consultations',
  intro:
    'Book, reschedule and close psychology consultations. Every change is recorded in the appointment history.',
  boundary:
    'Operational notes only (max 500 characters). Do not record clinical observations, diagnoses or therapy content here.',
  hours: 'Open 08:00–17:00 Blida time, closed on Friday.',
  weekOf: (label) => `Week of ${label}`,
  previousWeek: 'Previous week',
  nextWeek: 'Next week',
  thisWeek: 'This week',
  dateLabel: 'Date',
  go: 'Show',
  createTitle: 'Book a consultation',
  createIntro:
    'Choose an existing client. The calendar refuses overlapping sessions for the same consultant.',
  clientLabel: 'Client',
  noClients: 'No clients yet. Create the client record first.',
  manageClients: 'Manage clients',
  consultantLabel: 'Consultant',
  noConsultants:
    'No account holds the consultant role yet. Grant it from the Team page.',
  timeLabel: 'Start time',
  durationLabel: 'Duration',
  minutes: (value) => `${value} min`,
  modeLabel: 'Format',
  initialStatusLabel: 'Status',
  priceLabel: 'Price (DZD)',
  noteLabel: 'Operational note',
  noteHelp: 'Logistics only, e.g. “pays at reception”.',
  book: 'Book',
  noAppointments: 'No appointments this week.',
  reschedule: 'Reschedule',
  saveTime: 'Save new time',
  editNote: 'Operational note',
  saveNote: 'Save note',
  saved: 'Saved.',
  paid: 'Paid',
  recordPayment: 'Record payment',
  status: {
    REQUESTED: 'Requested',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    NO_SHOW: 'No-show',
    CANCELLED: 'Cancelled',
  },
  mode: { ONSITE: 'In person', ONLINE: 'Online' },
  moveTo: {
    REQUESTED: 'Mark requested',
    CONFIRMED: 'Confirm',
    COMPLETED: 'Mark completed',
    NO_SHOW: 'Mark no-show',
    CANCELLED: 'Cancel',
  },
  feedback: englishFeedback,
};

const frenchConsultations: ConsultationsCopy = {
  eyebrow: 'Luminol Opérations',
  title: 'Consultations',
  intro:
    'Réservez, déplacez et clôturez les consultations psychologiques. Chaque changement est tracé dans l’historique du rendez-vous.',
  boundary:
    'Notes opérationnelles uniquement (500 caractères max). N’inscrivez ici aucune observation clinique, diagnostic ou contenu de thérapie.',
  hours: 'Ouvert de 08:00 à 17:00 (heure de Blida), fermé le vendredi.',
  weekOf: (label) => `Semaine du ${label}`,
  previousWeek: 'Semaine précédente',
  nextWeek: 'Semaine suivante',
  thisWeek: 'Cette semaine',
  dateLabel: 'Date',
  go: 'Afficher',
  createTitle: 'Réserver une consultation',
  createIntro:
    'Choisissez un client existant. Le calendrier refuse les chevauchements pour une même consultante.',
  clientLabel: 'Client',
  noClients: 'Aucun client. Créez d’abord la fiche client.',
  manageClients: 'Gérer les clients',
  consultantLabel: 'Consultant(e)',
  noConsultants:
    'Aucun compte n’a encore le rôle consultant(e). Attribuez-le depuis la page Équipe.',
  timeLabel: 'Heure de début',
  durationLabel: 'Durée',
  minutes: (value) => `${value} min`,
  modeLabel: 'Format',
  initialStatusLabel: 'Statut',
  priceLabel: 'Prix (DA)',
  noteLabel: 'Note opérationnelle',
  noteHelp: 'Logistique uniquement, ex. « règle à l’accueil ».',
  book: 'Réserver',
  noAppointments: 'Aucun rendez-vous cette semaine.',
  reschedule: 'Déplacer',
  saveTime: 'Enregistrer le nouvel horaire',
  editNote: 'Note opérationnelle',
  saveNote: 'Enregistrer la note',
  saved: 'Enregistré.',
  paid: 'Payé',
  recordPayment: 'Encaisser',
  status: {
    REQUESTED: 'Demandé',
    CONFIRMED: 'Confirmé',
    COMPLETED: 'Effectué',
    NO_SHOW: 'Absent',
    CANCELLED: 'Annulé',
  },
  mode: { ONSITE: 'Présentiel', ONLINE: 'En ligne' },
  moveTo: {
    REQUESTED: 'Marquer demandé',
    CONFIRMED: 'Confirmer',
    COMPLETED: 'Marquer effectué',
    NO_SHOW: 'Marquer absent',
    CANCELLED: 'Annuler',
  },
  feedback: frenchFeedback,
};

const arabicConsultations: ConsultationsCopy = {
  eyebrow: 'عمليات Luminol',
  title: 'الاستشارات',
  intro:
    'احجز الاستشارات النفسية وغيّر مواعيدها وأغلقها. كل تغيير يُسجَّل في سجل الموعد.',
  boundary:
    'ملاحظات تنظيمية فقط (500 حرف كحد أقصى). لا تسجّل هنا ملاحظات سريرية أو تشخيصات أو محتوى العلاج.',
  hours: 'مفتوح من 08:00 إلى 17:00 بتوقيت البليدة، مغلق يوم الجمعة.',
  weekOf: (label) => `أسبوع ${label}`,
  previousWeek: 'الأسبوع السابق',
  nextWeek: 'الأسبوع التالي',
  thisWeek: 'هذا الأسبوع',
  dateLabel: 'التاريخ',
  go: 'عرض',
  createTitle: 'حجز استشارة',
  createIntro:
    'اختر عميلًا موجودًا. يرفض التقويم المواعيد المتداخلة لنفس الأخصائي.',
  clientLabel: 'العميل',
  noClients: 'لا يوجد عملاء بعد. أنشئ بطاقة العميل أولًا.',
  manageClients: 'إدارة العملاء',
  consultantLabel: 'الأخصائي(ة)',
  noConsultants: 'لا يوجد حساب بدور أخصائي بعد. امنحه من صفحة الفريق.',
  timeLabel: 'وقت البدء',
  durationLabel: 'المدة',
  minutes: (value) => `${value} دقيقة`,
  modeLabel: 'الصيغة',
  initialStatusLabel: 'الحالة',
  priceLabel: 'السعر (دج)',
  noteLabel: 'ملاحظة تنظيمية',
  noteHelp: 'للتنظيم فقط، مثل «يدفع عند الاستقبال».',
  book: 'حجز',
  noAppointments: 'لا مواعيد هذا الأسبوع.',
  reschedule: 'تغيير الموعد',
  saveTime: 'حفظ الوقت الجديد',
  editNote: 'ملاحظة تنظيمية',
  saveNote: 'حفظ الملاحظة',
  saved: 'تم الحفظ.',
  paid: 'مدفوع',
  recordPayment: 'تسجيل دفعة',
  status: {
    REQUESTED: 'مطلوب',
    CONFIRMED: 'مؤكد',
    COMPLETED: 'تمت',
    NO_SHOW: 'لم يحضر',
    CANCELLED: 'ملغى',
  },
  mode: { ONSITE: 'حضوري', ONLINE: 'عن بُعد' },
  moveTo: {
    REQUESTED: 'وضع كمطلوب',
    CONFIRMED: 'تأكيد',
    COMPLETED: 'تسجيل كمكتملة',
    NO_SHOW: 'تسجيل غياب',
    CANCELLED: 'إلغاء',
  },
  feedback: arabicFeedback,
};

const englishClients: ClientsCopy = {
  eyebrow: 'Luminol Operations',
  title: 'Clients',
  intro:
    'Contact records for consultation clients. Consultants see only the clients they created or serve.',
  boundary:
    'Keep notes operational (max 500 characters). No clinical information.',
  searchLabel: 'Search by name or phone',
  search: 'Search',
  createTitle: 'New client',
  createIntro:
    'Record contact consent only when the person agreed to be contacted by Luminol.',
  nameLabel: 'Full name',
  phoneLabel: 'Phone',
  emailLabel: 'Email',
  localeLabel: 'Preferred language',
  localeName: { ar: 'العربية', fr: 'Français', en: 'English' },
  consentLabel: 'Agreed to be contacted',
  consentHelp:
    'From an enquiry, consent can never exceed what the enquirer gave.',
  noteLabel: 'Operational note',
  create: 'Create client',
  fromEnquiryTitle: 'From recent enquiries',
  fromEnquiryIntro:
    'Start a client record from an enquiry that has no client yet.',
  useEnquiry: 'Use',
  noEnquiries: 'No unconverted enquiries.',
  prefilledFrom: (name) => `Prefilled from the enquiry of ${name}.`,
  listTitle: 'Client records',
  noClients: 'No clients found.',
  consentYes: 'Contact consent',
  consentNo: 'No contact consent',
  fromEnquiry: 'From enquiry',
  edit: 'Edit',
  save: 'Save',
  archiveLabel: 'Archive this client',
  upcoming: (count) => `${count} upcoming`,
  book: 'Book consultation',
  saved: 'Saved.',
  feedback: englishFeedback,
};

const frenchClients: ClientsCopy = {
  eyebrow: 'Luminol Opérations',
  title: 'Clients',
  intro:
    'Fiches de contact des clients en consultation. Les consultant(e)s ne voient que les clients qu’ils ont créés ou suivent.',
  boundary:
    'Notes opérationnelles uniquement (500 caractères max). Aucune information clinique.',
  searchLabel: 'Rechercher par nom ou téléphone',
  search: 'Rechercher',
  createTitle: 'Nouveau client',
  createIntro:
    'N’indiquez le consentement que si la personne accepte d’être contactée par Luminol.',
  nameLabel: 'Nom complet',
  phoneLabel: 'Téléphone',
  emailLabel: 'E-mail',
  localeLabel: 'Langue préférée',
  localeName: { ar: 'العربية', fr: 'Français', en: 'English' },
  consentLabel: 'Accepte d’être contacté(e)',
  consentHelp:
    'Depuis une demande, le consentement ne dépasse jamais celui donné par la personne.',
  noteLabel: 'Note opérationnelle',
  create: 'Créer le client',
  fromEnquiryTitle: 'Depuis les demandes récentes',
  fromEnquiryIntro: 'Créez une fiche à partir d’une demande sans client.',
  useEnquiry: 'Utiliser',
  noEnquiries: 'Aucune demande à convertir.',
  prefilledFrom: (name) => `Prérempli depuis la demande de ${name}.`,
  listTitle: 'Fiches clients',
  noClients: 'Aucun client trouvé.',
  consentYes: 'Contact accepté',
  consentNo: 'Pas de consentement',
  fromEnquiry: 'Depuis une demande',
  edit: 'Modifier',
  save: 'Enregistrer',
  archiveLabel: 'Archiver ce client',
  upcoming: (count) => `${count} à venir`,
  book: 'Réserver une consultation',
  saved: 'Enregistré.',
  feedback: frenchFeedback,
};

const arabicClients: ClientsCopy = {
  eyebrow: 'عمليات Luminol',
  title: 'العملاء',
  intro:
    'بطاقات الاتصال لعملاء الاستشارات. يرى الأخصائيون فقط العملاء الذين أنشؤوهم أو يتابعونهم.',
  boundary: 'ملاحظات تنظيمية فقط (500 حرف كحد أقصى). بدون أي معلومات سريرية.',
  searchLabel: 'بحث بالاسم أو الهاتف',
  search: 'بحث',
  createTitle: 'عميل جديد',
  createIntro:
    'سجّل الموافقة على الاتصال فقط إذا وافق الشخص على أن تتصل به Luminol.',
  nameLabel: 'الاسم الكامل',
  phoneLabel: 'الهاتف',
  emailLabel: 'البريد الإلكتروني',
  localeLabel: 'اللغة المفضلة',
  localeName: { ar: 'العربية', fr: 'Français', en: 'English' },
  consentLabel: 'وافق على الاتصال به',
  consentHelp: 'عند الإنشاء من طلب، لا تتجاوز الموافقة ما منحه صاحب الطلب.',
  noteLabel: 'ملاحظة تنظيمية',
  create: 'إنشاء العميل',
  fromEnquiryTitle: 'من الطلبات الأخيرة',
  fromEnquiryIntro: 'ابدأ بطاقة عميل من طلب ليس له عميل بعد.',
  useEnquiry: 'استخدام',
  noEnquiries: 'لا توجد طلبات للتحويل.',
  prefilledFrom: (name) => `مُعبّأ مسبقًا من طلب ${name}.`,
  listTitle: 'بطاقات العملاء',
  noClients: 'لم يُعثر على عملاء.',
  consentYes: 'موافق على الاتصال',
  consentNo: 'بدون موافقة على الاتصال',
  fromEnquiry: 'من طلب',
  edit: 'تعديل',
  save: 'حفظ',
  archiveLabel: 'أرشفة هذا العميل',
  upcoming: (count) => `${count} قادمة`,
  book: 'حجز استشارة',
  saved: 'تم الحفظ.',
  feedback: arabicFeedback,
};

const consultations: Record<Locale, ConsultationsCopy> = {
  en: englishConsultations,
  fr: frenchConsultations,
  ar: arabicConsultations,
};

const clients: Record<Locale, ClientsCopy> = {
  en: englishClients,
  fr: frenchClients,
  ar: arabicClients,
};

export function getConsultationsCopy(locale: Locale): ConsultationsCopy {
  return consultations[locale];
}

export function getClientsCopy(locale: Locale): ClientsCopy {
  return clients[locale];
}
