import type {
  AgeBand,
  AnimationLevel,
  Dialect,
  RewardStyle,
  SessionMinutes,
  VoiceSpeed,
} from '@luminol/kids-learning';

/** Text for the parent area. Parents read it, so it is not voiced. */
export const PARENT_COPY = {
  appName: 'خطوة',
  gate: {
    title: 'للوالدين فقط',
    instruction: 'للمتابعة، اختر ناتج هذه العملية:',
    retry: 'لنجرّب سؤالًا آخر.',
    cancel: 'رجوع',
  },
  home: {
    title: 'مساحة الوالدين',
    open: 'مساحة الوالدين',
    profiles: 'ملفات الأطفال',
    empty: 'لم تُضِف أي ملف بعد. أضِف ملفًا ليبدأ طفلك اللعب.',
    addChild: 'إضافة طفل',
    edit: 'تعديل',
    exit: 'العودة إلى اللعب',
    noArabicVoice:
      'لا يوجد صوت عربي مثبّت على هذا الجهاز، لذلك لن تُقرأ الكلمات بصوت مسموع. يمكنك تثبيت صوت عربي من إعدادات تحويل النص إلى كلام في الجهاز.',
    privacy:
      'تبقى كل البيانات على هذا الجهاز وهي مشفّرة، ولا تُرسَل إلى أي خادم. لا إعلانات ولا تتبّع.',
  },
  startup: {
    error:
      'تعذّر فتح التخزين الآمن على هذا الجهاز. أغلق التطبيق ثم افتحه من جديد.',
  },
  welcome: {
    title: 'أهلًا بكم في خطوة',
    body: 'ألعاب تعليمية هادئة بالعربية. يبدأ أحد الوالدين بإعداد ملف للطفل.',
    start: 'إعداد للوالدين',
  },
  profile: {
    newTitle: 'ملف طفل جديد',
    editTitle: 'ملف الطفل',
    nickname: 'الاسم المستعار',
    nicknameHint: 'يكفي اسم قصير أو لقب، فنحن لا نطلب الاسم الكامل.',
    nicknameError: 'أدخل اسمًا قصيرًا من حرف واحد إلى 24 حرفًا، دون رموز خاصة.',
    avatar: 'الرمز',
    ageBand: 'العمر',
    dialect: 'اللهجة المسموعة',
    dialectNote:
      'تُستخدم التسجيلات الصوتية بهذه اللهجة عند توفّرها، وإلا يقرأ صوت الجهاز بالعربية الفصحى.',
    save: 'حفظ',
    saved: 'تم الحفظ',
    delete: 'حذف الملف',
    deleteConfirm:
      'سيُحذف هذا الملف وكل تقدّمه من هذا الجهاز نهائيًا. لا يمكن التراجع عن ذلك.',
    deleteConfirmAction: 'حذف نهائي',
    cancel: 'إلغاء',
  },
  sensory: {
    title: 'الإعدادات الحسية',
    volume: 'مستوى الصوت',
    muted: 'صامت',
    voiceSpeed: 'سرعة الصوت',
    animationLevel: 'الحركة على الشاشة',
    animationNote:
      'إذا فُعّل خيار تقليل الحركة في الجهاز فسيُوقَف كل تحريك تلقائيًا.',
    rewardStyle: 'أسلوب المكافأة',
    sessionMinutes: 'مدة الجلسة',
    sessionNote: 'تُقاس الجلسة بعدد الأنشطة، ولا يرى الطفل أي مؤقّت.',
  },
} as const;

export const DIALECT_LABELS: Record<Dialect, string> = {
  msa: 'العربية الفصحى',
  maghrebi: 'المغاربية',
  gulf: 'الخليجية',
  egyptian: 'المصرية',
  levantine: 'الشامية',
};

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  '3-4': '3–4 سنوات',
  '5-6': '5–6 سنوات',
  '7-8': '7–8 سنوات',
  '9-10': '9–10 سنوات',
};

export const VOICE_SPEED_LABELS: Record<VoiceSpeed, string> = {
  slow: 'بطيئة',
  normal: 'عادية',
  brisk: 'أسرع قليلًا',
};

export const ANIMATION_LEVEL_LABELS: Record<AnimationLevel, string> = {
  none: 'بلا حركة',
  low: 'قليلة',
  normal: 'عادية',
};

export const REWARD_STYLE_LABELS: Record<RewardStyle, string> = {
  stars: 'نجوم',
  character: 'رمز الطفل يبتسم',
  quiet: 'هادئ',
};

/** Arabic counted nouns: 3–10 take the plural, 11 and above the singular. */
export function minutesLabel(minutes: SessionMinutes): string {
  return minutes <= 10 ? `${minutes} دقائق` : `${minutes} دقيقة`;
}

export function volumeLabel(volume: number): string {
  return volume === 0
    ? PARENT_COPY.sensory.muted
    : `${Math.round(volume * 100)}%`;
}
