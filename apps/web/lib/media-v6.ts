import type {
  EditorialGalleryImage,
  EditorialImage,
  EditorialVideo,
} from './flagship';
import { academyMedia } from './academy-media';

// V12 replaced the previous photo set by Airam Dato-on / Pexels,
// Vitaly Gariev / Pexels, RDNE Stock project / Pexels,
// Matheus Bertelli / Pexels and Ivan S / Pexels with the authentic
// Luminol Academy archive. Editorial video attribution remains below.
export const premiumImages = {
  hero: {
    src: academyMedia.training.src,
    alt: academyMedia.training.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  psychology: {
    src: academyMedia.psychology.src,
    alt: academyMedia.psychology.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  languages: {
    src: academyMedia.languages.src,
    alt: academyMedia.languages.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  training: {
    src: academyMedia.training.src,
    alt: academyMedia.training.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  learning: {
    src: academyMedia.classroom.src,
    alt: academyMedia.classroom.alt,
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
} satisfies Record<string, EditorialImage>;

export const premiumGallery = [
  {
    src: academyMedia.classroom.src,
    alt: academyMedia.classroom.alt,
    caption: 'التعلّم داخل القاعة',
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  {
    src: academyMedia.training.src,
    alt: academyMedia.training.alt,
    caption: 'ورشة وتكوين حقيقي',
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  {
    src: academyMedia.languages.src,
    alt: academyMedia.languages.alt,
    caption: 'فضاء اللغات داخل الأكاديمية',
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  {
    src: academyMedia.psychology.src,
    alt: academyMedia.psychology.alt,
    caption: 'أنشطة إدراكية وتعليمية',
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
  {
    src: academyMedia.recognition.src,
    alt: academyMedia.recognition.alt,
    caption: 'محطة من مسيرة لومينول',
    credit: 'Luminol Academy archive',
    creditUrl: '/about',
  },
] satisfies readonly EditorialGalleryImage[];

export const premiumVideos = {
  hero: {
    id: 'academy-dialogue-v12',
    src: 'https://videos.pexels.com/video-files/8419413/8419413-hd_1920_1080_30fps.mp4',
    eyebrow: 'تعلّم حي',
    title: 'التعلّم يصبح أقوى عندما تتحول القاعة إلى تفاعل حقيقي.',
    description:
      'مشهد تحريري يركّز على الحوار، المشاركة والتعلّم النشط داخل بيئة تعليمية حديثة.',
    credit: 'RDNE Stock project / Pexels',
    creditUrl:
      'https://www.pexels.com/video/a-teacher-in-discussion-with-his-students-8419413/',
    poster: premiumImages.hero,
  },
  psychology: {
    id: 'psychology-presence-v12',
    src: 'https://videos.pexels.com/video-files/8428200/8428200-uhd_3840_2160_25fps.mp4',
    eyebrow: 'حضور وإنصات',
    title: 'المساحة الجيدة تبدأ بالإنصات قبل الإجابة.',
    description:
      'مشهد تحريري لجلسة إرشاد في مكتب حديث يعبّر عن التركيز والاحترام والحوار الهادئ.',
    credit: 'Kampus Production / Pexels',
    creditUrl:
      'https://www.pexels.com/video/female-therapist-listening-to-a-patient-8428200/',
    poster: premiumImages.psychology,
  },
  languages: {
    id: 'language-dialogue-v12',
    src: 'https://videos.pexels.com/video-files/8196801/8196801-hd_1920_1080_25fps.mp4',
    eyebrow: 'تواصل وممارسة',
    title: 'اللغة تتقدم عندما تصبح نقاشًا ومشاركة.',
    description:
      'مشهد جامعي تحريري يركّز على النقاش والتفاعل والثقة في التعبير داخل المجموعة.',
    credit: 'Yan Krukau / Pexels',
    creditUrl:
      'https://www.pexels.com/video/college-students-having-a-discussion-8196801/',
    poster: premiumImages.languages,
  },
  training: {
    id: 'professional-presentation-v12',
    src: 'https://videos.pexels.com/video-files/8461012/8461012-uhd_3840_2160_25fps.mp4',
    eyebrow: 'تطور مهني',
    title: 'الفكرة المهنية تكسب قيمتها عندما تُشرح وتُختبر مع الآخرين.',
    description:
      'مشهد تحريري لاجتماع وعرض مهني يعبّر عن التواصل، التعاون وتقديم الأفكار بوضوح.',
    credit: 'Kampus Production / Pexels',
    creditUrl:
      'https://www.pexels.com/video/man-presenting-at-the-office-8461012/',
    poster: premiumImages.training,
  },
} satisfies Record<string, EditorialVideo>;
