import type { SchoolSlug } from './schools';

export type AcademyPhoto = {
  src: string;
  alt: string;
  label: string;
};

export const academyMedia = {
  classroom: {
    src: '/media/academy/classroom-digital.webp',
    alt: 'قاعة تدريب حقيقية داخل أكاديمية لومينول أثناء جلسة تعلم رقمية',
    label: 'من فضاءات أكاديمية لومينول',
  },
  languages: {
    src: '/media/academy/language-map.webp',
    alt: 'جدارية خريطة العالم داخل فضاء تعلم اللغات في أكاديمية لومينول',
    label: 'من فضاء اللغات في الأكاديمية',
  },
  training: {
    src: '/media/academy/workshop-training.webp',
    alt: 'ورشة تدريب حقيقية داخل أكاديمية لومينول بحضور متدربين ومدرب',
    label: 'من ورشات أكاديمية لومينول',
  },
  psychology: {
    src: '/media/academy/child-activities.webp',
    alt: 'أنشطة تعليمية وإدراكية عملية موثقة داخل أكاديمية لومينول',
    label: 'من أنشطة الأكاديمية',
  },
  recognition: {
    src: '/media/academy/recognition.webp',
    alt: 'لحظة تكريم موثقة ضمن أرشيف أكاديمية لومينول',
    label: 'من أرشيف لومينول',
  },
  founder: {
    src: '/media/academy/founder-kheddaoui-fettouma.svg',
    alt: 'خداوي فطومة، مؤسسة أكاديمية لومينول',
    label: 'مؤسسة أكاديمية لومينول',
  },
} as const satisfies Record<string, AcademyPhoto>;

export const academySchoolMedia: Record<SchoolSlug, AcademyPhoto> = {
  psychology: academyMedia.psychology,
  languages: academyMedia.languages,
  training: academyMedia.training,
};
