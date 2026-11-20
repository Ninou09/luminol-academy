import type { Locale } from '@luminol/localization';
import type {
  CrmLeadScoreBand,
  CrmLeadScoreReason,
  CrmOfferKindValue,
  CrmOfferStatusValue,
  CrmQuickLeadSource,
  CrmSectionValue,
} from '@luminol/validation/crm-sections';

import type { DealBoardCopy } from '../app/crm/sections/[section]/deal-board';

export type CrmSectionsCopy = {
  eyebrow: string;
  title: (section: string) => string;
  intro: string;
  sectionsNav: string;
  section: Record<CrmSectionValue, string>;
  stage: Record<string, string>;
  offerKind: Record<CrmOfferKindValue, string>;
  offerStatus: Record<CrmOfferStatusValue, string>;
  kpiOpen: string;
  kpiOpenValue: string;
  kpiWon: string;
  kpiWinRate: string;
  kpiDefinitions: string;
  notSet: string;
  board: DealBoardCopy;
  limited: (count: string) => string;
  offers: string;
  noOffers: string;
  offerTitle: string;
  offerKindLabel: string;
  offerPrice: string;
  offerDates: string;
  offerStartsOn: string;
  offerEndsOn: string;
  offerCapacity: string;
  offerTrainer: string;
  offerFill: string;
  offerStatusLabel: string;
  offerDeals: (taken: string) => string;
  offerSetStatus: (status: string) => string;
  addOffer: string;
  addOfferHint: string;
  noTrainer: string;
  saveOffer: string;
  opportunities: string;
  noOpportunities: string;
  addOpportunity: string;
  opportunitySection: string;
  opportunityOffer: string;
  noOffer: string;
  opportunityValue: string;
  opportunityValueHint: string;
  expectedClose: string;
  saveOpportunity: string;
  openSection: string;
  closeReason: string;
  dealCreated: (section: string, stage: string) => string;
  dealMoved: (section: string, from: string, to: string) => string;
  quickAdd: string;
  quickAddTitle: string;
  quickAddIntro: string;
  quickName: string;
  quickPhone: string;
  quickEmail: string;
  quickSource: string;
  quickSourceLabel: Record<CrmQuickLeadSource, string>;
  quickSchool: string;
  quickTiming: string;
  quickTimingUnknown: string;
  quickNote: string;
  quickNoteHint: string;
  quickConsent: string;
  quickConsentYes: string;
  quickConsentNo: string;
  quickConsentHint: string;
  quickSave: string;
  score: string;
  scoreBand: Record<CrmLeadScoreBand, string>;
  scoreReason: Record<CrmLeadScoreReason, string>;
  openRoster: string;
  rosterIntro: string;
  registerTitle: string;
  rosterRegistered: string;
  rosterFollowUp: string;
  rosterClosed: string;
  rosterEmpty: string;
  markConfirmed: string;
  markAttended: string;
  markNoShow: string;
  markFollowedUp: string;
  convertTo: string;
  convert: string;
  doNotContact: string;
  eventFull: string;
  byOffer: string;
  byOfferIntro: string;
  colOpportunities: string;
  colWon: string;
  colConversion: string;
  colWonValue: string;
};

