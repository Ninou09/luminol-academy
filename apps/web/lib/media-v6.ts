import type {
  EditorialGalleryImage,
  EditorialImage,
  EditorialVideo,
} from './flagship';

export const premiumImages = {
  hero: {
    src: 'https://images.pexels.com/photos/6238013/pexels-photo-6238013.jpeg',
    alt: 'مجموعة متنوعة من الطلاب تتعاون داخل قاعة حديثة ومضيئة.',
    credit: 'Monstera Production / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/positive-diverse-students-studying-in-modern-classroom-6238013/',
  },
  psychology: {
    src: 'https://images.pexels.com/photos/36729384/pexels-photo-36729384.jpeg',
    alt: 'جلسة إرشاد مهني هادئة بين مختص وشخص داخل مكتب عصري.',
    credit: 'Vitaly Gariev / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/professional-counseling-session-in-modern-office-36729384/',
  },
  languages: {
    src: 'https://images.pexels.com/photos/8197498/pexels-photo-8197498.jpeg',
    alt: 'طلاب جامعة يتبادلون الحديث خلال نقاش داخل قاعة محاضرات.',
    credit: 'Yan Krukau / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-talking-to-each-other-in-classroom-8197498/',
  },
  training: {
    src: 'https://images.pexels.com/photos/29284274/pexels-photo-29284274.jpeg',
    alt: 'قائد فريق يقدم عرضًا تفاعليًا داخل مكتب حديث أمام مجموعة من الزملاء.',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/engaging-team-presentation-in-modern-office-setting-29284274/',
  },
  learning: {
    src: 'https://images.pexels.com/photos/37795357/pexels-photo-37795357.jpeg',
    alt: 'أستاذة تتفاعل مباشرة مع طالب داخل قاعة جامعية خلال نقاش تعليمي.',
    credit: 'Eduard Perez / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/university-classroom-discussion-with-teacher-37795357/',
  },
} satisfies Record<string, EditorialImage>;

export const premiumGallery = [
  {
    src: 'https://images.pexels.com/photos/6238013/pexels-photo-6238013.jpeg',
    alt: 'طلاب من خلفيات متنوعة يعملون معًا داخل قاعة حديثة.',
    caption: 'تعلّم بالتعاون',
    credit: 'Monstera Production / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/positive-diverse-students-studying-in-modern-classroom-6238013/',
  },
  {
    src: 'https://images.pexels.com/photos/8197498/pexels-photo-8197498.jpeg',
    alt: 'طلاب جامعيون يتبادلون الأفكار أثناء حصة تفاعلية.',
    caption: 'لغة تتحول إلى حوار',
    credit: 'Yan Krukau / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/students-talking-to-each-other-in-classroom-8197498/',
  },
  {
    src: 'https://images.pexels.com/photos/36729384/pexels-photo-36729384.jpeg',
    alt: 'جلسة إرشاد هادئة في مكتب حديث تعكس الإنصات والاحترام.',
    caption: 'مساحة للإنصات',
    credit: 'Vitaly Gariev / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/professional-counseling-session-in-modern-office-36729384/',
  },
  {
    src: 'https://images.pexels.com/photos/29284274/pexels-photo-29284274.jpeg',
    alt: 'متحدث يشرح فكرة أمام فريق في بيئة عمل حديثة.',
    caption: 'مهارة تتحول إلى ممارسة',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/engaging-team-presentation-in-modern-office-setting-29284274/',
  },
  {
    src: 'https://images.pexels.com/photos/8199134/pexels-photo-8199134.jpeg',
    alt: 'مجموعة من الطلاب تشارك في نقاش مع أستاذ داخل قاعة جامعية.',
    caption: 'مشاركة تصنع الثقة',
    credit: 'Yan Krukau / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/a-class-having-a-discussion-8199134/',
  },
  {
    src: 'https://images.pexels.com/photos/37795357/pexels-photo-37795357.jpeg',
    alt: 'أستاذة وطالب يتبادلان الحديث في مساحة تعلم جامعية.',
    caption: 'توجيه قريب وواضح',
    credit: 'Eduard Perez / Pexels',
    creditUrl:
      'https://www.pexels.com/photo/university-classroom-discussion-with-teacher-37795357/',
  },
] satisfies readonly EditorialGalleryImage[];

export const premiumVideos = {
  hero: {
    id: 'academy-dialogue-v9',
    src: 'https://videos.pexels.com/video-files/8196801/8196801-hd_1920_1080_25fps.mp4',
    eyebrow: 'تعلّم حي',
    title: 'التعلّم يصبح أقوى عندما تتحول القاعة إلى حوار.',
    description:
      'مشهد تحريري لمجموعة جامعية تناقش وتتفاعل داخل بيئة تعليم حديثة.',
    credit: 'Yan Krukau / Pexels',
    creditUrl:
      'https://www.pexels.com/video/college-students-having-a-discussion-8196801/',
    poster: premiumImages.hero,
  },
  psychology: {
    id: 'psychology-presence-v9',
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
    id: 'language-dialogue-v9',
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
    id: 'professional-presentation-v9',
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
