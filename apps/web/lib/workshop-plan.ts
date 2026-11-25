import type { Locale } from '@luminol/localization';

export type PlannedWorkshop = {
  date: string;
  venue: 'blida' | 'zoom';
  title: Record<Locale, string>;
  audience: Record<Locale, string>;
  hours?: string;
};

function workshop(
  date: string,
  venue: PlannedWorkshop['venue'],
  title: readonly [string, string, string],
  audience: readonly [string, string, string],
  hours?: string,
): PlannedWorkshop {
  return {
    date,
    venue,
    title: { en: title[0], fr: title[1], ar: title[2] },
    audience: { en: audience[0], fr: audience[1], ar: audience[2] },
    ...(hours ? { hours } : {}),
  };
}

const parentsTeachers = [
  'Parents and teachers',
  'Parents et enseignants',
  'الأولياء والمعلمون',
] as const;
const observers = [
  'Practitioners and master’s students observing',
  'Praticiens et étudiants de master en observation',
  'مختصون وطلبة ماستر للملاحظة',
] as const;
const adultsParents = [
  'Adults and parents',
  'Adultes et parents',
  'البالغون والأولياء',
] as const;

// Proposed weekly workshops from Luminol’s November 2026 course plan.
export const workshopPlan = [
  workshop(
    '2026-12-05',
    'blida',
    [
      'Learning difficulties at homework time',
      'Les difficultés d’apprentissage au moment des devoirs',
      'صعوبات التعلم وقت الواجب',
    ],
    parentsTeachers,
    '14:00–17:00',
  ),
  workshop(
    '2026-12-12',
    'blida',
    [
      'Tantrums in children aged 3–6',
      'Les colères chez les enfants de 3 à 6 ans',
      'نوبات الغضب عند الأطفال من 3 إلى 6 سنوات',
    ],
    [
      'Parents and early childhood educators',
      'Parents et éducateurs de la petite enfance',
      'الأولياء ومربّو الروضة',
    ],
  ),
  workshop(
    '2026-12-19',
    'zoom',
    [
      'Teenagers and phone boundaries at home',
      'Adolescents et règles d’usage du téléphone à la maison',
      'المراهقون وحدود الهاتف في البيت',
    ],
    [
      'Parents and youth educators',
      'Parents et éducateurs d’adolescents',
      'الأولياء ومربّو اليافعين',
    ],
  ),
  workshop(
    '2026-12-26',
    'blida',
    [
      'The first interview with a child and family',
      'Le premier entretien avec l’enfant et sa famille',
      'المقابلة الأولى مع الطفل والأسرة',
    ],
    observers,
  ),
  workshop(
    '2027-01-02',
    'zoom',
    [
      'Managing stress and rebuilding routines after the holidays',
      'Gérer le stress et retrouver ses repères après les vacances',
      'تنظيم الضغط واستعادة الروتين بعد العطلة',
    ],
    [
      'Adults and professionals',
      'Adultes et professionnels',
      'البالغون والمهنيون',
    ],
  ),
  workshop(
    '2027-01-09',
    'blida',
    [
      'Couples communication during disagreements',
      'La communication dans le couple en cas de désaccord',
      'التواصل الزوجي وقت الخلاف',
    ],
    [
      'Adults interested in family communication',
      'Adultes souhaitant améliorer la communication familiale',
      'البالغون ومن يرغب في تحسين التواصل الأسري',
    ],
  ),
  workshop(
    '2027-01-16',
    'blida',
    [
      'Understanding children’s drawings in context',
      'Comprendre les dessins d’enfants dans leur contexte',
      'قراءة رسومات الأطفال ضمن السياق',
    ],
    observers,
  ),
  workshop(
    '2027-01-23',
    'blida',
    [
      'Working together at home and school to support learning',
      'Coopérer entre la maison et l’école pour soutenir les apprentissages',
      'التنسيق بين البيت والمدرسة لدعم التعلم',
    ],
    [
      'Teachers, parents and school leaders',
      'Enseignants, parents et directions d’établissement',
      'المعلمون والأولياء ومديرو المدارس',
    ],
  ),
  workshop(
    '2027-01-30',
    'zoom',
    [
      'Listening to teenagers and setting boundaries',
      'Écouter les adolescents et poser des limites',
      'الإصغاء والحدود مع المراهق',
    ],
    ['Parents and counsellors', 'Parents et conseillers', 'الأولياء والمرشدون'],
  ),
  workshop(
    '2027-02-06',
    'blida',
    [
      'Introduction to psychological flexibility at work',
      'Introduction à la flexibilité psychologique au travail',
      'مدخل إلى المرونة النفسية في العمل',
    ],
    [
      'Teams, professionals and adult students',
      'Équipes, professionnels et étudiants adultes',
      'فرق العمل والمهنيون والطلبة البالغون',
    ],
  ),
  workshop(
    '2027-02-13',
    'zoom',
    [
      'Home routines and communication during Ramadan',
      'Rythmes familiaux et communication pendant le Ramadan',
      'روتين البيت والتواصل في رمضان',
    ],
    ['Parents and caregivers', 'Parents et aidants', 'الأولياء ومقدمو الرعاية'],
  ),
  workshop(
    '2027-02-20',
    'zoom',
    [
      'Listening skills and clarifying the request in an interview',
      'Écouter et clarifier la demande lors d’un entretien',
      'مهارات الإصغاء وتحديد الطلب في المقابلة',
    ],
    observers,
  ),
  workshop(
    '2027-02-27',
    'zoom',
    [
      'Studying without daily conflict',
      'Étudier sans conflit au quotidien',
      'المذاكرة من دون صراع يومي',
    ],
    parentsTeachers,
  ),
  workshop(
    '2027-03-06',
    'zoom',
    [
      'Healthy boundaries and sharing responsibilities in the family',
      'Poser des limites saines et partager les responsabilités en famille',
      'حدود صحية وتوزيع المسؤوليات داخل الأسرة',
    ],
    adultsParents,
  ),
  workshop(
    '2027-03-13',
    'zoom',
    [
      'Rebuilding routines after Eid',
      'Retrouver son rythme après l’Aïd',
      'استعادة الروتين بعد العيد',
    ],
    adultsParents,
  ),
  workshop(
    '2027-03-20',
    'blida',
    [
      'Case formulation and planning brief sessions',
      'Formulation de cas et planification de séances brèves',
      'صياغة الحالة وخطة الجلسات القصيرة',
    ],
    [
      'Psychologists and qualified counsellors',
      'Psychologues et conseillers qualifiés',
      'أخصائيون نفسيون ومرشدون مؤهلون',
    ],
  ),
  workshop(
    '2027-03-27',
    'blida',
    [
      'Practical observation and educational intervention',
      'Observation et intervention éducative en pratique',
      'تطبيقات في الملاحظة والتدخل التربوي',
    ],
    [
      'Teachers, specialists and educators',
      'Enseignants, spécialistes et éducateurs',
      'معلمون ومختصون ومربون',
    ],
  ),
] as const;

const algeriaDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Algiers',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getUpcomingWorkshops(now = new Date()) {
  const today = algeriaDay.format(now);
  return workshopPlan.filter((entry) => entry.date >= today);
}
