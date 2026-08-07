import type { EditorialGalleryImage, EditorialImage, EditorialVideo } from './flagship';

export const premiumImages = {
  hero: {
    src: 'https://images.pexels.com/photos/6238013/pexels-photo-6238013.jpeg',
    alt: 'مجموعة متعلمين بالغين يتعاونون حول طاولة داخل قاعة دراسية حديثة ومضيئة.',
    credit: 'Monstera Production / Pexels',
    creditUrl: 'https://www.pexels.com/photo/positive-diverse-students-studying-in-modern-classroom-6238013/',
  },
  psychology: {
    src: 'https://images.pexels.com/photos/7176052/pexels-photo-7176052.jpeg',
    alt: 'حوار هادئ بين مختصة وشخص داخل مساحة مريحة ومضيئة.',
    credit: 'SHVETS production / Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-patient-talking-to-a-therapist-7176052/',
  },
  languages: {
    src: 'https://images.pexels.com/photos/6683485/pexels-photo-6683485.jpeg',
    alt: 'متعلمات يتبادلن الحديث داخل نشاط تعليمي قائم على التواصل.',
    credit: 'Andy Barbour / Pexels',
    creditUrl: 'https://www.pexels.com/photo/students-having-conversation-inside-the-classroom-6683485/',
  },
  training: {
    src: 'https://images.pexels.com/photos/7234414/pexels-photo-7234414.jpeg',
    alt: 'مجموعة من المهنيين تتابع عرضًا وتشارك في تجربة تعلم احترافية.',
    credit: 'Pavel Danilyuk / Pexels',
    creditUrl: 'https://www.pexels.com/photo/group-of-people-watching-a-speaker-doing-a-presentation-7234414/',
  },
  learning: {
    src: 'https://images.pexels.com/photos/18999540/pexels-photo-18999540/free-photo-of-people-during-training-course.jpeg',
    alt: 'أشخاص بالغون يشاركون في دورة تدريبية داخل مساحة معاصرة.',
    credit: 'Matheus Bertelli / Pexels',
    creditUrl: 'https://www.pexels.com/photo/people-during-training-course-18999540/',
  },
} satisfies Record<string, EditorialImage>;

export const premiumGallery = [
  {
    src: 'https://images.pexels.com/photos/5905527/pexels-photo-5905527.jpeg',
    alt: 'مدرّسة وطلاب يناقشون موضوعًا داخل قاعة حديثة.',
    caption: 'تعلم قائم على الحوار',
    credit: 'Katerina Holmes / Pexels',
    creditUrl: 'https://www.pexels.com/photo/diverse-people-discussing-lesson-in-classroom-5905527/',
  },
  {
    src: 'https://images.pexels.com/photos/8419252/pexels-photo-8419252.jpeg',
    alt: 'طالبان يتبادلان الحديث في قاعة دراسية مشرقة.',
    caption: 'تواصل حقيقي',
    credit: 'Pexels',
    creditUrl: 'https://www.pexels.com/photo/students-having-a-conversation-in-a-classroom-8419252/',
  },
  {
    src: 'https://images.pexels.com/photos/7176050/pexels-photo-7176050.jpeg',
    alt: 'مختصة تستمع باهتمام خلال جلسة دعم فردية.',
    caption: 'إنصات وحضور',
    credit: 'SHVETS production / Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-therapist-talking-to-her-patient-7176050/',
  },
  {
    src: 'https://images.pexels.com/photos/34046709/pexels-photo-34046709.jpeg',
    alt: 'فريق بالغ يشارك في تدريب مهني باستخدام العرض والحواسيب.',
    caption: 'تطوير مهني تطبيقي',
    credit: 'Beniam / Pexels',
    creditUrl: 'https://www.pexels.com/photo/diverse-team-engaged-in-business-training-workshop-34046709/',
  },
  {
    src: 'https://images.pexels.com/photos/8199134/pexels-photo-8199134.jpeg',
    alt: 'طلاب يشاركون في نقاش جماعي داخل الفصل.',
    caption: 'مشاركة وثقة',
    credit: 'Yan Krukau / Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-class-having-a-discussion-8199134/',
  },
  {
    src: 'https://images.pexels.com/photos/6683894/pexels-photo-6683894.jpeg',
    alt: 'طالب ومدرّس يعملان معًا داخل بيئة تعلم حديثة.',
    caption: 'توجيه قريب',
    credit: 'Andy Barbour / Pexels',
    creditUrl: 'https://www.pexels.com/photo/student-and-teacher-having-a-conversation-6683894/',
  },
] satisfies readonly EditorialGalleryImage[];

export const premiumVideos = {
  hero: {
    id: 'academy-dialogue',
    src: 'https://videos.pexels.com/video-files/6671805/6671805-uhd_3840_2160_24fps.mp4',
    eyebrow: 'تعلم حي',
    title: 'المعرفة أقوى عندما تصبح حوارًا.',
    description: 'مشهد تحريري يعبّر عن الشرح والمشاركة والأسئلة داخل بيئة تعلم إنسانية.',
    credit: 'Andy Barbour / Pexels',
    creditUrl: 'https://www.pexels.com/video/video-of-a-teacher-teaching-students-6671805/',
    poster: premiumImages.hero,
  },
  psychology: {
    id: 'psychology-presence',
    src: 'https://videos.pexels.com/video-files/5697627/5697627-uhd_3840_2160_24fps.mp4',
    eyebrow: 'حضور إنساني',
    title: 'الإنصات جزء من التجربة.',
    description: 'مشهد تحريري لحوار داعم يعبّر عن الهدوء والتركيز والاحترام.',
    credit: 'Alex Green / Pexels',
    creditUrl: 'https://www.pexels.com/video/therapist-consulting-5697627/',
    poster: premiumImages.psychology,
  },
  languages: {
    id: 'language-dialogue',
    src: 'https://videos.pexels.com/video-files/6671805/6671805-uhd_3840_2160_24fps.mp4',
    eyebrow: 'تواصل وممارسة',
    title: 'اللغة تتقدم عندما تُستخدم.',
    description: 'مشهد تعليمي تحريري يركّز على الحوار، التفاعل والثقة في المشاركة.',
    credit: 'Andy Barbour / Pexels',
    creditUrl: 'https://www.pexels.com/video/video-of-a-teacher-teaching-students-6671805/',
    poster: premiumImages.languages,
  },
  training: {
    id: 'professional-conversation',
    src: 'https://videos.pexels.com/video-files/5762301/5762301-uhd_3840_2160_24fps.mp4',
    eyebrow: 'تطور مهني',
    title: 'الأفكار تصبح أقوى عندما تُشرح وتُناقش.',
    description: 'مشهد تحريري لمحادثة مهنية يعبّر عن الحضور، التواصل وصياغة الأفكار بوضوح.',
    credit: 'RDNE Stock project / Pexels',
    creditUrl: 'https://www.pexels.com/video/man-being-interviewed-5762301/',
    poster: premiumImages.training,
  },
} satisfies Record<string, EditorialVideo>;
