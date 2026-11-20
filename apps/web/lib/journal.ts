import type { Locale } from '@luminol/localization';

type Text = Record<Locale, string>;

export type JournalArticle = {
  slug: string;
  /** Drafts are shown with a "Draft for review" badge until Luminol approves them. */
  draft: boolean;
  date: string;
  minutes: number;
  school: 'psychology' | 'languages' | 'training';
  cover: string;
  coverAlt: Text;
  title: Text;
  summary: Text;
  sections: readonly { heading: Text; body: Text }[];
};

/**
 * Luminol Journal: short, general psychoeducation and academy guidance.
 * Articles never give individual advice and always point to a person.
 */
export const journalArticles: readonly JournalArticle[] = [
  {
    slug: 'a-gentler-evening-for-better-sleep',
    draft: true,
    date: '2026-11-19',
    minutes: 3,
    school: 'psychology',
    cover: '/media/people/sleep-night.webp',
    coverAlt: {
      en: 'A woman reads in bed by the warm glow of a salt lamp',
      fr: 'Une femme lit au lit à la lueur d’une lampe de sel',
      ar: 'امرأة تقرأ في سريرها على ضوء مصباح ملح دافئ',
    },
    title: {
      en: 'A gentler evening: small habits for better sleep',
      fr: 'Une soirée plus douce : de petites habitudes pour mieux dormir',
      ar: 'مساء ألطف: عادات صغيرة لنوم أفضل',
    },
    summary: {
      en: 'Sleep rarely improves by force. A calmer last hour of the day — less light, fewer screens, a steady rhythm — gives the body a clear signal to rest.',
      fr: 'Le sommeil s’améliore rarement par la force. Une dernière heure plus calme — moins de lumière, moins d’écrans, un rythme régulier — donne au corps un signal clair de repos.',
      ar: 'نادرًا ما يتحسن النوم بالإجبار. ساعة أخيرة أهدأ من اليوم — ضوء أقل وشاشات أقل وإيقاع ثابت — تعطي الجسم إشارة واضحة للراحة.',
    },
    sections: [
      {
        heading: { en: 'Dim the day', fr: 'Baisser la lumière', ar: 'خفّف ضوء اليوم' },
        body: {
          en: 'Bright light and screens tell the brain it is still daytime. In the last hour before bed, lower the lights, put the phone away from the bed and choose something slow: a book, a warm drink without caffeine, a few quiet words with family.',
          fr: 'La lumière vive et les écrans disent au cerveau qu’il fait encore jour. Dans la dernière heure avant le coucher, baissez les lumières, éloignez le téléphone du lit et choisissez une activité lente : un livre, une boisson chaude sans caféine, quelques mots calmes en famille.',
          ar: 'الضوء القوي والشاشات يخبران الدماغ أن النهار لم ينتهِ. في الساعة الأخيرة قبل النوم خفّف الإضاءة وأبعد الهاتف عن السرير واختر شيئًا هادئًا: كتابًا أو مشروبًا دافئًا بلا كافيين أو كلمات هادئة مع العائلة.',
        },
      },
      {
        heading: { en: 'Keep a steady rhythm', fr: 'Garder un rythme régulier', ar: 'حافظ على إيقاع ثابت' },
        body: {
          en: 'Going to bed and waking up at similar times, even at the weekend, helps the body clock settle. If you cannot sleep after about twenty minutes, get up, do something calm in low light and return when you feel sleepy.',
          fr: 'Se coucher et se lever à des heures proches, même le week-end, aide l’horloge du corps à se stabiliser. Si vous ne dormez pas après une vingtaine de minutes, levez-vous, faites une activité calme dans une lumière douce et revenez quand le sommeil arrive.',
          ar: 'النوم والاستيقاظ في أوقات متقاربة، حتى في عطلة نهاية الأسبوع، يساعد ساعة الجسم على الاستقرار. إذا لم تنم بعد نحو عشرين دقيقة فانهض وافعل شيئًا هادئًا في ضوء خافت ثم عد عندما تشعر بالنعاس.',
        },
      },
      {
        heading: { en: 'When to ask for support', fr: 'Quand demander de l’aide', ar: 'متى تطلب الدعم' },
        body: {
          en: 'These habits are a support, not a treatment. If poor sleep lasts for weeks, comes with low mood or worry, or affects your day, talking with a qualified specialist or a doctor can help.',
          fr: 'Ces habitudes sont un soutien, pas un traitement. Si le mauvais sommeil dure des semaines, s’accompagne de tristesse ou d’inquiétude, ou pèse sur vos journées, parler à un spécialiste qualifié ou à un médecin peut aider.',
          ar: 'هذه العادات وسيلة دعم وليست علاجًا. إذا استمر النوم السيئ لأسابيع، أو رافقه حزن أو قلق، أو أثّر في يومك، فقد يساعدك الحديث مع مختص مؤهل أو طبيب.',
        },
      },
    ],
  },
  {
    slug: 'breathing-through-anxiety',
    draft: true,
    date: '2026-11-19',
    minutes: 3,
    school: 'psychology',
    cover: '/media/people/anxiety-article.webp',
    coverAlt: {
      en: 'A young man breathes calmly by a window at dawn',
      fr: 'Un jeune homme respire calmement près d’une fenêtre à l’aube',
      ar: 'شاب يتنفس بهدوء قرب نافذة عند الفجر',
    },
    title: {
      en: 'Two minutes to slow down: breathing when anxiety rises',
      fr: 'Deux minutes pour ralentir : respirer quand l’anxiété monte',
      ar: 'دقيقتان للتمهّل: التنفس عندما يرتفع القلق',
    },
    summary: {
      en: 'Anxiety is the body’s alarm. A slow breathing rhythm can help it settle — and knowing when to ask for support matters just as much.',
      fr: 'L’anxiété est l’alarme du corps. Un rythme de respiration lent peut l’apaiser — et savoir quand demander de l’aide compte tout autant.',
      ar: 'القلق هو جرس إنذار الجسم. يمكن لإيقاع تنفّس بطيء أن يساعده على الهدوء، ومعرفة متى نطلب الدعم لا تقل أهمية.',
    },
    sections: [
      {
        heading: { en: 'Why the body reacts', fr: 'Pourquoi le corps réagit', ar: 'لماذا يتفاعل الجسم' },
        body: {
          en: 'When we feel threatened, the body prepares to act: the heart speeds up, breathing becomes short and the muscles tense. This reaction is normal and protective, even when the “danger” is a worry rather than a real threat.',
          fr: 'Face à une menace, le corps se prépare à agir : le cœur accélère, la respiration devient courte et les muscles se tendent. Cette réaction est normale et protectrice, même lorsque le « danger » est une inquiétude plutôt qu’une vraie menace.',
          ar: 'عندما نشعر بالتهديد يستعد الجسم للتصرف: يتسارع القلب ويقصر التنفس وتتوتر العضلات. هذا رد فعل طبيعي ووقائي، حتى عندما يكون «الخطر» قلقًا لا تهديدًا حقيقيًا.',
        },
      },
      {
        heading: { en: 'A simple rhythm', fr: 'Un rythme simple', ar: 'إيقاع بسيط' },
        body: {
          en: 'Breathe in gently for four counts, hold for four, then breathe out slowly for six. Repeat for about two minutes. A longer out-breath signals safety to the body. You can try it with the “Breathe with the light” exercise on our home page.',
          fr: 'Inspirez doucement sur quatre temps, retenez sur quatre, puis expirez lentement sur six. Répétez pendant environ deux minutes. Une expiration plus longue signale la sécurité au corps. Vous pouvez essayer avec l’exercice « Respirer avec la lumière » sur notre page d’accueil.',
          ar: 'استنشق بلطف لأربع عدّات، واحبس النفس لأربع، ثم ازفر ببطء لست. كرر ذلك لمدة دقيقتين تقريبًا. الزفير الأطول يرسل إلى الجسم إشارة أمان. يمكنك تجربته مع تمرين «تنفّس مع الضوء» في صفحتنا الرئيسية.',
        },
      },
      {
        heading: { en: 'When to ask for support', fr: 'Quand demander de l’aide', ar: 'متى تطلب الدعم' },
        body: {
          en: 'Breathing exercises are a support, not a treatment. If anxiety stays strong, returns often or affects sleep, work or relationships, talking with a qualified specialist can help. In an emergency, contact local emergency services.',
          fr: 'Les exercices de respiration sont un soutien, pas un traitement. Si l’anxiété reste forte, revient souvent ou touche le sommeil, le travail ou les relations, parler à un spécialiste qualifié peut aider. En cas d’urgence, contactez les services d’urgence locaux.',
          ar: 'تمارين التنفس وسيلة دعم وليست علاجًا. إذا بقي القلق قويًا أو تكرر كثيرًا أو أثّر في النوم أو العمل أو العلاقات، فقد يساعدك الحديث مع مختص مؤهل. في حالة الطوارئ اتصل بخدمات الطوارئ المحلية.',
        },
      },
    ],
  },
  {
    slug: 'small-rituals-with-teenagers',
    draft: true,
    date: '2026-11-19',
    minutes: 3,
    school: 'psychology',
    cover: '/media/people/parenting-article.webp',
    coverAlt: {
      en: 'A father and his teenage daughter laugh while cooking together',
      fr: 'Un père et sa fille adolescente rient en cuisinant ensemble',
      ar: 'أب وابنته المراهقة يضحكان وهما يطبخان معًا',
    },
    title: {
      en: 'Side by side: small rituals that open conversations with teenagers',
      fr: 'Côte à côte : de petits rituels qui ouvrent le dialogue avec les adolescents',
      ar: 'جنبًا إلى جنب: طقوس صغيرة تفتح الحوار مع المراهقين',
    },
    summary: {
      en: 'Many teenagers talk more easily while doing something together than face to face. A shared routine can become a safe space for conversation.',
      fr: 'Beaucoup d’adolescents parlent plus facilement en faisant quelque chose ensemble qu’en face à face. Une routine partagée peut devenir un espace sûr pour échanger.',
      ar: 'يتحدث كثير من المراهقين بسهولة أكبر أثناء القيام بشيء معًا مقارنة بالحديث وجهًا لوجه. يمكن لروتين مشترك أن يصبح مساحة آمنة للحوار.',
    },
    sections: [
      {
        heading: { en: 'Why “side by side” works', fr: 'Pourquoi le « côte à côte » fonctionne', ar: 'لماذا ينجح «جنبًا إلى جنب»' },
        body: {
          en: 'Cooking, walking or driving together lowers the pressure of eye contact. The activity gives a natural rhythm, and silences feel less heavy.',
          fr: 'Cuisiner, marcher ou conduire ensemble réduit la pression du regard. L’activité donne un rythme naturel et les silences paraissent moins lourds.',
          ar: 'الطبخ أو المشي أو القيادة معًا يخفف ضغط تبادل النظرات، فالنشاط يمنح إيقاعًا طبيعيًا ويجعل لحظات الصمت أخف.',
        },
      },
      {
        heading: { en: 'Listen first', fr: 'Écouter d’abord', ar: 'الإصغاء أولًا' },
        body: {
          en: 'Ask open questions, accept short answers and resist the urge to fix everything at once. Curiosity and calm show your teenager that it is safe to share.',
          fr: 'Posez des questions ouvertes, acceptez les réponses courtes et résistez à l’envie de tout régler tout de suite. La curiosité et le calme montrent à l’adolescent qu’il peut partager en sécurité.',
          ar: 'اطرح أسئلة مفتوحة، واقبل الإجابات القصيرة، وقاوم الرغبة في حل كل شيء دفعة واحدة. الفضول والهدوء يُظهران لابنك أن المشاركة آمنة.',
        },
      },
      {
        heading: { en: 'When to look for guidance', fr: 'Quand chercher un accompagnement', ar: 'متى تبحث عن توجيه' },
        body: {
          en: 'If communication stays very difficult or you notice lasting changes in mood, sleep or school, Luminol’s family guidance and parent sessions can help you find a next step.',
          fr: 'Si la communication reste très difficile ou si vous remarquez des changements durables d’humeur, de sommeil ou à l’école, l’accompagnement familial et les séances pour parents de Luminol peuvent vous aider à trouver la suite.',
          ar: 'إذا بقي التواصل صعبًا جدًا أو لاحظت تغيرات دائمة في المزاج أو النوم أو الدراسة، يمكن لتوجيه الأسرة ولقاءات الأولياء في لومينول أن تساعدك على إيجاد الخطوة التالية.',
        },
      },
    ],
  },
  {
    slug: 'what-an-attendance-certificate-means',
    draft: true,
    date: '2026-11-19',
    minutes: 2,
    school: 'training',
    cover: '/media/people/certificate-seal.webp',
    coverAlt: {
      en: 'A certificate with a gold seal and a fountain pen on a wooden desk',
      fr: 'Un certificat au sceau doré et un stylo plume sur un bureau en bois',
      ar: 'شهادة بختم ذهبي وقلم حبر على مكتب خشبي',
    },
    title: {
      en: 'What a Luminol attendance certificate means',
      fr: 'Ce que signifie une attestation de participation Luminol',
      ar: 'ماذا تعني شهادة الحضور من لومينول',
    },
    summary: {
      en: 'A clear answer to a frequent question: what the certificate confirms, what it does not, and how anyone can verify it.',
      fr: 'Une réponse claire à une question fréquente : ce que confirme l’attestation, ce qu’elle ne confirme pas, et comment la vérifier.',
      ar: 'إجابة واضحة عن سؤال متكرر: ماذا تؤكد الشهادة، وما الذي لا تؤكده، وكيف يمكن لأي شخص التحقق منها.',
    },
    sections: [
      {
        heading: { en: 'What it confirms', fr: 'Ce qu’elle confirme', ar: 'ماذا تؤكد' },
        body: {
          en: 'The attendance certificate confirms that you took part in a Luminol Academy programme. It is issued by Luminol Academy.',
          fr: 'L’attestation de participation confirme que vous avez suivi un programme de Luminol Academy. Elle est délivrée par Luminol Academy.',
          ar: 'تؤكد شهادة الحضور أنك شاركت في أحد برامج أكاديمية لومينول، وهي صادرة عن أكاديمية لومينول.',
        },
      },
      {
        heading: { en: 'What it does not confer', fr: 'Ce qu’elle ne confère pas', ar: 'ما الذي لا تمنحه' },
        body: {
          en: 'It does not confer academic accreditation or a licence to practise. It documents your learning and professional development.',
          fr: 'Elle ne confère ni accréditation académique ni autorisation d’exercer. Elle atteste de votre apprentissage et de votre développement professionnel.',
          ar: 'لا تمنح اعتمادًا أكاديميًا ولا ترخيصًا بالممارسة، بل توثّق تعلّمك وتطوّرك المهني.',
        },
      },
      {
        heading: { en: 'Verify a certificate', fr: 'Vérifier une attestation', ar: 'التحقق من شهادة' },
        body: {
          en: 'Each certificate carries a verification link on the Luminol website, so an employer or institution can confirm that it is genuine.',
          fr: 'Chaque attestation comporte un lien de vérification sur le site de Luminol, afin qu’un employeur ou un établissement puisse confirmer son authenticité.',
          ar: 'تحمل كل شهادة رابط تحقق على موقع لومينول، ليتمكن صاحب العمل أو المؤسسة من التأكد من صحتها.',
        },
      },
    ],
  },
];