const english: CrmSectionsCopy = {
  eyebrow: 'Luminol CRM · Sections',
  title: (section) => `${section} workspace`,
  intro:
    'Opportunities for this section by stage, its offers and how they fill. Stages follow the section’s fixed pipeline; won and lost are final and audited.',
  sectionsNav: 'Sections',
  section: {
    PSYCHOLOGY: 'Psychology',
    LANGUAGES: 'Languages',
    PROFESSIONAL: 'Professional development',
    EVENTS: 'Events & free sessions',
  },
  stage: {
    NEW: 'New',
    CONTACTED: 'Contacted',
    QUALIFIED: 'Qualified',
    CONSULTATION_BOOKED: 'Consultation booked',
    CONSULTATION_DONE: 'Consultation done',
    PLACEMENT_TEST: 'Placement test',
    LEVEL_ASSIGNED: 'Level assigned',
    REGISTERED: 'Registered',
    PAYMENT_PENDING: 'Payment pending',
    CONFIRMED: 'Confirmed',
    ATTENDED: 'Attended',
    FOLLOWED_UP: 'Followed up',
    CONVERTED: 'Converted',
    NO_SHOW: 'No-show',
    NOT_INTERESTED: 'Not interested',
    WON: 'Won',
    LOST: 'Lost',
  },
  offerKind: {
    CONSULTATION: 'Consultation',
    LANGUAGE_COURSE: 'Language course',
    PROFESSIONAL_PROGRAMME: 'Professional programme (6 h)',
    FAMILY_WORKSHOP: 'Family workshop (2 h)',
    FREE_SESSION: 'Free session',
    EVENT: 'Event',
  },
  offerStatus: {
    DRAFT: 'Draft',
    OPEN: 'Open',
    FULL: 'Full',
    DONE: 'Done',
    CANCELLED: 'Cancelled',
  },
  kpiOpen: 'Open opportunities',
  kpiOpenValue: 'Open value',
  kpiWon: 'Won (30 days)',
  kpiWinRate: 'Win rate (90 days)',
  kpiDefinitions:
    'Open value adds only values staff entered. Win rate is won ÷ (won + lost) among opportunities closed in the last 90 days.',
  notSet: 'Not set',
  board: {
    moveTo: 'Move to',
    move: 'Move',
    moveFailed: 'The move was refused. Reload the page and try again.',
    moving: 'Saving the move…',
    empty: 'No opportunities',
    dragHint:
      'Drag a card to another stage, or use its move control. Closing as lost asks for a short reason.',
    reasonLabel: 'Reason for closing',
    confirm: 'Confirm',
    cancel: 'Cancel',
    unassigned: 'Unassigned',
    lead: 'Lead',
    contact: 'Contact',
    noConsent: 'No contact consent',
  },
  limited: (count) =>
    `Showing the ${count} most recently updated opportunities.`,
  offers: 'Offers',
  noOffers: 'No offers in this section yet.',
  offerTitle: 'Title',
  offerKindLabel: 'Kind',
  offerPrice: 'Price (DZD)',
  offerDates: 'Dates',
  offerStartsOn: 'Starts on',
  offerEndsOn: 'Ends on',
  offerCapacity: 'Capacity',
  offerTrainer: 'Trainer',
  offerFill: 'Fill',
  offerStatusLabel: 'Status',
  offerDeals: (taken) => `${taken} open or won`,
  offerSetStatus: (status) => `Mark ${status.toLowerCase()}`,
  addOffer: 'Add an offer',
  addOfferHint:
    'Leave the price empty until it is confirmed; it is shown as “not set”, never as free.',
  noTrainer: 'No trainer yet',
  saveOffer: 'Save offer',
  opportunities: 'Opportunities',
  noOpportunities: 'No opportunities yet.',
  addOpportunity: 'Add opportunity',
  opportunitySection: 'Section',
  opportunityOffer: 'Offer',
  noOffer: 'No specific offer',
  opportunityValue: 'Expected value (DZD)',
  opportunityValueHint: 'Optional. Leave empty if the amount is not agreed.',
  expectedClose: 'Expected decision date',
  saveOpportunity: 'Save opportunity',
  openSection: 'Open section',
  closeReason: 'Reason',
  dealCreated: (section, stage) => `Opportunity opened · ${section} · ${stage}`,
  dealMoved: (section, from, to) => `${section}: ${from} → ${to}`,
  quickAdd: 'Quick-add lead',
  quickAddTitle: 'Quick-add a lead',
  quickAddIntro:
    'For walk-ins, phone calls, WhatsApp and Facebook messages. The lead is assigned to you. No confirmation or message is sent.',
  quickName: 'Name',
  quickPhone: 'Phone',
  quickEmail: 'Email (optional)',
  quickSource: 'How did they reach us?',
  quickSourceLabel: {
    'walk-in': 'Walk-in',
    'phone-call': 'Phone call',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
  },
  quickSchool: 'Interest',
  quickTiming: 'When do they want to start?',
  quickTimingUnknown: 'Not asked',
  quickNote: 'Operational note',
  quickNoteHint: 'What they asked for. No health or personal details.',
  quickConsent: 'Did the person agree to be contacted by Luminol?',
  quickConsentYes: 'Yes, they agreed',
  quickConsentNo: 'No, or not asked',
  quickConsentHint:
    'Without consent you can still log their inbound messages, but outbound calls and messages are blocked.',
  quickSave: 'Save lead',
  score: 'Priority',
  scoreBand: { hot: 'Hot', warm: 'Warm', cold: 'Cold' },
  scoreReason: {
    consent: 'agreed to contact',
    'no-consent': 'no contact consent',
    phone: 'phone on file',
    'timing-soon': 'wants to start soon',
    'timing-month': 'starting within a month',
    'timing-later': 'starting later',
    programme: 'chose a programme',
    'recent-activity': 'recent activity',
    'waiting-contact': 'waiting for first contact',
  },
  openRoster: 'Roster',
  rosterIntro:
    'Register people, check them in on the day, then follow up only with those who agreed to be contacted. Nothing is sent automatically.',
  registerTitle: 'Register someone',
  rosterRegistered: 'Registered',
  rosterFollowUp: 'Attended — follow up',
  rosterClosed: 'Closed',
  rosterEmpty: 'Nobody here yet.',
  markConfirmed: 'Confirmed',
  markAttended: 'Attended',
  markNoShow: 'No-show',
  markFollowedUp: 'Followed up',
  convertTo: 'Convert to',
  convert: 'Convert',
  doNotContact: 'No consent — do not contact',
  eventFull: 'This event is full.',
  byOffer: 'By offer · last 90 days',
  byOfferIntro:
    'Opportunities opened in the last 90 days, grouped by offer. Won value adds only amounts staff entered.',
  colOpportunities: 'Opportunities',
  colWon: 'Won',
  colConversion: 'Conversion',
  colWonValue: 'Won value',
};

