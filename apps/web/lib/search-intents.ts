/**
 * Smart search: everyday words (EN/FR/AR/Darja) mapped to the topics and
 * school they usually mean. A visitor typing "my child does not listen" or
 * "قلق" still finds relevant programmes even when those exact words do not
 * appear in a title. Matching runs on folded (lower-case, accent-free) text.
 */
export type SearchIntent = {
  school: 'psychology' | 'languages' | 'training';
  /** Everyday words that signal the intent. */
  triggers: readonly string[];
  /** Words that relevant programme texts tend to contain. */
  topics: readonly string[];
};

export const searchIntents: readonly SearchIntent[] = [
  {
    school: 'psychology',
    triggers: [
      'anxiety', 'anxious', 'stress', 'stressed', 'panic', 'worry', 'sad', 'depress', 'sleep', 'trauma', 'grief',
      'anxiete', 'angoisse', 'stresse', 'tristesse', 'sommeil', 'deuil',
      'قلق', 'توتر', 'ضغط', 'حزن', 'اكتئاب', 'نوم', 'صدمه', 'خوف', 'نقلق', 'مقلق',
    ],
    topics: ['therapy', 'consultation', 'stress', 'emotional', 'acceptance', 'mindfulness', 'therapie', 'علاج', 'استشاره', 'نفسي'],
  },
  {
    school: 'psychology',
    triggers: [
      'child', 'children', 'kid', 'son', 'daughter', 'teen', 'teenager', 'parent', 'parenting', 'family', 'adhd', 'autism', 'listen',
      'enfant', 'ado', 'adolescent', 'parent', 'famille', 'tdah', 'autisme',
      'طفل', 'اطفال', 'ولد', 'بنت', 'ابني', 'ابنتي', 'مراهق', 'اسره', 'عائله', 'اولياء', 'توحد', 'فرط الحركه',
    ],
    topics: ['family', 'parent', 'child', 'guidance', 'famille', 'enfant', 'اسره', 'طفل', 'اولياء'],
  },
  {
    school: 'psychology',
    triggers: [
      'psychologist', 'psychology student', 'clinical', 'therapist', 'cbt', 'act', 'interview', 'case',
      'psychologue', 'clinique', 'entretien', 'tcc',
      'اخصائي', 'اخصائيه', 'عيادي', 'مقابله', 'طالب علم النفس', 'معالج',
    ],
    topics: ['professional', 'psychology', 'clinical', 'acceptance', 'commitment', 'training', 'therapy', 'تكوين', 'علم النفس'],
  },
  {
    school: 'languages',
    triggers: [
      'english', 'french', 'speak', 'speaking', 'conversation', 'fluent', 'accent', 'language', 'ielts', 'toefl', 'grammar',
      'anglais', 'francais', 'parler', 'langue', 'grammaire', 'oral',
      'انجليزي', 'انجليزيه', 'فرنسي', 'فرنسيه', 'لغه', 'محادثه', 'نتكلم', 'نهدر',
    ],
    topics: ['english', 'french', 'language', 'fluency', 'communication', 'anglais', 'francais', 'لغه'],
  },
  {
    school: 'training',
    triggers: [
      'leader', 'leadership', 'manager', 'team', 'career', 'job', 'work', 'presentation', 'public speaking', 'productivity', 'excel', 'digital', 'interview job',
      'equipe', 'carriere', 'emploi', 'travail', 'presentation', 'productivite', 'numerique',
      'قياده', 'مدير', 'فريق', 'عمل', 'وظيفه', 'مسار مهني', 'عرض', 'انتاجيه', 'رقمي', 'خدمه',
    ],
    topics: ['leadership', 'professional', 'communication', 'productivity', 'digital', 'workplace', 'قياده', 'مهني'],
  },
];

/** Intents whose triggers appear in an already folded query. */
export function matchSearchIntents(foldedQuery: string): SearchIntent[] {
  if (!foldedQuery) return [];
  const padded = ` ${foldedQuery} `;
  return searchIntents.filter((intent) =>
    intent.triggers.some((trigger) =>
      // Short Latin words (act, son, ado) must be whole words; Arabic roots
      // may carry prefixes such as بال or ال.
      trigger.length <= 3 && /^[a-z+]+$/.test(trigger)
        ? padded.includes(` ${trigger} `)
        : foldedQuery.includes(trigger),
    ),
  );
}
