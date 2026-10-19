import type {
  AgeBand,
  AnimationLevel,
  Dialect,
  NumeralStyle,
  PromptLevel,
  RewardStyle,
  SessionMinutes,
  Trend,
  VoiceSpeed,
} from '@luminol/kids-learning';

/** Text for the parent area. Parents read it, so it is not voiced. */
export const PARENT_COPY = {
  appName: 'لومينول نور',
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
    title: 'أهلًا بكم في لومينول نور',
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
    numeralStyle: 'شكل الأرقام',
    interests: 'ما يحبّه الطفل',
    interestsNote:
      'تظهر هذه المواضيع في ألعاب الصور. اختر موضوعًا واحدًا على الأقل.',
    religiousPack: 'الحزمة الدينية',
    religiousOn: 'مفعّلة',
    religiousOff: 'مطفأة',
    religiousNote:
      'تضيف الوضوء والصلاة إلى الروتين ولعبة الترتيب، وقصصًا عن رمضان وعيد الفطر.',
    prayerPictures: 'صور الصلاة',
    prayerBoy: 'ولد',
    prayerGirl: 'بنت',
    activities: 'الأنشطة في الجدول',
    activitiesNote:
      'أوقف أيّ نشاط لا يناسب طفلك الآن، ويبقى نشاط واحد على الأقل. نشاطا الوجوه والمشاعر اختياريان، ولا يطلبان من الطفل النظر في العينين.',
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
  board: {
    open: 'تعديل لوحة الكلام',
    title: 'لوحة الكلام',
    intro:
      'اختر البطاقات التي تظهر لطفلك، وأضِف صورًا من حياته وتسجيلات بصوتك. تبقى الصور والتسجيلات على هذا الجهاز فقط.',
    hide: 'إخفاء',
    show: 'إظهار',
    hidden: 'مخفية',
    edit: 'تعديل',
    custom: 'بطاقاتي',
    addCard: 'إضافة بطاقة',
  },
  card: {
    newTitle: 'بطاقة جديدة',
    editTitle: 'تعديل البطاقة',
    label: 'الكلمة',
    labelHint: 'اكتب الكلمة كما ستظهر على البطاقة وكما ستُقرأ.',
    labelError: 'اكتب كلمة قصيرة من حرف واحد إلى 30 حرفًا، دون رموز خاصة.',
    category: 'المجموعة',
    picture: 'الصورة',
    pictureRequired: 'أضِف صورة للبطاقة.',
    takePhoto: 'التقاط صورة',
    choosePhoto: 'اختيار من الصور',
    originalPicture: 'الصورة الأصلية',
    voice: 'الصوت',
    defaultVoice: 'الصوت الافتراضي',
    parentVoice: 'صوتي المسجّل',
    record: 'تسجيل بصوتي',
    stop: 'إيقاف التسجيل',
    recording: 'جارٍ التسجيل… قل الكلمة بهدوء.',
    listen: 'استماع',
    permissionDenied:
      'لم يُسمح بالوصول. يمكنك تغيير ذلك من إعدادات التطبيق في الجهاز.',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف البطاقة',
  },
  sequences: {
    open: 'الروتين والقصص',
    title: 'الروتين والقصص',
    intro:
      'اصنع روتينًا خطوة بخطوة أو قصة اجتماعية لطفلك، بصور من لوحة الكلام أو بصورك. تبقى الصور والتسجيلات على هذا الجهاز فقط.',
    routines: 'الروتين',
    stories: 'القصص',
    empty: 'لا يوجد شيء هنا بعد.',
    addRoutine: 'روتين جديد',
    addStory: 'قصة جديدة',
    edit: 'تعديل',
    newRoutine: 'روتين جديد',
    newStory: 'قصة جديدة',
    editRoutine: 'تعديل الروتين',
    editStory: 'تعديل القصة',
    name: 'الاسم',
    nameHint: 'مثل: الصباح، أو زيارة الطبيب.',
    nameError: 'أدخل اسمًا من حرف واحد إلى 30 حرفًا، دون رموز خاصة.',
    routineSteps: 'الخطوات',
    storyPages: 'الصفحات',
    addStep: 'إضافة خطوة',
    addPage: 'إضافة صفحة',
    stepsError: 'أضِف خطوة واحدة على الأقل، واحفظ الخطوة المفتوحة أولًا.',
    stepLabel: 'الخطوة',
    moveUp: 'تقديم',
    moveDown: 'تأخير',
    remove: 'حذف',
    text: 'الجملة',
    textHint: 'جملة قصيرة يسمعها الطفل، مثل: أغسل يديّ.',
    textError: 'أدخل جملة من حرف واحد إلى 80 حرفًا، دون رموز خاصة.',
    boardPicture: 'صورة من لوحة الكلام',
    routinePicture: 'صورة من الروتين',
    stepDone: 'تمّ',
    stepCancel: 'تجاهل التغييرات',
    pictureRequired: 'اختر صورة من اللوحة أو أضِف صورة.',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    deleteConfirm: 'سيُحذف هذا نهائيًا مع صوره وتسجيلاته من هذا الجهاز.',
    deleteConfirmAction: 'حذف نهائي',
  },
  progress: {
    open: 'التقدّم والتقارير',
    title: 'التقدّم',
    summary: 'نظرة عامة',
    sessions: 'الجلسات',
    activities: 'الأنشطة المكتملة',
    calmVisits: 'زيارات ركن الهدوء',
    trialsWeek: 'محاولات آخر 7 أيام',
    daysMonth: 'أيام التدرّب في آخر 30 يومًا',
    skills: 'المهارات',
    noSkills: 'لم يتدرّب الطفل على أي نشاط بعد.',
    level: 'المستوى',
    help: 'المساعدة',
    firstTry: 'النجاح من أول محاولة (آخر 10)',
    notEnough: 'محاولات قليلة بعد',
    trend: 'الاتجاه',
    trials: 'المحاولات',
    lastPracticed: 'آخر تدريب',
    rateNote:
      'تُحسب نسبة النجاح من المحاولة الأولى فقط، والمساعدة لا تُعدّ خطأ.',
    history: 'آخر الجلسات',
    noHistory: 'لا توجد جلسات بعد.',
    sessionLine: 'أنشطة مكتملة',
    calmLine: 'زيارات للهدوء',
    goals: 'الأهداف',
    goalsIntro:
      'اختر مهارة ومستوى تريد أن يصل إليه الطفل دون مساعدة. لا تغيّر الأهداف صعوبة الألعاب.',
    noGoals: 'لا توجد أهداف بعد.',
    addGoal: 'إضافة هدف',
    goalSkill: 'المهارة',
    goalLevel: 'المستوى المستهدف',
    goalSave: 'حفظ الهدف',
    goalStatus: 'الحالة',
    goalAchieved: 'تحقّق',
    goalInProgress: 'قيد العمل',
    goalRemove: 'حذف الهدف',
    goalLimit: 'وصلت إلى الحد الأقصى من الأهداف.',
    report: 'مشاركة تقرير PDF',
    reportTitle: 'تقرير تقدّم',
    reportDate: 'تاريخ التقرير',
    reportNote:
      'أُعدّ هذا التقرير على الجهاز من بيانات لومينول نور. هو لدعم المتابعة مع الأخصائي، ولا يُعدّ تشخيصًا.',
    export: 'تصدير البيانات (JSON)',
    exportNote:
      'يضمّ التصدير الملف والتقدّم والجلسات والأهداف والروتين والقصص، دون الصور والتسجيلات. أنت من يختار أين تُرسَل.',
    shareFailed: 'تعذّرت المشاركة على هذا الجهاز.',
    clear: 'مسح سجلّ التقدّم',
    clearConfirm:
      'ستُحذف الجلسات والمحاولات والمستويات والأهداف لهذا الطفل، ويبقى الملف ولوحة الكلام والروتين. لا يمكن التراجع عن ذلك.',
    clearConfirmAction: 'مسح نهائي',
    cleared: 'تم مسح السجلّ',
  },
  plus: {
    open: 'نور بلس',
    title: 'نور بلس',
    intro:
      'لومينول نور مجاني مع طفل واحد. يضيف نور بلس ما يلي، ويبقى كل ما عدا ذلك مجانيًا دائمًا: لوحة الكلام وركن الهدوء والروتين والقصص الجاهزة والحزمة الدينية والتحكّم في البيانات.',
    features: {
      'all-activities': 'كل الألعاب والأنشطة في الجدول',
      'all-themes':
        'كل المواضيع: الحيوانات ووسائل النقل والسماء والفضاء والمزيد',
      profiles: 'حتى 6 ملفات أطفال',
      'own-routines': 'روتين وقصص اجتماعية تصنعها بنفسك',
      'pdf-report': 'تقرير تقدّم PDF لمشاركته مع الأخصائي',
    },
    active: 'نور بلس مفعّل على هذا الجهاز.',
    monthly: 'شهري',
    annual: 'سنوي',
    other: 'اشتراك',
    perMonth: 'شهريًا',
    perYear: 'سنويًا',
    subscribe: 'اشتراك',
    terms:
      'يُدفع الاشتراك عبر Google Play ويتجدّد تلقائيًا في نهاية كل مدة حتى تلغيه. يمكنك الإلغاء في أي وقت من إدارة الاشتراك، ويبقى نور بلس مفعّلًا حتى نهاية المدة المدفوعة.',
    restore: 'استعادة المشتريات',
    manage: 'إدارة الاشتراك في Google Play',
    loading: 'جارٍ التحميل…',
    unavailable: 'الاشتراك غير متاح في هذه النسخة من التطبيق.',
    testing:
      'نسخة تجريبية: كل ميزات نور بلس مفتوحة، ولا يُباع أي اشتراك في هذه النسخة.',
    noOffers: 'لا تتوفّر عروض الاشتراك الآن. حاول لاحقًا.',
    pending: 'الدفع قيد المعالجة، وسيُفعَّل نور بلس عند اكتماله.',
    failed: 'لم تكتمل عملية الشراء. حاول مرة أخرى لاحقًا.',
    restored: 'تمت استعادة نور بلس.',
    nothingToRestore: 'لم نجد اشتراكًا سابقًا لهذا الحساب.',
    locked: 'مع نور بلس',
    profileLimit: 'لإضافة طفل آخر، اشترك في نور بلس.',
    themesNote: 'المواضيع الأخرى متاحة مع نور بلس.',
    activitiesNote: 'تظهر هنا الأنشطة المتاحة. باقي الأنشطة مع نور بلس.',
  },
  privacy: {
    open: 'الخصوصية',
    title: 'سياسة الخصوصية',
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

export const PROMPT_LEVEL_LABELS: Record<PromptLevel, string> = {
  full: 'مساعدة كاملة',
  partial: 'مساعدة جزئية',
  independent: 'دون مساعدة',
};

/** Trends are described kindly; a dip asks for more support, never blame. */
export const TREND_LABELS: Record<Trend, string> = {
  up: 'في تحسّن',
  steady: 'ثابت',
  down: 'يحتاج دعمًا أكثر',
};

/** A day as dd/mm/yyyy in Western digits, the same on every device. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export const DIALECT_LABELS: Record<Dialect, string> = {
  msa: 'العربية الفصحى',
  maghrebi: 'المغاربية',
  gulf: 'الخليجية',
  egyptian: 'المصرية',
  levantine: 'الشامية',
};

export const NUMERAL_STYLE_LABELS: Record<NumeralStyle, string> = {
  western: 'أرقام 1 2 3',
  'arabic-indic': 'أرقام ١ ٢ ٣',
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