const french: CrmSectionsCopy = {
  eyebrow: 'CRM Luminol · Sections',
  title: (section) => `Espace ${section}`,
  intro:
    'Les opportunités de la section par étape, ses offres et leur remplissage. Les étapes suivent le pipeline fixe de la section ; gagné et perdu sont définitifs et tracés.',
  sectionsNav: 'Sections',
  section: {
    PSYCHOLOGY: 'Psychologie',
    LANGUAGES: 'Langues',
    PROFESSIONAL: 'Développement professionnel',
    EVENTS: 'Événements et séances gratuites',
  },
  stage: {
    NEW: 'Nouveau',
    CONTACTED: 'Contacté',
    QUALIFIED: 'Qualifié',
    CONSULTATION_BOOKED: 'Consultation réservée',
    CONSULTATION_DONE: 'Consultation faite',
    PLACEMENT_TEST: 'Test de niveau',
    LEVEL_ASSIGNED: 'Niveau attribué',
    REGISTERED: 'Inscrit',
    PAYMENT_PENDING: 'Paiement en attente',
    CONFIRMED: 'Confirmé',
    ATTENDED: 'Présent',
    FOLLOWED_UP: 'Relancé',
    CONVERTED: 'Converti',
    NO_SHOW: 'Absent',
    NOT_INTERESTED: 'Pas intéressé',
    WON: 'Gagné',
    LOST: 'Perdu',
  },
  offerKind: {
    CONSULTATION: 'Consultation',
    LANGUAGE_COURSE: 'Cours de langue',
    PROFESSIONAL_PROGRAMME: 'Programme professionnel (6 h)',
    FAMILY_WORKSHOP: 'Atelier famille (2 h)',
    FREE_SESSION: 'Séance gratuite',
    EVENT: 'Événement',
  },
  offerStatus: {
    DRAFT: 'Brouillon',
    OPEN: 'Ouverte',
    FULL: 'Complète',
    DONE: 'Terminée',
    CANCELLED: 'Annulée',
  },
  kpiOpen: 'Opportunités ouvertes',
  kpiOpenValue: 'Valeur ouverte',
  kpiWon: 'Gagnées (30 jours)',
  kpiWinRate: 'Taux de réussite (90 jours)',
  kpiDefinitions:
    'La valeur ouverte additionne seulement les montants saisis. Le taux de réussite = gagnées ÷ (gagnées + perdues) parmi les opportunités closes depuis 90 jours.',
  notSet: 'Non défini',
  board: {
    moveTo: 'Déplacer vers',
    move: 'Déplacer',
    moveFailed: 'Le déplacement a été refusé. Rechargez la page et réessayez.',
    moving: 'Enregistrement…',
    empty: 'Aucune opportunité',
    dragHint:
      'Glissez une carte vers une autre étape, ou utilisez son contrôle. Clôturer comme perdu demande une courte raison.',
    reasonLabel: 'Raison de la clôture',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    unassigned: 'Non attribuée',
    lead: 'Prospect',
    contact: 'Contact',
    noConsent: 'Sans consentement de contact',
  },
  limited: (count) =>
    `Affichage des ${count} opportunités mises à jour le plus récemment.`,
  offers: 'Offres',
  noOffers: 'Aucune offre dans cette section pour l’instant.',
  offerTitle: 'Titre',
  offerKindLabel: 'Type',
  offerPrice: 'Prix (DZD)',
  offerDates: 'Dates',
  offerStartsOn: 'Début',
  offerEndsOn: 'Fin',
  offerCapacity: 'Capacité',
  offerTrainer: 'Formateur',
  offerFill: 'Remplissage',
  offerStatusLabel: 'Statut',
  offerDeals: (taken) => `${taken} ouvertes ou gagnées`,
  offerSetStatus: (status) => `Passer en « ${status} »`,
  addOffer: 'Ajouter une offre',
  addOfferHint:
    'Laissez le prix vide tant qu’il n’est pas confirmé ; il s’affiche « non défini », jamais gratuit.',
  noTrainer: 'Pas encore de formateur',
  saveOffer: 'Enregistrer l’offre',
  opportunities: 'Opportunités',
  noOpportunities: 'Aucune opportunité pour l’instant.',
  addOpportunity: 'Ajouter une opportunité',
  opportunitySection: 'Section',
  opportunityOffer: 'Offre',
  noOffer: 'Pas d’offre précise',
  opportunityValue: 'Valeur attendue (DZD)',
  opportunityValueHint:
    'Facultatif. Laissez vide si le montant n’est pas convenu.',
  expectedClose: 'Date de décision prévue',
  saveOpportunity: 'Enregistrer l’opportunité',
  openSection: 'Ouvrir la section',
  closeReason: 'Raison',
  dealCreated: (section, stage) =>
    `Opportunité ouverte · ${section} · ${stage}`,
  dealMoved: (section, from, to) => `${section} : ${from} → ${to}`,
  quickAdd: 'Ajout rapide',
  quickAddTitle: 'Ajouter rapidement un prospect',
  quickAddIntro:
    'Pour les visites, appels, messages WhatsApp et Facebook. Le prospect vous est attribué. Aucune confirmation ni message n’est envoyé.',
  quickName: 'Nom',
  quickPhone: 'Téléphone',
  quickEmail: 'E-mail (facultatif)',
  quickSource: 'Comment nous a-t-il contactés ?',
  quickSourceLabel: {
    'walk-in': 'Visite sur place',
    'phone-call': 'Appel',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
  },
  quickSchool: 'Intérêt',
  quickTiming: 'Quand souhaite-t-il commencer ?',
  quickTimingUnknown: 'Non demandé',
  quickNote: 'Note opérationnelle',
  quickNoteHint: 'Ce qu’il a demandé. Aucune donnée de santé ou personnelle.',
  quickConsent: 'La personne accepte-t-elle d’être contactée par Luminol ?',
  quickConsentYes: 'Oui, elle a accepté',
  quickConsentNo: 'Non, ou pas demandé',
  quickConsentHint:
    'Sans consentement, vous pouvez noter ses messages entrants, mais les appels et messages sortants sont bloqués.',
  quickSave: 'Enregistrer le prospect',
  score: 'Priorité',
  scoreBand: { hot: 'Chaud', warm: 'Tiède', cold: 'Froid' },
  scoreReason: {
    consent: 'accepte d’être contacté',
    'no-consent': 'pas de consentement',
    phone: 'téléphone connu',
    'timing-soon': 'veut commencer bientôt',
    'timing-month': 'début dans le mois',
    'timing-later': 'début plus tard',
    programme: 'programme choisi',
    'recent-activity': 'activité récente',
    'waiting-contact': 'attend un premier contact',
  },
  openRoster: 'Liste',
  rosterIntro:
    'Inscrivez les personnes, pointez leur présence le jour J, puis relancez uniquement celles qui ont accepté d’être contactées. Rien n’est envoyé automatiquement.',
  registerTitle: 'Inscrire quelqu’un',
  rosterRegistered: 'Inscrits',
  rosterFollowUp: 'Présents — à relancer',
  rosterClosed: 'Clôturés',
  rosterEmpty: 'Personne pour l’instant.',
  markConfirmed: 'Confirmé',
  markAttended: 'Présent',
  markNoShow: 'Absent',
  markFollowedUp: 'Relancé',
  convertTo: 'Convertir vers',
  convert: 'Convertir',
  doNotContact: 'Sans consentement — ne pas contacter',
  eventFull: 'Cet événement est complet.',
  byOffer: 'Par offre · 90 derniers jours',
  byOfferIntro:
    'Opportunités ouvertes ces 90 derniers jours, par offre. La valeur gagnée additionne seulement les montants saisis.',
  colOpportunities: 'Opportunités',
  colWon: 'Gagnées',
  colConversion: 'Conversion',
  colWonValue: 'Valeur gagnée',
};

