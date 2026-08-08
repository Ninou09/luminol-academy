import type {
  EditorialGalleryImage,
  EditorialImage,
  EditorialVideo,
} from './flagship';

export const premiumImages = {
  hero: {
    src: 'https://images.pexels.com/photos/15189552/pexels-photo-15189552.jpeg',
    alt: 'مجموعة متنوعة تشارك في ورشة مهنية حديثة مع عرض بصري واضح.',
    credit: 'Airam Dato-on / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/man-giving-a-presentation-to-a-group-of-people-15189552/',
  },
  psychology: {
    src: 'https://images.pexels.com/photos/36729380/pexels-photo-36729380.jpeg',
    alt: 'جلسة إرشاد هادئة داخل مكتب دافئ تعكس الإصغاء والثقة.',
    credit: 'Vitaly Gariev / Pexels',
    creditUrl: 'https://www.pexels.com/photo/36729380',
  },
  languages: {
    src: 'https://images.pexels.com/photos/8419252/pexels-photo-8419252.jpeg',
    alt: 'طالبان يتبادلان الحديث داخل قاعة دراسية مشرقة وحديثة.',
    credit: 'RDNE Stock project / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-having-a-conversation-in-a-classroom-8419252/',
  },
  training: {
    src: 'https://images.pexels.com/photos/33714897/pexels-photo-33714897.jpeg',
    alt: 'مجموعة متنوعة من البالغين تتابع ورشة تفاعلية في بيئة مهنية.',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/engaging-workshop-session-with-attentive-audience-33714897/',
  },
  learning: {
    src: 'https://images.pexels.com/photos/5756759/pexels-photo-5756759.jpeg',
    alt: 'بالغون يشاركون في نقاش جماعي موجّه ضمن بيئة تعليمية دافئة.',
    credit: 'RDNE Stock project / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/group-of-students-attending-classes-for-adults-5756759/',
  },
} satisfies Record<string, EditorialImage>;

export const premiumGallery = [
  {
    src: 'https://images.pexels.com/photos/5756759/pexels-photo-5756759.jpeg',
    alt: 'مجموعة من البالغين تشارك في نقاش تعليمي تفاعلي.',
    caption: 'تعلّم بالمشاركة',
    credit: 'RDNE Stock project / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/group-of-students-attending-classes-for-adults-5756759/',
  },
  {
    src: 'https://images.pexels.com/photos/8419252/pexels-photo-8419252.jpeg',
    alt: 'طالبان يتحاوران في قاعة دراسية مضيئة.',
    caption: 'لغة تتحول إلى حوار',
    credit: 'RDNE Stock project / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-having-a-conversation-in-a-classroom-8419252/',
  },
  {
    src: 'https://images.pexels.com/photos/36729380/pexels-photo-36729380.jpeg',
    alt: 'جلسة إرشاد مريحة تعكس الإنصات والدعم.',
    caption: 'مساحة للإنصات',
    credit: 'Vitaly Gariev / Pexels',
    creditUrl: 'https://www.pexels.com/photo/36729380',
  },
  {
    src: 'https://images.pexels.com/photos/15189552/pexels-photo-15189552.jpeg',
    alt: 'مقدم يقود ورشة أمام مجموعة متنوعة في مساحة مهنية حديثة.',
    caption: 'فكرة تتحول إلى ممارسة',
    credit: 'Airam Dato-on / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/man-giving-a-presentation-to-a-group-of-people-15189552/',
  },
  {
    src: 'https://images.pexels.com/photos/33714897/pexels-photo-33714897.jpeg',
    alt: 'حضور متنوع يتابع جلسة تدريبية تفاعلية بانتباه.',
    caption: 'مشاركة تصنع الثقة',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/engaging-workshop-session-with-attentive-audience-33714897/',
  },
  {
    src: 'https://images.pexels.com/photos/5676741/pexels-photo-5676741.jpeg',
    alt: 'طلاب يتعلمون ويتفاعلون معًا داخل قاعة مشرقة.',
    caption: 'توجيه قريب وواضح',
    credit: 'Ivan S / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-in-the-classroom-5676741/',
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
