import type { SchoolSlug } from './schools';

export type EditorialImage = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=82&w=2200`;

export const editorialImages = {
  hero: {
    src: unsplash('photo-1758270705696-ec9caffc73dd'),
    alt: 'Adult learners taking part in an interactive classroom discussion.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/teacher-interacting-with-students-in-a-classroom-setting-c6QLJhezaYs',
  },
  psychology: {
    src: unsplash('photo-1758273241086-f3585ef8c2f8'),
    alt: 'A psychologist listening attentively during a private support conversation.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/therapist-listens-to-patient-in-a-counseling-session-tw-mAZXr6H4',
  },
  languages: {
    src: unsplash('photo-1758270705482-cee87ea98738'),
    alt: 'A diverse group of adult learners talking together between lessons.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/students-talking-in-a-lecture-hall-classroom-T9yehHSvLL4',
  },
  training: {
    src: unsplash('photo-1758691737124-05c5bffe46f0'),
    alt: 'A diverse professional team collaborating around a laptop.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/diverse-team-collaborating-around-a-laptop-in-office-yd_RKGH_RH4',
  },
  learning: {
    src: unsplash('photo-1758270703813-2ecf235a6462'),
    alt: 'Adult learners listening and writing during a guided session.',
    credit: 'Vitaly Gariev / Unsplash',
    creditUrl:
      'https://unsplash.com/photos/students-listen-to-a-lecture-in-a-classroom-8c0ndhIXDzQ',
  },
} satisfies Record<string, EditorialImage>;

export const branchExperience: Record<
  SchoolSlug,
  {
    themeLabel: string;
    image: EditorialImage;
    positioning: string;
    outcomes: readonly string[];
    expertise: readonly string[];
    faq: readonly { question: string; answer: string }[];
  }
> = {
  psychology: {
    themeLabel: 'Calm intelligence',
    image: editorialImages.psychology,
    positioning:
      'A thoughtful environment for understanding emotions, strengthening relationships and developing practical ways forward.',
    outcomes: [
      'Language for understanding difficult experiences',
      'Practical tools that can be used outside the session',
      'Supportive guidance shaped around the person and context',
      'Clear referral boundaries when another level of care is appropriate',
    ],
    expertise: [
      'Human-centred listening',
      'Developmentally aware guidance',
      'Ethical boundaries and referral',
      'Practical psychoeducation',
    ],
    faq: [
      {
        question: 'Is Luminol Psychology a medical or emergency service?',
        answer:
          'No. Luminol programmes are educational and supportive. They do not replace emergency, psychiatric or medical care, and the team uses appropriate referral when a different level of support is needed.',
      },
      {
        question: 'Can parents ask about support for children or families?',
        answer:
          'Yes. The first conversation helps clarify the family context, the learner’s age and the most suitable educational or supportive pathway.',
      },
      {
        question: 'Are group workshops available?',
        answer:
          'Workshops can be organised around themes such as emotional intelligence, stress, communication, parenting and personal development. Availability is confirmed by the team.',
      },
    ],
  },
  languages: {
    themeLabel: 'Confident connection',
    image: editorialImages.languages,
    positioning:
      'Language learning built around conversation, useful feedback and the confidence to communicate beyond the classroom.',
    outcomes: [
      'A clear starting level and progression path',
      'Stronger listening, speaking and comprehension',
      'Practice connected to real academic, social and professional situations',
      'Feedback that helps learners communicate more naturally',
    ],
    expertise: [
      'Level-aware progression',
      'Conversation-led practice',
      'Pronunciation and comprehension',
      'Academic and workplace communication',
    ],
    faq: [
      {
        question: 'How is the right level selected?',
        answer:
          'The team reviews the learner’s current ability, goals and practical communication needs before confirming the most appropriate group or pathway.',
      },
      {
        question: 'Are programmes only for beginners?',
        answer:
          'No. The pathways cover foundations, continued development, fluency practice and communication for academic or professional contexts.',
      },
      {
        question: 'Are online or flexible formats available?',
        answer:
          'Delivery options depend on the programme and schedule. The contact team confirms the currently available in-person, online or hybrid formats.',
      },
    ],
  },
  training: {
    themeLabel: 'Applied ambition',
    image: editorialImages.training,
    positioning:
      'Focused professional development that connects learning with decisions, communication, leadership and everyday work.',
    outcomes: [
      'A clear capability or workplace outcome',
      'Active practice rather than passive presentation',
      'Tools and frameworks that transfer to real work',
      'A next-step plan for individuals or teams',
    ],
    expertise: [
      'Leadership and decision-making',
      'Professional communication',
      'Productivity and digital capability',
      'Needs-led corporate workshops',
    ],
    faq: [
      {
        question: 'Can training be adapted for an organisation?',
        answer:
          'Yes. Corporate workshops begin with a focused needs conversation so the audience, format and desired workplace outcome are clear.',
      },
      {
        question: 'Who are the individual programmes designed for?',
        answer:
          'They can support early-career professionals, managers and people building practical communication, leadership or modern workplace skills.',
      },
      {
        question: 'Does every programme include a certificate?',
        answer:
          'Certificate availability depends on the programme requirements and completion criteria. The team confirms this before registration.',
      },
    ],
  },
};

export const credibilityPrinciples = [
  {
    title: 'Discipline-specific',
    text: 'Each school keeps the standards, language and methods appropriate to its field.',
  },
  {
    title: 'Human-centred',
    text: 'Programmes begin with the person, their context and the outcome that matters.',
  },
  {
    title: 'Applied learning',
    text: 'Knowledge is connected to guided practice, feedback and useful next steps.',
  },
  {
    title: 'Bilingual by design',
    text: 'The system is built for high-quality Latin and Arabic typography, direction and readability.',
  },
] as const;

export const learningOpportunities = [
  {
    school: 'psychology' as const,
    label: 'Psychology',
    title: 'Support, coaching and group learning',
    text: 'Explore individual guidance, family-focused pathways, coaching and educational workshops.',
    cta: 'Explore psychology programmes',
  },
  {
    school: 'languages' as const,
    label: 'Languages',
    title: 'Foundations, fluency and communication',
    text: 'Find a level-aware path for English, French and confident real-world communication.',
    cta: 'Find a language course',
  },
  {
    school: 'training' as const,
    label: 'Professional Training',
    title: 'Skills for people, teams and organisations',
    text: 'Build practical capability through leadership, communication and workplace learning.',
    cta: 'View professional training',
  },
] as const;