const arabic: CrmSectionsCopy = {
  eyebrow: 'CRM لومينول · الأقسام',
  title: (section) => `مساحة ${section}`,
  intro:
    'فرص هذا القسم حسب المرحلة، وعروضه ونسبة امتلائها. تتبع المراحل مسار القسم الثابت؛ والفوز أو الخسارة نهائيان ومسجّلان.',
  sectionsNav: 'الأقسام',
  section: {
    PSYCHOLOGY: 'علم النفس',
    LANGUAGES: 'اللغات',
    PROFESSIONAL: 'التطوير المهني',
    EVENTS: 'الفعاليات والجلسات المجانية',
  },
  stage: {
    NEW: 'جديد',
    CONTACTED: 'تم التواصل',
    QUALIFIED: 'مؤهَّل',
    CONSULTATION_BOOKED: 'استشارة محجوزة',
    CONSULTATION_DONE: 'استشارة منجزة',
    PLACEMENT_TEST: 'اختبار تحديد المستوى',
    LEVEL_ASSIGNED: 'تم تحديد المستوى',
    REGISTERED: 'مسجَّل',
    PAYMENT_PENDING: 'في انتظار الدفع',
    CONFIRMED: 'مؤكَّد',
    ATTENDED: 'حضر',
    FOLLOWED_UP: 'تمت المتابعة',
    CONVERTED: 'تحوّل إلى عرض مدفوع',
    NO_SHOW: 'لم يحضر',
    NOT_INTERESTED: 'غير مهتم',
    WON: 'مكسوبة',
    LOST: 'خاسرة',
  },
  offerKind: {
    CONSULTATION: 'استشارة',
    LANGUAGE_COURSE: 'دورة لغة',
    PROFESSIONAL_PROGRAMME: 'برنامج مهني (6 ساعات)',
    FAMILY_WORKSHOP: 'ورشة عائلية (ساعتان)',
    FREE_SESSION: 'جلسة مجانية',
    EVENT: 'فعالية',
  },
  offerStatus: {
    DRAFT: 'مسودة',
    OPEN: 'مفتوح',
    FULL: 'مكتمل',
    DONE: 'منتهٍ',
    CANCELLED: 'ملغى',
  },
  kpiOpen: 'الفرص المفتوحة',
  kpiOpenValue: 'القيمة المفتوحة',
  kpiWon: 'المكسوبة (30 يومًا)',
  kpiWinRate: 'نسبة الفوز (90 يومًا)',
  kpiDefinitions:
    'القيمة المفتوحة تجمع فقط المبالغ التي أدخلها الفريق. نسبة الفوز = المكسوبة ÷ (المكسوبة + الخاسرة) من الفرص المغلقة خلال 90 يومًا.',
  notSet: 'غير محدد',
  board: {
    moveTo: 'نقل إلى',
    move: 'نقل',
    moveFailed: 'تم رفض النقل. أعد تحميل الصفحة وحاول مجددًا.',
    moving: 'جارٍ حفظ النقل…',
    empty: 'لا توجد فرص',
    dragHint:
      'اسحب البطاقة إلى مرحلة أخرى أو استعمل زر النقل. الإغلاق كخاسرة يتطلب سببًا مختصرًا.',
    reasonLabel: 'سبب الإغلاق',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    unassigned: 'غير مسندة',
    lead: 'عميل محتمل',
    contact: 'جهة اتصال',
    noConsent: 'دون موافقة على التواصل',
  },
  limited: (count) => `عرض آخر ${count} فرصة تم تحديثها.`,
  offers: 'العروض',
  noOffers: 'لا توجد عروض في هذا القسم بعد.',
  offerTitle: 'العنوان',
  offerKindLabel: 'النوع',
  offerPrice: 'السعر (دج)',
  offerDates: 'التواريخ',
  offerStartsOn: 'يبدأ في',
  offerEndsOn: 'ينتهي في',
  offerCapacity: 'السعة',
  offerTrainer: 'المكوّن',
  offerFill: 'الامتلاء',
  offerStatusLabel: 'الحالة',
  offerDeals: (taken) => `${taken} مفتوحة أو مكسوبة`,
  offerSetStatus: (status) => `تحويل إلى «${status}»`,
  addOffer: 'إضافة عرض',
  addOfferHint: 'اترك السعر فارغًا إلى أن يتأكد؛ يظهر «غير محدد» وليس مجانيًا.',
  noTrainer: 'لا يوجد مكوّن بعد',
  saveOffer: 'حفظ العرض',
  opportunities: 'الفرص',
  noOpportunities: 'لا توجد فرص بعد.',
  addOpportunity: 'إضافة فرصة',
  opportunitySection: 'القسم',
  opportunityOffer: 'العرض',
  noOffer: 'دون عرض محدد',
  opportunityValue: 'القيمة المتوقعة (دج)',
  opportunityValueHint: 'اختياري. اتركه فارغًا إذا لم يُتفق على المبلغ.',
  expectedClose: 'تاريخ القرار المتوقع',
  saveOpportunity: 'حفظ الفرصة',
  openSection: 'فتح القسم',
  closeReason: 'السبب',
  dealCreated: (section, stage) => `فُتحت فرصة · ${section} · ${stage}`,
  dealMoved: (section, from, to) => `${section}: ${from} ← ${to}`,
  quickAdd: 'إضافة سريعة',
  quickAddTitle: 'إضافة عميل محتمل بسرعة',
  quickAddIntro:
    'للزيارات والمكالمات ورسائل واتساب وفيسبوك. يُسند العميل إليك. لا يتم إرسال أي تأكيد أو رسالة.',
  quickName: 'الاسم',
  quickPhone: 'الهاتف',
  quickEmail: 'البريد الإلكتروني (اختياري)',
  quickSource: 'كيف تواصل معنا؟',
  quickSourceLabel: {
    'walk-in': 'زيارة مباشرة',
    'phone-call': 'مكالمة هاتفية',
    whatsapp: 'واتساب',
    facebook: 'فيسبوك',
  },
  quickSchool: 'الاهتمام',
  quickTiming: 'متى يرغب في البدء؟',
  quickTimingUnknown: 'لم يُسأل',
  quickNote: 'ملاحظة تشغيلية',
  quickNoteHint: 'ما طلبه. دون معلومات صحية أو شخصية.',
  quickConsent: 'هل وافق الشخص على أن تتواصل معه لومينول؟',
  quickConsentYes: 'نعم، وافق',
  quickConsentNo: 'لا، أو لم يُسأل',
  quickConsentHint:
    'دون موافقة يمكنك تسجيل رسائله الواردة، لكن المكالمات والرسائل الصادرة ممنوعة.',
  quickSave: 'حفظ العميل',
  score: 'الأولوية',
  scoreBand: { hot: 'ساخن', warm: 'دافئ', cold: 'بارد' },
  scoreReason: {
    consent: 'وافق على التواصل',
    'no-consent': 'دون موافقة على التواصل',
    phone: 'رقم الهاتف متوفر',
    'timing-soon': 'يريد البدء قريبًا',
    'timing-month': 'يبدأ خلال شهر',
    'timing-later': 'يبدأ لاحقًا',
    programme: 'اختار برنامجًا',
    'recent-activity': 'نشاط حديث',
    'waiting-contact': 'ينتظر أول تواصل',
  },
  openRoster: 'القائمة',
  rosterIntro:
    'سجّل المشاركين، وأكّد حضورهم يوم الفعالية، ثم تابع فقط من وافق على التواصل. لا يُرسل أي شيء تلقائيًا.',
  registerTitle: 'تسجيل مشارك',
  rosterRegistered: 'المسجّلون',
  rosterFollowUp: 'الحاضرون — للمتابعة',
  rosterClosed: 'المغلقة',
  rosterEmpty: 'لا أحد بعد.',
  markConfirmed: 'مؤكَّد',
  markAttended: 'حضر',
  markNoShow: 'لم يحضر',
  markFollowedUp: 'تمت المتابعة',
  convertTo: 'تحويل إلى',
  convert: 'تحويل',
  doNotContact: 'دون موافقة — لا تتواصل',
  eventFull: 'هذه الفعالية مكتملة.',
  byOffer: 'حسب العرض · آخر 90 يومًا',
  byOfferIntro:
    'الفرص المفتوحة خلال 90 يومًا الأخيرة مجمّعة حسب العرض. القيمة المكسوبة تجمع فقط المبالغ التي أدخلها الفريق.',
  colOpportunities: 'الفرص',
  colWon: 'المكسوبة',
  colConversion: 'نسبة التحويل',
  colWonValue: 'القيمة المكسوبة',
};

const copies: Record<Locale, CrmSectionsCopy> = {
  en: english,
  fr: french,
  ar: arabic,
};

export function getCrmSectionsCopy(locale: Locale): CrmSectionsCopy {
  return copies[locale];
}
