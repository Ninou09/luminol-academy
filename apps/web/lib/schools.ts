export const schools = {
  psychology: {
    slug: 'psychology',
    number: '01',
    name: 'Psychology',
    eyebrow: 'Wellbeing · Awareness · Personal development',
    headline: 'Understand what you feel. Build what helps you thrive.',
    introduction:
      'Luminol Psychology creates a thoughtful space for emotional awareness, supportive guidance and meaningful personal development across different stages of life.',
    promise:
      'Scientific thinking, human warmth and practical tools—brought together with care.',
    visualWords: ['Awareness', 'Balance', 'Connection'],
    programs: [
      {
        title: 'Individual support',
        description:
          'Structured conversations and practical guidance for people navigating stress, change, confidence and emotional growth.',
      },
      {
        title: 'Child and family guidance',
        description:
          'Educational support that helps parents and families better understand development, communication and everyday challenges.',
      },
      {
        title: 'Coaching programs',
        description:
          'Goal-oriented development for habits, self-awareness, relationships and the next meaningful chapter.',
      },
      {
        title: 'Workshops',
        description:
          'Accessible group learning around emotional intelligence, stress management, parenting and self-development.',
      },
    ],
    approach: [
      {
        title: 'Listen deeply',
        description:
          'Begin with the person, their context and what meaningful progress looks like for them.',
      },
      {
        title: 'Create clarity',
        description:
          'Turn complex experiences into understandable patterns, language and practical direction.',
      },
      {
        title: 'Build forward',
        description:
          'Translate insight into supportive actions that can be practiced in everyday life.',
      },
    ],
    audiences: ['Individuals', 'Parents and families', 'Young people', 'Teams'],
    note:
      'Luminol Psychology programs are educational and supportive. They do not replace emergency, psychiatric or medical care. Appropriate professional referral should always be used when a person needs a different level of support.',
  },
  languages: {
    slug: 'languages',
    number: '02',
    name: 'Languages',
    eyebrow: 'Language · Culture · Confident communication',
    headline: 'Find your voice. Use it with confidence.',
    introduction:
      'Luminol Languages turns language knowledge into real communication through structured learning, thoughtful practice and meaningful cultural connection.',
    promise:
      'Clear pathways from foundations to fluency, designed around how people actually communicate.',
    visualWords: ['Learn', 'Express', 'Connect'],
    programs: [
      {
        title: 'English programs',
        description:
          'Progressive learning for foundations, academic goals, confident conversation and professional communication.',
      },
      {
        title: 'French programs',
        description:
          'Structured language development that balances grammar, comprehension, pronunciation and expression.',
      },
      {
        title: 'Fluency pathways',
        description:
          'Focused practice for learners ready to move from knowing the language to using it naturally.',
      },
      {
        title: 'Communication skills',
        description:
          'Practical speaking, presentation and workplace communication for real personal and professional situations.',
      },
    ],
    approach: [
      {
        title: 'Know your level',
        description:
          'Start from a clear understanding of current ability, goals and the situations where the language matters.',
      },
      {
        title: 'Practice meaningfully',
        description:
          'Learn through useful language, guided feedback and communication—not memorization alone.',
      },
      {
        title: 'Use your voice',
        description:
          'Build the confidence and flexibility to communicate beyond the classroom.',
      },
    ],
    audiences: ['Young learners', 'University students', 'Professionals', 'Organizations'],
    note:
      'Program levels, schedules and language options are confirmed during enrolment so every learner enters the most appropriate pathway.',
  },
  training: {
    slug: 'training',
    number: '03',
    name: 'Professional Training',
    eyebrow: 'Capability · Leadership · Career growth',
    headline: 'Develop the skills that move work forward.',
    introduction:
      'Luminol Professional Training helps individuals and organizations turn ambition into capability through practical, relevant and thoughtfully designed learning.',
    promise:
      'Professional development that respects your time and connects directly to how work gets done.',
    visualWords: ['Lead', 'Create', 'Advance'],
    programs: [
      {
        title: 'Leadership',
        description:
          'Develop self-awareness, sound decision-making and the communication needed to guide people well.',
      },
      {
        title: 'Professional communication',
        description:
          'Strengthen presentations, collaboration, feedback and confident communication across the workplace.',
      },
      {
        title: 'Productivity and digital skills',
        description:
          'Build practical systems and modern capabilities for focused, effective and adaptable work.',
      },
      {
        title: 'Corporate workshops',
        description:
          'Purpose-built learning experiences aligned with team needs, organizational context and desired outcomes.',
      },
    ],
    approach: [
      {
        title: 'Define the outcome',
        description:
          'Clarify the capability, behavior or workplace result the learning experience needs to support.',
      },
      {
        title: 'Learn by doing',
        description:
          'Use practical examples, active exercises and feedback that connect learning to real work.',
      },
      {
        title: 'Apply with confidence',
        description:
          'Leave with useful tools, clearer decisions and an actionable way forward.',
      },
    ],
    audiences: ['Early-career professionals', 'Managers', 'Teams', 'Organizations'],
    note:
      'Corporate programs can be adapted to the audience, format and business objective after a focused needs conversation.',
  },
} as const;

export type SchoolSlug = keyof typeof schools;

export function isSchoolSlug(value: string): value is SchoolSlug {
  return value in schools;
}
