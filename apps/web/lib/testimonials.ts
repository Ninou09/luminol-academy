import type { Locale } from '@luminol/localization';

export type AcademyTestimonial = {
  id: string;
  name: string;
  quote: Record<Locale, string>;
  provenance: {
    sourceFile: string;
    sourceType: 'owner-provided-comment-screenshot';
    originalLanguage: 'ar';
    originalExcerpt: string;
    courseContext: 'CBT course' | 'Unspecified course';
  };
};

/**
 * Excerpts transcribed from the owner's supplied comment screenshots.
 * Names retain the displayed spelling. English and French are translations,
 * not original comments. Do not attach these quotations to a current programme.
 */
export const academyTestimonials = [
  {
    id: 'anfel-boutelis',
    name: 'Anfel Boutelis',
    quote: {
      ar: 'من أفضل ما يميز هذه الدورة أنها لم تكتف بالنظري، بل جعلتنا نفهم كيف نطبق ما نتعلمه.',
      en: 'One of the best things about this course is that it did not stop at theory: it helped us understand how to apply what we learn.',
      fr: 'L’un des grands atouts de cette formation est qu’elle ne s’est pas limitée à la théorie : elle nous a permis de comprendre comment appliquer ce que nous apprenons.',
    },
    provenance: {
      sourceFile: 'WhatsApp Image 2026-07-27 at 02.30.20(2).jpeg',
      sourceType: 'owner-provided-comment-screenshot',
      originalLanguage: 'ar',
      originalExcerpt:
        'من أفضل ما يميز هذه الدورة أنها لم تكتف بالنظري، بل جعلتنا نفهم كيف نطبق ما نتعلمه.',
      courseContext: 'CBT course',
    },
  },
  {
    id: 'amina-aabir',
    name: 'Amina Aabir',
    quote: {
      ar: 'فعلا كانت دورة رائعة ومعلومات جد قيمة، سررت جدا بان كنت مع الاستاذة ذات الكفاءة الممتازة وضمن فريق من الزملاء الرائعين.',
      en: 'It really was a wonderful course with very valuable information. I was very happy to be with such an excellent instructor and a group of wonderful colleagues.',
      fr: 'C’était vraiment une excellente formation, avec des informations très précieuses. J’ai eu beaucoup de plaisir à être avec une enseignante très compétente et un groupe de collègues formidables.',
    },
    provenance: {
      sourceFile: 'WhatsApp Image 2026-07-27 at 02.30.20(1).jpeg',
      sourceType: 'owner-provided-comment-screenshot',
      originalLanguage: 'ar',
      originalExcerpt:
        'فعلا كانت دورة رائعة ومعلومات جد قيمة ،سررت جدا بان كنت مع الاستاذة ذات الكفاءة الممتازة وضمن فريق من الزملاء الرائعين',
      courseContext: 'Unspecified course',
    },
  },
  {
    id: 'numidia-amayes',
    name: 'Numidia Amayes',
    quote: {
      ar: 'شكر للاستاذة على كل ماقدمته من معلومات، مراجع، تشجيعات وطاقة ايجابية. اتمنى ان نلتقي في دورات قادمة.',
      en: 'Thanks to the instructor for all the information, references, encouragement and positive energy she shared. I hope we meet again in future courses.',
      fr: 'Merci à l’enseignante pour toutes les informations, les références, les encouragements et l’énergie positive qu’elle a partagés. J’espère que nous nous retrouverons dans de prochaines formations.',
    },
    provenance: {
      sourceFile: 'WhatsApp Image 2026-07-27 at 02.30.19.jpeg',
      sourceType: 'owner-provided-comment-screenshot',
      originalLanguage: 'ar',
      originalExcerpt:
        'شكر للاستاذة على كل ماقدمته من معلومات مراجع تشجيعات وطاقة ايجابية اتمنى ان نلتقي في دورات قادمة',
      courseContext: 'Unspecified course',
    },
  },
] as const satisfies readonly AcademyTestimonial[];

export const testimonialCopy = {
  en: {
    eyebrow: 'In their words',
    title: 'Learning that stays with you.',
    intro:
      'Reflections on understanding, putting ideas into practice and learning together.',
    excerptLabel: 'Translated excerpt from Arabic',
    sourceNote:
      'Excerpts from comments supplied by the academy. Original comments in Arabic.',
  },
  fr: {
    eyebrow: 'Leurs mots',
    title: 'Un apprentissage qui vous accompagne.',
    intro:
      'Des retours sur la compréhension, la mise en pratique et le plaisir d’apprendre ensemble.',
    excerptLabel: 'Extrait traduit de l’arabe',
    sourceNote:
      'Extraits de commentaires transmis par l’académie. Commentaires originaux en arabe.',
  },
  ar: {
    eyebrow: 'بكلماتهم',
    title: 'تعلّم يبقى معك.',
    intro: 'آراء عن الفهم وتطبيق الأفكار والتعلّم مع الآخرين.',
    excerptLabel: 'مقتطف من التعليق الأصلي',
    sourceNote:
      'مقتطفات من تعليقات قدمتها الأكاديمية. النصوص الأصلية بالعربية.',
  },
} as const satisfies Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    excerptLabel: string;
    sourceNote: string;
  }
>;
