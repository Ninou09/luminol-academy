import type { Locale } from '@luminol/localization';

import {
  officialAddress,
  officialContacts,
  openingHours,
} from './contact-channels';
import { hasEventEnded, luminolEvents } from './events';

/**
 * Built-in answers for the public assistant, drawn only from facts published
 * on the website. Used when no AI provider is configured, or when it fails,
 * so the assistant still helps instead of repeating an error message.
 */

type Intent =
  | 'greeting'
  | 'hours'
  | 'address'
  | 'contact'
  | 'fees'
  | 'courses'
  | 'consultations'
  | 'languages'
  | 'training'
  | 'register'
  | 'online'
  | 'certificate'
  | 'events'
  | 'founder'
  | 'thanks';

/** Lower-case, strip Latin accents and Arabic diacritics, unify alef forms. */
export function normaliseQuestion(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Keywords per intent in English, French, Arabic and Algerian Darja. */
const keywords: Record<Intent, readonly string[]> = {
  greeting: [
    'hello',
    'hi',
    'bonjour',
    'salut',
    'salam',
    'السلام',
    'سلام',
    'مرحبا',
    'اهلا',
    'saha',
    'صباح',
  ],
  hours: [
    'hour',
    'open',
    'opening',
    'time',
    'when',
    'heure',
    'horaire',
    'ouvert',
    'ferme',
    'quand',
    'ساعات',
    'اوقات',
    'الدوام',
    'دوام',
    'تفتحون',
    'تفتحو',
    'مفتوحين',
    'ساعه',
    'وقت',
    'مفتوح',
    'متي',
    'وقتاش',
    'waqtach',
    'wa9tach',
    'تفتحو',
    'تغلقو',
    'الجمعه',
    'friday',
    'vendredi',
  ],
  address: [
    'address',
    'where',
    'location',
    'map',
    'directions',
    'blida',
    'adresse',
    'ou se',
    'situe',
    'itineraire',
    'trouver',
    'عنوان',
    'العنوان',
    '=اين',
    'وين',
    'فين',
    'خريطه',
    'موقع',
    'البليده',
    'win',
    'fin rakom',
  ],
  contact: [
    'contact',
    'phone',
    'call',
    'whatsapp',
    'email',
    'number',
    'telephone',
    'appeler',
    'numero',
    'joindre',
    'mail',
    'تواصل',
    'هاتف',
    'رقم',
    'واتساب',
    'اتصل',
    'نعيط',
    'بريد',
    'ايميل',
  ],
  fees: [
    'price',
    'cost',
    'fee',
    'how much',
    'pay',
    'prix',
    'tarif',
    'cout',
    'combien',
    'payer',
    'سعر',
    'اسعار',
    'ثمن',
    'تكلفه',
    'كم',
    'شحال',
    'chhal',
    'ch7al',
    'سومه',
    'الدفع',
    'mjani',
    'gratuit',
    'free',
    'مجاني',
  ],
  courses: [
    'course',
    'program',
    'programme',
    'training course',
    'formation',
    'cours',
    'dawra',
    'دوره',
    'دورات',
    'برنامج',
    'برامج',
    'تكوين',
    'cbt',
    'eft',
    'act',
    'schema',
    'تعلم',
    'ساعه تكوين',
    'hours long',
    'duree',
    'combien d heures',
    'مده',
    'تدوم',
    'يدوم',
    'how long',
    'duration',
    'combien de temps',
  ],
  consultations: [
    'consult',
    'therapy',
    'therapist',
    'psycholog',
    'session',
    'appointment',
    'rendez',
    'seance',
    'استشاره',
    'استشارات',
    'جلسه',
    'موعد',
    'نفساني',
    'نفسي',
    'اخصائي',
    'علاج',
    'couple',
    'زوجي',
    'famille',
    'family',
    'اسري',
    'فردي',
    'individ',
  ],
  languages: [
    'language',
    'english',
    'french',
    'langue',
    'anglais',
    'francais',
    'لغات',
    'لغه',
    'انجليزي',
    'انجليزيه',
    'فرنسي',
    'فرنسيه',
    'speaking',
    'conversation',
    'محادثه',
    'niveau',
    'level',
    'مستوي',
  ],
  training: [
    'professional',
    'leadership',
    'career',
    'manager',
    'team',
    'entreprise',
    'professionnel',
    'carriere',
    'مهني',
    'التطوير المهني',
    'قياده',
    'مؤسسات',
    'شركات',
  ],
  register: [
    'register',
    'enrol',
    'enroll',
    'sign up',
    'join',
    'book',
    'reserve',
    'inscri',
    'reserver',
    'sinscrire',
    'تسجيل',
    'سجل',
    'التسجيل',
    'نسجل',
    'حجز',
    'احجز',
    'نحجز',
    'ندخل',
  ],
  online: [
    'online',
    'zoom',
    'remote',
    'distance',
    'en ligne',
    'a distance',
    'presentiel',
    'in person',
    'عن بعد',
    'اونلاين',
    'اون لاين',
    'حضوري',
    'زوم',
  ],
  certificate: [
    'certificate',
    'certif',
    'diploma',
    'diplome',
    'attestation',
    'شهاده',
    'شهادات',
    'ديبلوم',
    'دبلوم',
  ],
  events: [
    'event',
    'workshop',
    'webinar',
    'evenement',
    'atelier',
    'rencontre',
    'فعاليه',
    'فعاليات',
    'ورشه',
    'ورشات',
    'لقاء',
    'لقاءات',
    'محاضره',
    'ندوه',
  ],
  founder: [
    'founder',
    'who is',
    'kheddaoui',
    'fettouma',
    'fondatrice',
    'qui est',
    'experience',
    'المؤسسه',
    'خداوي',
    'فطومه',
    'خبره',
    'من هي',
  ],
  thanks: ['thank', 'merci', 'شكرا', 'يعطيك', 'saha', 'بارك'],
};

/**
 * Latin keywords match at the start of a word ("consult" finds
 * "consultation" but "act" does not match inside "contact"). Short Arabic
 * keywords must be whole words; longer ones may carry prefixes such as "ال".
 */
function matches(text: string, keyword: string): boolean {
  // A leading "=" marks a keyword that must be a whole word.
  if (keyword.startsWith('=')) {
    return text.includes(` ${normaliseQuestion(keyword.slice(1))} `);
  }
  const word = normaliseQuestion(keyword);
  if (!word) return false;
  if (/[a-z0-9]/.test(word)) return text.includes(` ${word}`);
  if (word.length <= 2) return text.includes(` ${word} `);
  return text.includes(word);
}

function detectIntents(question: string): Intent[] {
  const text = ` ${normaliseQuestion(question)} `;
  const scores = (Object.keys(keywords) as Intent[])
    .map((intent) => ({
      intent,
      score: keywords[intent].filter((word) => matches(text, word)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return scores.map((entry) => entry.intent);
}

const whatsapp = officialContacts.whatsappDisplay;
const reception = officialContacts.phoneDisplay;

const psychologyCourses: Record<Locale, readonly string[]> = {
  en: [
    'CBT techniques',
    'Emotional Freedom Technique (EFT)',
    'Acceptance and Commitment Therapy (ACT)',
    'Schema therapy',
    'Marital counselling: assessment and care',
    'Family counsellor',
    'Child psychology: assessment and care programmes',
    'Learning difficulties: assessment and care',
    'Effective parenting, step by step',
    'Learning difficulties for parents and teachers',
  ],
  fr: [
    'Techniques de TCC',
    'Technique de libération émotionnelle (EFT)',
    'Thérapie d’acceptation et d’engagement (ACT)',
    'Thérapie des schémas',
    'Conseil conjugal : évaluation et prise en charge',
    'Conseiller familial',
    'Psychologie de l’enfant : évaluation et prise en charge',
    'Troubles des apprentissages : évaluation et prise en charge',
    'Parentalité efficace, pas à pas',
    'Troubles des apprentissages pour parents et enseignants',
  ],
  ar: [
    'فنيات العلاج المعرفي السلوكي',
    'تقنية تحرير المشاعر السلبية (EFT)',
    'العلاج بالتقبل والالتزام (ACT)',
    'العلاج بالمخططات المعرفية',
    'الإرشاد الزواجي (تشخيص وتكفل)',
    'مستشار أسري',
    'علم نفس الطفل: تقنيات التشخيص وبرامج التكفل',
    'صعوبات التعلم (تشخيص وتكفل)',
    'برنامج التنشئة الفعالة خطوة بخطوة',
    'صعوبات التعلم للأولياء والمعلمين',
  ],
};

function upcomingEvents(locale: Locale): string[] {
  return luminolEvents
    .filter((event) => !hasEventEnded(event))
    .slice(0, 3)
    .map((event) => {
      const when =
        event.date ??
        {
          en: 'date to be announced',
          fr: 'date à venir',
          ar: 'التاريخ سيُعلن',
        }[locale];
      return `${event.title[locale]} (${when})`;
    });
}

const answers: Record<Intent, Record<Locale, () => string>> = {
  greeting: {
    en: () =>
      'Hello and welcome to Luminol Academy. I can help with our schools, courses, consultations, opening hours, address and how to register. What would you like to know?',
    fr: () =>
      'Bonjour et bienvenue à Luminol Academy. Je peux vous renseigner sur nos écoles, formations, consultations, horaires, adresse et inscriptions. Que souhaitez-vous savoir ?',
    ar: () =>
      'أهلًا بك في أكاديمية لومينول. يمكنني مساعدتك في المدارس والدورات والاستشارات وأوقات العمل والعنوان وطريقة التسجيل. ماذا تودّ أن تعرف؟',
  },
  hours: {
    en: () =>
      `The academy is open ${openingHours.label.en}. We are closed on Friday. You can send a request through the website at any time.`,
    fr: () =>
      `L’académie est ouverte ${openingHours.label.fr}. Nous sommes fermés le vendredi. Vous pouvez envoyer une demande sur le site à tout moment.`,
    ar: () =>
      `الأكاديمية مفتوحة ${openingHours.label.ar}، والجمعة يوم عطلة. يمكنك إرسال طلبك عبر الموقع في أي وقت.`,
  },
  address: {
    en: () =>
      `Luminol Academy is at ${officialAddress.street.en}, ${officialAddress.city.en}, ${officialAddress.country.en}. The Contact page has a live map where you can plan your route.`,
    fr: () =>
      `Luminol Academy se trouve ${officialAddress.street.fr}, ${officialAddress.city.fr}, ${officialAddress.country.fr}. La page Contact propose une carte interactive pour préparer votre trajet.`,
    ar: () =>
      `تقع أكاديمية لومينول في ${officialAddress.street.ar}، ${officialAddress.city.ar}، ${officialAddress.country.ar}. في صفحة التواصل خريطة تفاعلية تساعدك على تخطيط طريقك.`,
  },
  contact: {
    en: () =>
      `You can reach us on WhatsApp ${whatsapp}, by phone at reception ${reception}, or by email at ${officialContacts.email}.`,
    fr: () =>
      `Vous pouvez nous joindre sur WhatsApp ${whatsapp}, à l’accueil au ${reception}, ou par e-mail à ${officialContacts.email}.`,
    ar: () =>
      `يمكنك التواصل معنا عبر واتساب ${whatsapp}، أو الاتصال بالاستقبال على ${reception}، أو مراسلتنا على ${officialContacts.email}.`,
  },
  fees: {
    en: () =>
      `Our fees are accessible, and the team explains them personally so you get the right option for your situation. Message us on WhatsApp ${whatsapp} or call ${reception} for every detail, with no commitment.`,
    fr: () =>
      `Nos tarifs sont accessibles, et l’équipe les présente de vive voix pour vous proposer la formule adaptée. Écrivez-nous sur WhatsApp ${whatsapp} ou appelez le ${reception} pour tous les détails, sans engagement.`,
    ar: () =>
      `أسعارنا في متناول الجميع، ويشرحها لك الفريق شخصيًا لاقتراح الصيغة الأنسب لوضعك. راسلنا عبر واتساب ${whatsapp} أو اتصل على ${reception} لمعرفة كل التفاصيل دون أي التزام.`,
  },
  courses: {
    en: () =>
      `Our psychology courses include: ${psychologyCourses.en.join('; ')}. Each course runs for 18 hours, in Arabic with some Darija and French, in person in Blida or online, and ends with a certificate of attendance. A group starts once it is full.`,
    fr: () =>
      `Nos formations en psychologie : ${psychologyCourses.fr.join(' ; ')}. Chaque formation dure 18 heures, en arabe avec un peu de darija et de français, en présentiel à Blida ou en ligne, avec une attestation de participation. Un groupe démarre dès qu’il est complet.`,
    ar: () =>
      `من دوراتنا في علم النفس: ${psychologyCourses.ar.join('، ')}. تمتد كل دورة 18 ساعة، بالعربية مع شيء من الدارجة والفرنسية، حضوريًا في البليدة أو عن بُعد، وتنتهي بشهادة حضور. تبدأ المجموعة بمجرد اكتمالها.`,
  },
  consultations: {
    en: () =>
      `We offer individual, couples and family consultations, mostly with our founder Kheddaoui Fettouma (31+ years of experience), in Blida or online. Send a request on the Consultations page, on WhatsApp ${whatsapp} or by phone: the team confirms the time with you.`,
    fr: () =>
      `Nous proposons des consultations individuelles, de couple et familiales, principalement avec notre fondatrice Kheddaoui Fettouma (plus de 31 ans d’expérience), à Blida ou en ligne. Faites une demande sur la page Consultations, sur WhatsApp ${whatsapp} ou par téléphone : l’équipe confirme l’horaire avec vous.`,
    ar: () =>
      `نقدّم استشارات فردية وزوجية وأسرية، غالبًا مع مؤسستنا خداوي فطومة (أكثر من 31 سنة من الخبرة)، في البليدة أو عن بُعد. أرسل طلبك من صفحة الاستشارات أو عبر واتساب ${whatsapp} أو بالهاتف، ويؤكد معك الفريق الموعد.`,
  },
  languages: {
    en: () =>
      'Our School of Languages offers English and French, with level programmes from beginner to advanced and a speaking programme. Classes are in person in Blida or online, and registration is open.',
    fr: () =>
      'Notre École des langues propose l’anglais et le français, avec des programmes par niveaux du débutant à l’avancé et un programme d’expression orale. En présentiel à Blida ou en ligne ; les inscriptions sont ouvertes.',
    ar: () =>
      'تقدّم مدرسة اللغات الإنجليزية والفرنسية، ببرامج مستويات من المبتدئ إلى المتقدّم وبرنامج للمحادثة، حضوريًا في البليدة أو عن بُعد، والتسجيل مفتوح.',
  },
  training: {
    en: () =>
      'Our School of Professional Development covers leadership, professional communication and productivity and digital skills, for individuals, teams and organisations. Ask us on WhatsApp for current groups.',
    fr: () =>
      'Notre École du développement professionnel couvre le leadership, la communication professionnelle, la productivité et les compétences numériques, pour les personnes, les équipes et les organisations. Demandez-nous les groupes en cours sur WhatsApp.',
    ar: () =>
      'تغطي مدرسة التطوير المهني القيادة والتواصل المهني والإنتاجية والمهارات الرقمية، للأفراد والفرق والمؤسسات. اسألنا عبر واتساب عن المجموعات الحالية.',
  },
  register: {
    en: () =>
      `To register, send a request from the website (Contact or Consultations page), or message us on WhatsApp ${whatsapp}. The team contacts you to confirm the details and your place.`,
    fr: () =>
      `Pour vous inscrire, envoyez une demande depuis le site (page Contact ou Consultations), ou écrivez-nous sur WhatsApp ${whatsapp}. L’équipe vous recontacte pour confirmer les détails et votre place.`,
    ar: () =>
      `للتسجيل، أرسل طلبًا من الموقع (صفحة التواصل أو الاستشارات) أو راسلنا عبر واتساب ${whatsapp}، ويتواصل معك الفريق لتأكيد التفاصيل ومكانك.`,
  },
  online: {
    en: () =>
      'Yes. Courses and consultations are available in person at the academy in Blida or online, as you prefer. Many awareness sessions take place on Zoom.',
    fr: () =>
      'Oui. Les formations et consultations sont proposées en présentiel à Blida ou en ligne, selon votre choix. Beaucoup de séances de sensibilisation ont lieu sur Zoom.',
    ar: () =>
      'نعم، الدورات والاستشارات متاحة حضوريًا في الأكاديمية بالبليدة أو عن بُعد حسب اختيارك، وكثير من جلسات التوعية تكون عبر زوم.',
  },
  certificate: {
    en: () =>
      'Every course ends with a certificate of attendance issued by Luminol Academy. It does not confer academic accreditation or a licence to practise.',
    fr: () =>
      'Chaque formation se termine par une attestation de participation délivrée par Luminol Academy. Elle ne confère ni accréditation académique ni autorisation d’exercer.',
    ar: () =>
      'تنتهي كل دورة بشهادة حضور تصدرها أكاديمية لومينول، وهي لا تمنح اعتمادًا أكاديميًا ولا ترخيصًا بالممارسة.',
  },
  events: {
    en: () => {
      const list = upcomingEvents('en');
      return list.length
        ? `Coming up: ${list.join('; ')}. See Resources → Events for details and the archive of past sessions.`
        : 'There is no announced event right now. See Resources → Events for past sessions, or follow us on Instagram and Facebook.';
    },
    fr: () => {
      const list = upcomingEvents('fr');
      return list.length
        ? `À venir : ${list.join(' ; ')}. Voir Ressources → Rencontres pour les détails et l’archive.`
        : 'Aucune rencontre annoncée pour le moment. Voir Ressources → Rencontres pour l’archive, ou suivez-nous sur Instagram et Facebook.';
    },
    ar: () => {
      const list = upcomingEvents('ar');
      return list.length
        ? `القادم: ${list.join('، ')}. اطّلع على «موارد ← اللقاءات والفعاليات» للتفاصيل والأرشيف.`
        : 'لا توجد فعالية معلنة حاليًا. اطّلع على أرشيف اللقاءات في «موارد»، أو تابعنا على إنستغرام وفيسبوك.';
    },
  },
  founder: {
    en: () =>
      'Luminol Academy was founded by Kheddaoui Fettouma, a psychologist with more than 31 years of field experience. She leads most consultations and many of the psychology courses.',
    fr: () =>
      'Luminol Academy a été fondée par Kheddaoui Fettouma, psychologue avec plus de 31 ans d’expérience de terrain. Elle assure la plupart des consultations et de nombreuses formations en psychologie.',
    ar: () =>
      'أسّست أكاديمية لومينول خداوي فطومة، أخصائية نفسية تمتلك أكثر من 31 سنة من الخبرة الميدانية، وتقدّم معظم الاستشارات وكثيرًا من دورات علم النفس.',
  },
  thanks: {
    en: () => 'You are welcome. If you need anything else, I am here.',
    fr: () => 'Avec plaisir. Si vous avez une autre question, je suis là.',
    ar: () => 'على الرحب والسعة. إن احتجت أي شيء آخر فأنا هنا.',
  },
};

const fallback: Record<Locale, string> = {
  en: `I can answer questions about our schools, psychology courses, consultations, fees, opening hours, address, events and how to register. For anything else, the team will gladly help on WhatsApp ${whatsapp} or at reception ${reception}.`,
  fr: `Je peux répondre sur nos écoles, formations en psychologie, consultations, tarifs, horaires, adresse, rencontres et inscriptions. Pour toute autre question, l’équipe vous répond sur WhatsApp ${whatsapp} ou à l’accueil au ${reception}.`,
  ar: `يمكنني الإجابة عن المدارس ودورات علم النفس والاستشارات والأسعار وأوقات العمل والعنوان والفعاليات وطريقة التسجيل. ولأي سؤال آخر يسعد الفريق بمساعدتك عبر واتساب ${whatsapp} أو الاستقبال ${reception}.`,
};

/** Answers a visitor question from site facts; combines up to two topics. */
export function answerFromSite(question: string, locale: Locale): string {
  const intents = detectIntents(question).filter(
    (intent, index, all) =>
      // A greeting or thanks only stands alone when nothing else was asked.
      !((intent === 'greeting' || intent === 'thanks') && all.length > 1) &&
      all.indexOf(intent) === index,
  );
  if (intents.length === 0) return fallback[locale];
  return intents
    .slice(0, 2)
    .map((intent) => answers[intent][locale]())
    .join('\n\n');
}
