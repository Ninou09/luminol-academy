import type { PublicLocale } from './i18n';
import type { SchoolSlug } from './schools';

type LocalizedSchool = {
  name: string;
  eyebrow: string;
  headline: string;
  introduction: string;
  promise: string;
  visualWords: readonly string[];
  programs: readonly { title: string; description: string }[];
  approach: readonly { title: string; description: string }[];
  audiences: readonly string[];
  note: string;
};

type TranslatedLocale = Exclude<PublicLocale, 'ar'>;

export const localizedSchools: Record<TranslatedLocale, Record<SchoolSlug, LocalizedSchool>> = {
  fr: {
    psychology: {
      name: 'Psychologie',
      eyebrow: 'Bien-être · conscience · développement personnel',
      headline: 'Mieux comprendre ce que vous ressentez. Construire ce qui vous aide à avancer.',
      introduction: 'Un espace structuré pour mieux comprendre les émotions, les relations et les étapes de développement personnel, avec clarté et responsabilité.',
      promise: 'Une pensée rigoureuse, une écoute humaine et des outils concrets, présentés avec des limites claires.',
      visualWords: ['CONSCIENCE', 'ÉQUILIBRE', 'LIEN'],
      programs: [
        { title: 'Accompagnement individuel', description: 'Des échanges structurés et des outils pratiques autour du stress, du changement, de la confiance et du développement émotionnel.' },
        { title: 'Enfant & famille', description: 'Un accompagnement éducatif pour mieux comprendre le développement, la communication et les défis du quotidien familial.' },
        { title: 'Coaching orienté objectifs', description: 'Des parcours centrés sur les habitudes, la connaissance de soi, les relations et les prochaines étapes.' },
        { title: 'Ateliers collectifs', description: 'Des formats interactifs autour de l’intelligence émotionnelle, du stress, de la parentalité et du développement personnel.' },
      ],
      approach: [
        { title: 'Écouter avec attention', description: 'Nous partons de la personne, de son contexte et de ce que signifie réellement progresser pour elle.' },
        { title: 'Créer de la clarté', description: 'Nous transformons les expériences complexes en repères compréhensibles, en langage clair et en direction pratique.' },
        { title: 'Construire la suite', description: 'Nous traduisons la compréhension en pratiques utiles dans la vie quotidienne.' },
      ],
      audiences: ['Adultes', 'Parents et familles', 'Jeunes', 'Équipes et organisations'],
      note: 'Les programmes de psychologie de Luminol sont éducatifs et de soutien. Ils ne remplacent pas les services d’urgence, la psychothérapie ni les soins médicaux. Une orientation vers des professionnels adaptés est recommandée lorsque nécessaire.',
    },
    languages: {
      name: 'Langues',
      eyebrow: 'Expression · confiance · communication réelle',
      headline: 'Apprendre une langue pour l’utiliser, pas seulement pour la mémoriser.',
      introduction: 'Des parcours qui donnent la priorité à la compréhension, à l’expression orale et à la confiance dans des situations réelles.',
      promise: 'Plus de pratique utile, plus de feedback, et une progression conçue autour de la communication.',
      visualWords: ['PARLER', 'ÉCOUTER', 'CONNECTER'],
      programs: [
        { title: 'Anglais général', description: 'Un parcours progressif pour renforcer compréhension, vocabulaire, grammaire utile et expression orale.' },
        { title: 'Français général', description: 'Une progression structurée vers davantage d’aisance, de précision et de confiance dans la communication.' },
        { title: 'Conversation & aisance', description: 'Des séances centrées sur l’expression, l’écoute active, le vocabulaire en contexte et la fluidité.' },
        { title: 'Langues pour études et travail', description: 'Des compétences linguistiques reliées aux présentations, entretiens, études et situations professionnelles.' },
      ],
      approach: [
        { title: 'Comprendre le niveau', description: 'Nous identifions le point de départ et les situations dans lesquelles la langue doit réellement être utilisée.' },
        { title: 'Pratiquer activement', description: 'Les apprenants parlent, écoutent, reformulent et reçoivent du feedback au lieu de rester passifs.' },
        { title: 'Transférer dans la vraie vie', description: 'Les activités se rapprochent progressivement des conversations, études et situations de travail réelles.' },
      ],
      audiences: ['Débutants', 'Étudiants', 'Professionnels', 'Adultes en reprise'],
      note: 'Les niveaux, horaires et formats dépendent du programme et des groupes disponibles. L’équipe confirme le parcours le plus adapté après la demande.',
    },
    training: {
      name: 'Formation professionnelle',
      eyebrow: 'Compétence · application · progression professionnelle',
      headline: 'Transformer les idées en compétences visibles dans le travail réel.',
      introduction: 'Des formations pratiques pour développer communication, leadership, organisation et compétences utiles aux individus comme aux équipes.',
      promise: 'Des formats orientés action, reliés à des situations professionnelles concrètes et à des objectifs explicites.',
      visualWords: ['AGIR', 'LEADERSHIP', 'PROGRESSER'],
      programs: [
        { title: 'Communication professionnelle', description: 'Renforcer la clarté, l’écoute, les présentations et la collaboration dans les environnements de travail.' },
        { title: 'Leadership & management', description: 'Développer prise de décision, feedback, responsabilisation et coordination d’équipe.' },
        { title: 'Compétences de carrière', description: 'Des outils pour mieux se présenter, organiser son travail et évoluer avec plus de structure.' },
        { title: 'Ateliers pour organisations', description: 'Des formats adaptés aux besoins d’équipes autour de compétences ciblées et applicables.' },
      ],
      approach: [
        { title: 'Partir du contexte', description: 'Nous définissons le résultat attendu et les situations professionnelles concernées.' },
        { title: 'Apprendre en faisant', description: 'Cas, exercices, simulations et feedback rendent le contenu immédiatement exploitable.' },
        { title: 'Consolider l’application', description: 'Les participants repartent avec des repères et des actions qu’ils peuvent réutiliser.' },
      ],
      audiences: ['Professionnels', 'Jeunes diplômés', 'Managers', 'Équipes et entreprises'],
      note: 'Les résultats dépendent du programme, du contexte et de l’implication. Luminol ne promet pas de résultat professionnel ou financier garanti.',
    },
  },
  en: {
    psychology: {
      name: 'Psychology',
      eyebrow: 'Wellbeing · awareness · personal growth',
      headline: 'Understand what you feel. Build what helps you move forward.',
      introduction: 'A structured space for understanding emotions, relationships and personal growth with clarity, care and responsible boundaries.',
      promise: 'Rigorous thinking, human listening and practical tools presented with clear limits and responsible guidance.',
      visualWords: ['AWARENESS', 'BALANCE', 'CONNECTION'],
      programs: [
        { title: 'Individual support', description: 'Structured conversations and practical guidance around stress, change, confidence and emotional development.' },
        { title: 'Child & family guidance', description: 'Educational support for parents and families seeking a clearer understanding of development, communication and everyday challenges.' },
        { title: 'Goal-focused coaching', description: 'Guided paths around habits, self-awareness, relationships and meaningful next steps.' },
        { title: 'Group workshops', description: 'Interactive learning around emotional intelligence, stress, parenting and personal development.' },
      ],
      approach: [
        { title: 'Listen deeply', description: 'We begin with the person, their context and what meaningful progress looks like for them.' },
        { title: 'Create clarity', description: 'We turn complex experiences into understandable patterns, clear language and practical direction.' },
        { title: 'Build the next step', description: 'We translate understanding into supportive practices that can be used in daily life.' },
      ],
      audiences: ['Adults', 'Parents and families', 'Young people', 'Teams and organisations'],
      note: 'Luminol psychology programmes are educational and supportive. They do not replace emergency services, psychotherapy or medical care. Appropriate professional referral is recommended when a different level of care is needed.',
    },
    languages: {
      name: 'Languages',
      eyebrow: 'Expression · confidence · real communication',
      headline: 'Learn a language to use it, not only to memorise it.',
      introduction: 'Language paths that prioritise comprehension, speaking practice and confidence in real situations.',
      promise: 'More useful practice, more feedback and progress designed around genuine communication.',
      visualWords: ['SPEAK', 'LISTEN', 'CONNECT'],
      programs: [
        { title: 'General English', description: 'A progressive path for stronger comprehension, useful vocabulary, practical grammar and speaking confidence.' },
        { title: 'General French', description: 'Structured progress toward greater fluency, accuracy and confidence in everyday communication.' },
        { title: 'Conversation & fluency', description: 'Speaking-led sessions focused on active listening, vocabulary in context and smoother expression.' },
        { title: 'Language for study & work', description: 'Language skills connected to presentations, interviews, study tasks and professional situations.' },
      ],
      approach: [
        { title: 'Understand the starting point', description: 'We identify current ability and the situations where the learner actually needs the language.' },
        { title: 'Practise actively', description: 'Learners speak, listen, reformulate and receive feedback instead of staying passive.' },
        { title: 'Transfer to real life', description: 'Activities increasingly mirror conversations, study and workplace situations.' },
      ],
      audiences: ['Beginners', 'Students', 'Professionals', 'Adult returners'],
      note: 'Levels, schedules and formats depend on the programme and available groups. The team confirms the most suitable route after an enquiry.',
    },
    training: {
      name: 'Professional Training',
      eyebrow: 'Skill · application · career growth',
      headline: 'Turn ideas into skills people can see in real work.',
      introduction: 'Practical training for stronger communication, leadership, organisation and professional capability for individuals and teams.',
      promise: 'Action-oriented learning connected to real workplace situations and explicit development goals.',
      visualWords: ['ACT', 'LEAD', 'GROW'],
      programs: [
        { title: 'Professional communication', description: 'Build clarity, listening, presentation and collaboration skills for modern workplaces.' },
        { title: 'Leadership & management', description: 'Develop decision-making, feedback, accountability and team coordination.' },
        { title: 'Career skills', description: 'Practical tools for presenting yourself, organising your work and progressing with more structure.' },
        { title: 'Organisational workshops', description: 'Focused formats adapted to team needs around specific, applicable capabilities.' },
      ],
      approach: [
        { title: 'Start with context', description: 'We define the intended outcome and the workplace situations that matter.' },
        { title: 'Learn by doing', description: 'Cases, exercises, simulations and feedback make the content usable immediately.' },
        { title: 'Strengthen application', description: 'Participants leave with practical reference points and actions they can reuse.' },
      ],
      audiences: ['Professionals', 'Graduates', 'Managers', 'Teams and companies'],
      note: 'Outcomes depend on the programme, context and participation. Luminol does not promise guaranteed career or financial results.',
    },
  },
};