export const journalCopy: Record<
  Locale,
  {
    title: string;
    description: string;
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    read: string;
    minutes: string;
    draft: string;
    back: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
    disclaimer: string;
  }
> = {
  en: {
    title: 'Luminol Journal',
    description: 'Short, practical reads on wellbeing, family, languages and professional growth from Luminol Academy.',
    eyebrow: 'Luminol Journal',
    heroTitle: 'Ideas to carry into everyday life.',
    heroBody: 'Short, practical reads on wellbeing, family, learning and growth — written to inform, never to replace a specialist.',
    read: 'Read',
    minutes: 'min read',
    draft: 'Draft for review',
    back: 'All articles',
    ctaTitle: 'Want to talk it through?',
    ctaBody: 'The Luminol team can help you find the right session, programme or consultation.',
    ctaButton: 'Write to Luminol',
    disclaimer: 'This article is general information, not individual advice or treatment. In an emergency, contact local emergency services.',
  },
  fr: {
    title: 'Journal Luminol',
    description: 'Des lectures courtes et pratiques sur le bien-être, la famille, les langues et l’évolution professionnelle.',
    eyebrow: 'Journal Luminol',
    heroTitle: 'Des idées à emporter au quotidien.',
    heroBody: 'Des lectures courtes et pratiques sur le bien-être, la famille, l’apprentissage et l’évolution — pour informer, jamais pour remplacer un spécialiste.',
    read: 'Lire',
    minutes: 'min de lecture',
    draft: 'Brouillon à valider',
    back: 'Tous les articles',
    ctaTitle: 'Envie d’en parler ?',
    ctaBody: 'L’équipe Luminol peut vous aider à trouver la bonne séance, le bon programme ou la bonne consultation.',
    ctaButton: 'Écrire à Luminol',
    disclaimer: 'Cet article est une information générale, pas un conseil individuel ni un traitement. En cas d’urgence, contactez les services d’urgence locaux.',
  },
  ar: {
    title: 'مجلة لومينول',
    description: 'قراءات قصيرة وعملية حول التوازن النفسي والأسرة واللغات والتطور المهني من أكاديمية لومينول.',
    eyebrow: 'مجلة لومينول',
    heroTitle: 'أفكار ترافقك في حياتك اليومية.',
    heroBody: 'قراءات قصيرة وعملية حول التوازن النفسي والأسرة والتعلّم والنمو، للتثقيف وليست بديلًا عن المختص.',
    read: 'اقرأ',
    minutes: 'دقائق قراءة',
    draft: 'مسودة للمراجعة',
    back: 'كل المقالات',
    ctaTitle: 'تريد أن تتحدث في الأمر؟',
    ctaBody: 'يمكن لفريق لومينول مساعدتك في إيجاد اللقاء أو البرنامج أو الاستشارة المناسبة.',
    ctaButton: 'اكتب إلى لومينول',
    disclaimer: 'هذا المقال معلومات عامة وليس نصيحة فردية أو علاجًا. في حالة الطوارئ اتصل بخدمات الطوارئ المحلية.',
  },
};
