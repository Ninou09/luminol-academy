import type {
  EditorialGalleryImage,
  EditorialImage,
  EditorialVideo,
} from './flagship';

export const premiumImages = {
  hero: {
    src: 'https://images.pexels.com/photos/8197553/pexels-photo-8197553.jpeg',
    alt: 'أستاذ يتفاعل مع مجموعة متنوعة من طلاب الجامعة داخل قاعة تعلم حديثة.',
    credit: 'Yan Krukau / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/man-teaching-students-in-a-university-8197553/',
  },
  psychology: {
    src: 'https://images.pexels.com/photos/9065249/pexels-photo-9065249.jpeg',
    alt: 'حوار مهني هادئ داخل مكتب حديث ومضيء يعكس الإنصات والدعم.',
    credit: 'RDNE Stock project / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/psychologist-talking-to-a-patient-9065249/',
  },
  languages: {
    src: 'https://images.pexels.com/photos/37790423/pexels-photo-37790423.jpeg',
    alt: 'طلاب جامعيون يتبادلون الحديث في قاعة مضيئة أثناء نقاش جماعي.',
    credit: 'Keyla Brito / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/sunlit-classroom-discussion-with-students-37790423/',
  },
  training: {
    src: 'https://images.pexels.com/photos/18800463/pexels-photo-18800463.jpeg',
    alt: 'متحدث يقدم عرضًا أمام مجموعة داخل مساحة تعليم وتطوير مهني.',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/man-giving-a-presentation-18800463/',
  },
  learning: {
    src: 'https://images.pexels.com/photos/8197534/pexels-photo-8197534.jpeg',
    alt: 'طلاب جامعة يتابعون محاضرة ويتفاعلون مع الأستاذ في بيئة أكاديمية.',
    credit: 'Yan Krukau / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/lecture-at-the-university-8197534/',
  },
} satisfies Record<string, EditorialImage>;

export const premiumGallery = [
  {
    src: 'https://images.pexels.com/photos/37827720/pexels-photo-37827720.jpeg',
    alt: 'طلاب داخل قاعة جامعية يتناقشون بصورة طبيعية وتفاعلية.',
    caption: 'نقاش يصنع الفهم',
    credit: 'Mica Bassa / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-engaged-in-lively-classroom-discussion-37827720/',
  },
  {
    src: 'https://images.pexels.com/photos/8419252/pexels-photo-8419252.jpeg',
    alt: 'طالبان يتبادلان الحديث في قاعة دراسية مشرقة.',
    caption: 'تواصل حقيقي',
    credit: 'Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-having-a-conversation-in-a-classroom-8419252/',
  },
  {
    src: 'https://images.pexels.com/photos/7579312/pexels-photo-7579312.jpeg',
    alt: 'جلسة حوار هادئة بين مختص وشخص داخل مكتب مريح.',
    caption: 'إنصات وحضور',
    credit: 'AI25.Studio / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/man-in-a-psychotherapy-session-with-a-psychologist-7579312/',
  },
  {
    src: 'https://images.pexels.com/photos/18800463/pexels-photo-18800463.jpeg',
    alt: 'متحدث يقدم عرضًا تعليميًا أمام مجموعة من المتعلمين البالغين.',
    caption: 'تطوير مهني تطبيقي',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/man-giving-a-presentation-18800463/',
  },
  {
    src: 'https://images.pexels.com/photos/8199134/pexels-photo-8199134.jpeg',
    alt: 'مجموعة متنوعة من طلاب الجامعة تشارك في نقاش مع أستاذ.',
    caption: 'مشاركة وثقة',
    credit: 'Yan Krukau / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/a-class-having-a-discussion-8199134/',
  },
  {
    src: 'https://images.pexels.com/photos/37795357/pexels-photo-37795357.jpeg',
    alt: 'أستاذة تتفاعل مباشرة مع طالب داخل قاعة جامعية.',
    caption: 'توجيه قريب',
    credit: 'Eduard Perez / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/university-classroom-discussion-with-teacher-37795357/',
  },
] satisfies readonly EditorialGalleryImage[];

export const premiumVideos = {
  hero: {
    id: 'academy-dialogue-v8',
    src: 'https://videos.pexels.com/video-files/6671805/6671805-uhd_3840_2160_24fps.mp4',
    eyebrow: 'تعلم حي',
    title: 'التعلم يبدأ عندما يصبح الشرح حوارًا.',
    description:
      'مشهد تحريري يعبّر عن التفاعل والأسئلة والمشاركة داخل بيئة تعلم حديثة.',
    credit: 'Andy Barbour / Pexels',
    creditUrl:
      'https://www.pexels.com/video/video-of-a-teacher-teaching-students-6671805/',
    poster: premiumImages.hero,
  },
  psychology: {
    id: 'psychology-presence-v8',
    src: 'https://videos.pexels.com/video-files/5697627/5697627-uhd_3840_2160_24fps.mp4',
    eyebrow: 'حضور إنساني',
    title: 'الإنصات جزء من التجربة.',
    description: 'مشهد تحريري لحوار داعم يعبّر عن الهدوء والتركيز والاحترام.',
    credit: 'Alex Green / Pexels',
    creditUrl: 'https://www.pexels.com/video/therapist-consulting-5697627/',
    poster: premiumImages.psychology,
  },
  languages: {
    id: 'language-dialogue-v8',
    src: 'https://videos.pexels.com/video-files/8419413/8419413-hd_1920_1080_30fps.mp4',
    eyebrow: 'تواصل وممارسة',
    title: 'اللغة تتقدم عندما تتحول إلى تفاعل.',
    description:
      'مشهد تعليمي تحريري يركّز على النقاش والمشاركة والثقة في التعبير.',
    credit: 'RDNE Stock project / Pexels',
    creditUrl:
      'https://www.pexels.com/video/a-teacher-in-discussion-with-his-students-8419413/',
    poster: premiumImages.languages,
  },
  training: {
    id: 'professional-conversation-v8',
    src: 'https://videos.pexels.com/video-files/5762301/5762301-uhd_3840_2160_24fps.mp4',
    eyebrow: 'تطور مهني',
    title: 'الأفكار تصبح أقوى عندما تُشرح وتُناقش.',
    description:
      'مشهد تحريري لمحادثة مهنية يعبّر عن الحضور والتواصل وصياغة الأفكار بوضوح.',
    credit: 'RDNE Stock project / Pexels',
    creditUrl: 'https://www.pexels.com/video/man-being-interviewed-5762301/',
    poster: premiumImages.training,
  },
} satisfies Record<string, EditorialVideo>;
