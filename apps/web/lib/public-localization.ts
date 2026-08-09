import type { Locale } from '@luminol/localization';

type PublicCopy = {
  site: {
    description: string;
    nav: {
      schools: string;
      programmes: string;
      approach: string;
      about: string;
      contact: string;
      homeAria: string;
      primaryAria: string;
    };
    footerDisciplines: string;
  };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroAccent: string;
    heroLede: string;
    exploreSchools: string;
    discoverLuminol: string;
    strengthsAria: string;
    connectedSchools: string;
    humanJourney: string;
    multilingualFoundation: string;
    mind: string;
    understand: string;
    voice: string;
    connect: string;
    work: string;
    advance: string;
    schoolsEyebrow: string;
    schoolsTitle: string;
    schoolsIntro: string;
    discoverSchool: string;
    focusAreas: string;
    approachEyebrow: string;
    approachTitle: string;
    approachIntro: string;
    principles: readonly { number: string; title: string; text: string }[];
    aboutEyebrow: string;
    aboutTitle: string;
    aboutLede: string;
    aboutBody: string;
    values: readonly string[];
    aboutVisual: string;
    pathwayEyebrow: string;
    pathwayTitle: string;
    pathwayPsychology: string;
    pathwayLanguages: string;
    pathwayTraining: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaBody: string;
    startConversation: string;
  };
  about: {
    title: string;
    description: string;
    heroEyebrow: string;
    heroTitle: string;
    heroBody: string;
    visualCaption: string;
    originEyebrow: string;
    originTitle: string;
    originLede: string;
    originBodyOne: string;
    originBodyTwo: string;
    missionLabel: string;
    missionTitle: string;
    missionBody: string;
    visionLabel: string;
    visionTitle: string;
    visionBody: string;
    valuesEyebrow: string;
    valuesTitle: string;
    valuesBody: string;
    values: readonly { number: string; title: string; description: string }[];
    oneJourney: string;
    psychologyName: string;
    psychologyTagline: string;
    languagesName: string;
    languagesTagline: string;
    trainingName: string;
    trainingTagline: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaBody: string;
    ctaAction: string;
  };
  contact: {
    title: string;
    description: string;
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    exploreEyebrow: string;
    pathDescriptions: {
      psychology: string;
      languages: string;
      training: string;
    };
    nextEyebrow: string;
    nextTitle: string;
    steps: readonly string[];
    privacyNote: string;
  };
  programmes: {
    title: string;
    description: string;
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    searchLabel: string;
    searchPlaceholder: string;
    schoolLabel: string;
    allSchools: string;
    languageLabel: string;
    allLanguages: string;
    apply: string;
    clear: string;
    unavailableTitle: string;
    unavailableBody: string;
    exploreSchools: string;
    emptyTitle: string;
    emptyBody: string;
    reset: string;
    published: string;
    programmeSingular: string;
    programmePlural: string;
    featured: string;
    detailsAria: string;
    viewSchool: string;
    askLuminol: string;
    languageNames: { ar: string; fr: string; en: string };
  };
  schoolPage: {
    schoolsLabel: string;
    explorePrograms: string;
    startJourney: string;
    promiseLabel: string;
    programsEyebrow: string;
    programsTitle: string;
    programsBody: string;
    askProgram: string;
    journeyEyebrow: string;
    journeyTitle: string;
    audienceEyebrow: string;
    audienceTitle: string;
    noteAria: string;
    important: string;
    relatedEyebrow: string;
    relatedTitle: string;
    relatedBody: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaBody: string;
  };
  form: {
    sending: string;
    success: string;
    error: string;
    eyebrow: string;
    title: string;
    intro: string;
    fullName: string;
    email: string;
    phone: string;
    optional: string;
    interest: string;
    choose: string;
    psychology: string;
    languages: string;
    training: string;
    message: string;
    consent: string;
    submit: string;
  };
  certificate: {
    title: string;
    description: string;
    eyebrow: string;
    verifiedTitle: string;
    revokedTitle: string;
    registryBody: string;
    validCredential: string;
    revokedCredential: string;
    certifies: string;
    completed: string;
    issued: string;
    status: string;
    verified: string;
    revoked: string;
    serial: string;
    revokedNotice: string;
    privacyTitle: string;
    privacyBody: string;
  };
};

export const PUBLIC_COPY = {
  en: {
    site: {
      description:
        'Grow mentally, linguistically and professionally with Luminol Academy—one human-centered ecosystem for psychology, languages and professional training.',
      nav: {
        schools: 'Our schools',
        programmes: 'Programmes',
        approach: 'Our approach',
        about: 'About Luminol',
        contact: 'Start your journey',
        homeAria: 'Luminol home',
        primaryAria: 'Primary navigation',
      },
      footerDisciplines: 'Psychology · Languages · Professional Training',
    },
    home: {
      heroEyebrow: 'Psychology · Languages · Professional growth',
      heroTitle: 'Grow with clarity.',
      heroAccent: 'Learn with purpose.',
      heroLede:
        'Luminol brings mental wellbeing, language learning and professional development together in one thoughtful human ecosystem.',
      exploreSchools: 'Explore our schools',
      discoverLuminol: 'Discover Luminol',
      strengthsAria: 'Luminol platform strengths',
      connectedSchools: 'Connected schools',
      humanJourney: 'Human journey',
      multilingualFoundation: 'Trilingual foundation',
      mind: 'Mind',
      understand: 'Understand',
      voice: 'Voice',
      connect: 'Connect',
      work: 'Work',
      advance: 'Advance',
      schoolsEyebrow: 'Three schools · One vision',
      schoolsTitle: 'Growth is never only one thing.',
      schoolsIntro:
        'People thrive when emotional wellbeing, communication and professional capability develop together. Luminol connects all three without losing the depth of each discipline.',
      discoverSchool: 'Discover this school',
      focusAreas: 'focus areas',
      approachEyebrow: 'The Luminol approach',
      approachTitle: 'Knowledge becomes powerful when it changes how you live.',
      approachIntro:
        'We connect scientific thinking with warmth, structure and real-world practice—so learning feels personal and progress becomes sustainable.',
      principles: [
        {
          number: '01',
          title: 'Human before process',
          text: 'Every learning journey starts with the person: their goals, context and potential.',
        },
        {
          number: '02',
          title: 'Depth with clarity',
          text: 'We make serious knowledge understandable, practical and useful in everyday life.',
        },
        {
          number: '03',
          title: 'Progress you can feel',
          text: 'Programs are designed around meaningful outcomes, not passive participation.',
        },
      ],
      aboutEyebrow: 'Why Luminol exists',
      aboutTitle: 'A brighter way to develop human potential.',
      aboutLede:
        'Luminol was created from a simple belief: meaningful education should strengthen the whole person.',
      aboutBody:
        'Our ecosystem brings together expert guidance, purposeful learning and practical development. The experience is premium without becoming distant, scientific without losing warmth, and ambitious while remaining accessible.',
      values: ['Trustworthy', 'Empowering', 'Future-oriented'],
      aboutVisual: 'Intellectual · Modern · Human',
      pathwayEyebrow: 'Your next chapter',
      pathwayTitle: 'Begin with the growth that matters now.',
      pathwayPsychology: 'Strengthen your wellbeing',
      pathwayLanguages: 'Find your confident voice',
      pathwayTraining: 'Advance your professional path',
      ctaEyebrow: 'Start your Luminol journey',
      ctaTitle: 'Ready to grow with purpose?',
      ctaBody:
        'Tell us where you want to go. We will help you find the right program and next step.',
      startConversation: 'Start a conversation',
    },
    about: {
      title: 'About Luminol',
      description:
        'Discover the founder-led vision, philosophy and human-development mission behind Luminol Academy.',
      heroEyebrow: 'About Luminol',
      heroTitle: 'Human potential deserves a brighter kind of education.',
      heroBody:
        'Luminol is a founder-led ecosystem for mental wellbeing, language learning and professional development—built around the whole person, not only one skill.',
      visualCaption: 'Knowledge · Humanity · Progress',
      originEyebrow: 'The founding idea',
      originTitle: 'Growth becomes transformative when knowledge connects.',
      originLede:
        'Luminol began with a simple observation: emotional strength, communication and professional capability constantly shape one another.',
      originBodyOne:
        'Traditional learning often separates these needs. Luminol brings them into one coherent experience while protecting the depth and standards of every discipline.',
      originBodyTwo:
        'The result is an academy designed to be intellectually serious, emotionally intelligent and practical enough to create meaningful change in everyday life.',
      missionLabel: 'Mission',
      missionTitle: 'Make meaningful human development clear and accessible.',
      missionBody:
        'Provide thoughtful guidance and high-quality learning that helps people understand themselves, communicate confidently and develop the capabilities to move forward.',
      visionLabel: 'Vision',
      visionTitle: 'Build a connected platform for lifelong growth.',
      visionBody:
        'Create a trusted ecosystem where individuals, families, professionals and organizations can learn, develop and measure progress across every important stage.',
      valuesEyebrow: 'What guides Luminol',
      valuesTitle: 'Premium standards. Human experience.',
      valuesBody:
        'These principles shape the platform, programs, content and every interaction with the Luminol community.',
      values: [
        {
          number: '01',
          title: 'Intellectual depth',
          description:
            'We respect serious knowledge and translate it with clarity, integrity and care.',
        },
        {
          number: '02',
          title: 'Human warmth',
          description:
            'Premium experiences should still feel personal, supportive and genuinely accessible.',
        },
        {
          number: '03',
          title: 'Purposeful progress',
          description:
            'Learning matters when it strengthens choices, communication, wellbeing and work.',
        },
        {
          number: '04',
          title: 'Connected growth',
          description:
            'People do not develop in separate boxes, so Luminol connects the capabilities that shape a life.',
        },
      ],
      oneJourney: 'One human journey',
      psychologyName: 'Psychology',
      psychologyTagline: 'Understand and strengthen.',
      languagesName: 'Languages',
      languagesTagline: 'Learn and connect.',
      trainingName: 'Training',
      trainingTagline: 'Develop and advance.',
      ctaEyebrow: 'Find your place at Luminol',
      ctaTitle: 'Which kind of growth matters most today?',
      ctaBody:
        'Explore the three schools or tell the team what you want to achieve.',
      ctaAction: 'Start a conversation',
    },
    contact: {
      title: 'Contact',
      description:
        'Tell Luminol about your psychology, language-learning or professional-development goals and find the right next step.',
      eyebrow: 'Contact Luminol',
      heroTitle: 'Your next step starts with a conversation.',
      heroBody:
        'Whether you already know what you need or want help choosing, share your goal and Luminol will guide you toward the right school and program.',
      exploreEyebrow: 'Explore before you enquire',
      pathDescriptions: {
        psychology: 'Wellbeing, family guidance, coaching and workshops.',
        languages: 'English, French, fluency and communication pathways.',
        training: 'Leadership, workplace skills and corporate learning.',
      },
      nextEyebrow: 'A thoughtful first step',
      nextTitle: 'What happens next?',
      steps: [
        'Your enquiry is securely recorded.',
        'The team reviews your goal and area of interest.',
        'Luminol follows up with the most suitable next step.',
      ],
      privacyNote:
        'Please do not include highly sensitive medical, financial or identity information in this form.',
    },
    programmes: {
      title: 'Programmes',
      description:
        'Explore published Luminol Academy programmes by school, language and learning goal.',
      eyebrow: 'Search & discovery',
      heroTitle: 'Find the Luminol programme that fits your next step.',
      heroBody:
        'Search the currently published programme catalogue, then narrow it by school or delivery language. Every filter stays in the URL so the result can be bookmarked or shared.',
      searchLabel: 'Search programmes',
      searchPlaceholder: 'Try leadership, English or stress',
      schoolLabel: 'School',
      allSchools: 'All schools',
      languageLabel: 'Delivery language',
      allLanguages: 'All languages',
      apply: 'Apply filters',
      clear: 'Clear',
      unavailableTitle: 'Programme discovery is temporarily unavailable.',
      unavailableBody:
        'The public catalogue could not be verified from the governed CMS source. You can still explore each Luminol school or contact the academy for current programme information.',
      exploreSchools: 'Explore the three schools',
      emptyTitle: 'No published programmes match these filters.',
      emptyBody: 'Try a broader topic, another school or a different language.',
      reset: 'Reset discovery',
      published: 'Published programmes',
      programmeSingular: 'programme',
      programmePlural: 'programmes',
      featured: 'Featured',
      detailsAria: 'Programme details',
      viewSchool: 'View school',
      askLuminol: 'Ask Luminol',
      languageNames: { ar: 'Arabic', fr: 'French', en: 'English' },
    },
    schoolPage: {
      schoolsLabel: 'Luminol schools',
      explorePrograms: 'Explore programs',
      startJourney: 'Start your journey',
      promiseLabel: 'Our promise',
      programsEyebrow: 'Programs and support',
      programsTitle: 'Choose the pathway that fits your next step.',
      programsBody:
        'Each program is shaped around a clear purpose, thoughtful progression and an experience that respects the person behind the goal.',
      askProgram: 'Ask about this program',
      journeyEyebrow: 'How the journey works',
      journeyTitle: 'A clear path from intention to meaningful progress.',
      audienceEyebrow: 'Designed around people',
      audienceTitle: 'Who this school supports',
      noteAria: 'Program note',
      important: 'Important',
      relatedEyebrow: 'Continue exploring Luminol',
      relatedTitle: 'Growth connects across every school.',
      relatedBody:
        'Explore another dimension of your personal, linguistic or professional development.',
      ctaEyebrow: 'Your next step',
      ctaTitle: "Let's find the right path forward.",
      ctaBody:
        'Begin with your goal. Luminol will help you identify the program and learning experience that fits.',
    },
    form: {
      sending: 'Sending your enquiry…',
      success:
        'Thank you. Your enquiry is safely with Luminol, and the team will review it.',
      error: 'Unable to submit the enquiry. Please try again.',
      eyebrow: 'Tell us about your goal',
      title: 'Start your Luminol journey.',
      intro:
        'Share what you are looking for. The Luminol team will use these details only to understand and respond to your enquiry.',
      fullName: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      optional: 'Optional',
      interest: 'Area of interest',
      choose: 'Help me choose',
      psychology: 'Psychology',
      languages: 'Languages',
      training: 'Professional Training',
      message: 'How can Luminol help?',
      consent:
        'I agree that Luminol may store and use these details to respond to my enquiry.',
      submit: 'Send my enquiry',
    },
    certificate: {
      title: 'Certificate verification',
      description: 'Verify a Luminol Academy learning certificate.',
      eyebrow: 'Credential verification',
      verifiedTitle: 'Certificate verified.',
      revokedTitle: 'Certificate revoked.',
      registryBody:
        "This record comes directly from Luminol Academy's secure certificate registry.",
      validCredential: 'Valid credential',
      revokedCredential: 'Revoked credential',
      certifies: 'This certifies that',
      completed: 'completed the Luminol programme',
      issued: 'Issued',
      status: 'Status',
      verified: 'Verified',
      revoked: 'Revoked',
      serial: 'Serial number',
      revokedNotice:
        'This credential is no longer valid. Contact Luminol Academy for further information.',
      privacyTitle: 'Privacy-controlled verification',
      privacyBody:
        'This page is available because the certificate holder chose to make this credential public. It is excluded from search indexing.',
    },
  },
  fr: {
    site: {
      description:
        'Développez-vous mentalement, linguistiquement et professionnellement avec Luminol Academy, un écosystème humain réunissant psychologie, langues et formation professionnelle.',
      nav: {
        schools: 'Nos écoles',
        programmes: 'Programmes',
        approach: 'Notre approche',
        about: 'À propos',
        contact: 'Commencer',
        homeAria: 'Accueil Luminol',
        primaryAria: 'Navigation principale',
      },
      footerDisciplines: 'Psychologie · Langues · Formation professionnelle',
    },
    home: {
      heroEyebrow: 'Psychologie · Langues · Évolution professionnelle',
      heroTitle: 'Grandissez avec clarté.',
      heroAccent: 'Apprenez avec intention.',
      heroLede:
        'Luminol réunit bien-être psychologique, apprentissage des langues et développement professionnel dans un même écosystème humain et cohérent.',
      exploreSchools: 'Découvrir nos écoles',
      discoverLuminol: 'Découvrir Luminol',
      strengthsAria: 'Forces de la plateforme Luminol',
      connectedSchools: 'Écoles complémentaires',
      humanJourney: 'Parcours humain',
      multilingualFoundation: 'Fondation trilingue',
      mind: 'Esprit',
      understand: 'Comprendre',
      voice: 'Voix',
      connect: 'Communiquer',
      work: 'Carrière',
      advance: 'Progresser',
      schoolsEyebrow: 'Trois écoles · Une vision',
      schoolsTitle: 'Grandir ne se résume jamais à une seule dimension.',
      schoolsIntro:
        'Nous avançons mieux lorsque le bien-être émotionnel, la communication et les compétences professionnelles progressent ensemble. Luminol relie ces trois dimensions sans réduire la profondeur de chacune.',
      discoverSchool: 'Découvrir cette école',
      focusAreas: 'domaines prioritaires',
      approachEyebrow: "L'approche Luminol",
      approachTitle:
        'Le savoir devient puissant lorsqu’il transforme le quotidien.',
      approachIntro:
        'Nous associons rigueur, chaleur humaine, structure et mise en pratique afin que l’apprentissage reste personnel et que les progrès durent.',
      principles: [
        {
          number: '01',
          title: 'La personne avant le processus',
          text: 'Chaque parcours commence par la personne, ses objectifs, son contexte et son potentiel.',
        },
        {
          number: '02',
          title: 'La profondeur avec clarté',
          text: 'Nous rendons les connaissances exigeantes compréhensibles, pratiques et utiles au quotidien.',
        },
        {
          number: '03',
          title: 'Des progrès qui se ressentent',
          text: 'Nos programmes visent des résultats significatifs, pas une participation passive.',
        },
      ],
      aboutEyebrow: 'Pourquoi Luminol existe',
      aboutTitle:
        'Une manière plus lumineuse de développer le potentiel humain.',
      aboutLede:
        'Luminol est née d’une conviction simple : une éducation utile doit renforcer la personne dans sa globalité.',
      aboutBody:
        'Notre écosystème réunit accompagnement expert, apprentissage intentionnel et développement pratique. L’expérience est premium sans être distante, rigoureuse sans perdre sa chaleur et ambitieuse tout en restant accessible.',
      values: ['Fiable', 'Émancipateur', 'Tourné vers l’avenir'],
      aboutVisual: 'Intellectuel · Moderne · Humain',
      pathwayEyebrow: 'Votre prochain chapitre',
      pathwayTitle: 'Commencez par l’évolution qui compte maintenant.',
      pathwayPsychology: 'Renforcer votre bien-être',
      pathwayLanguages: 'Trouver une voix confiante',
      pathwayTraining: 'Faire avancer votre parcours professionnel',
      ctaEyebrow: 'Commencez votre parcours Luminol',
      ctaTitle: 'Prêt à progresser avec intention ?',
      ctaBody:
        'Dites-nous où vous souhaitez aller. Nous vous aiderons à trouver le programme et la prochaine étape adaptés.',
      startConversation: 'Commencer une conversation',
    },
    about: {
      title: 'À propos de Luminol',
      description:
        'Découvrez la vision fondatrice, la philosophie et la mission de développement humain de Luminol Academy.',
      heroEyebrow: 'À propos de Luminol',
      heroTitle: 'Le potentiel humain mérite une éducation plus lumineuse.',
      heroBody:
        'Luminol est un écosystème porté par sa fondatrice, dédié au bien-être psychologique, aux langues et au développement professionnel, construit autour de la personne dans sa globalité.',
      visualCaption: 'Savoir · Humanité · Progrès',
      originEyebrow: 'L’idée fondatrice',
      originTitle:
        'La croissance devient transformatrice lorsque les savoirs se relient.',
      originLede:
        'Luminol est partie d’un constat simple : équilibre émotionnel, communication et capacité professionnelle s’influencent constamment.',
      originBodyOne:
        'L’apprentissage traditionnel sépare souvent ces besoins. Luminol les réunit dans une expérience cohérente tout en préservant la profondeur et les standards de chaque discipline.',
      originBodyTwo:
        'Le résultat est une académie exigeante sur le plan intellectuel, attentive sur le plan humain et suffisamment pratique pour produire des changements réels au quotidien.',
      missionLabel: 'Mission',
      missionTitle:
        'Rendre le développement humain utile, clair et accessible.',
      missionBody:
        'Proposer un accompagnement réfléchi et des apprentissages de qualité pour mieux se comprendre, communiquer avec confiance et développer les capacités nécessaires pour avancer.',
      visionLabel: 'Vision',
      visionTitle:
        'Construire une plateforme connectée pour apprendre toute la vie.',
      visionBody:
        'Créer un écosystème de confiance où individus, familles, professionnels et organisations peuvent apprendre, évoluer et mesurer leurs progrès à chaque étape importante.',
      valuesEyebrow: 'Ce qui guide Luminol',
      valuesTitle: 'Des standards premium. Une expérience humaine.',
      valuesBody:
        'Ces principes façonnent la plateforme, les programmes, les contenus et chaque interaction avec la communauté Luminol.',
      values: [
        {
          number: '01',
          title: 'Profondeur intellectuelle',
          description:
            'Nous respectons les savoirs exigeants et les transmettons avec clarté, intégrité et attention.',
        },
        {
          number: '02',
          title: 'Chaleur humaine',
          description:
            'Une expérience premium doit rester personnelle, soutenante et réellement accessible.',
        },
        {
          number: '03',
          title: 'Progrès intentionnel',
          description:
            'L’apprentissage compte lorsqu’il renforce les choix, la communication, le bien-être et le travail.',
        },
        {
          number: '04',
          title: 'Croissance connectée',
          description:
            'Nous ne nous développons pas en silos : Luminol relie les capacités qui façonnent une vie.',
        },
      ],
      oneJourney: 'Un seul parcours humain',
      psychologyName: 'Psychologie',
      psychologyTagline: 'Comprendre et renforcer.',
      languagesName: 'Langues',
      languagesTagline: 'Apprendre et communiquer.',
      trainingName: 'Formation',
      trainingTagline: 'Développer et avancer.',
      ctaEyebrow: 'Trouvez votre place chez Luminol',
      ctaTitle: 'Quelle évolution compte le plus pour vous aujourd’hui ?',
      ctaBody:
        'Explorez les trois écoles ou partagez avec notre équipe ce que vous souhaitez accomplir.',
      ctaAction: 'Commencer une conversation',
    },
    contact: {
      title: 'Contact',
      description:
        'Parlez à Luminol de vos objectifs en psychologie, langues ou développement professionnel et trouvez la prochaine étape adaptée.',
      eyebrow: 'Contacter Luminol',
      heroTitle: 'Votre prochaine étape commence par une conversation.',
      heroBody:
        'Que vous sachiez déjà ce dont vous avez besoin ou que vous souhaitiez être guidé, partagez votre objectif et Luminol vous orientera vers la bonne école et le bon programme.',
      exploreEyebrow: 'Explorer avant de nous écrire',
      pathDescriptions: {
        psychology: 'Bien-être, accompagnement familial, coaching et ateliers.',
        languages:
          'Anglais, français, aisance orale et parcours de communication.',
        training:
          'Leadership, compétences professionnelles et formation en entreprise.',
      },
      nextEyebrow: 'Une première étape réfléchie',
      nextTitle: 'Que se passe-t-il ensuite ?',
      steps: [
        'Votre demande est enregistrée de manière sécurisée.',
        'L’équipe étudie votre objectif et votre domaine d’intérêt.',
        'Luminol revient vers vous avec la prochaine étape la plus adaptée.',
      ],
      privacyNote:
        'Merci de ne pas inclure dans ce formulaire d’informations médicales, financières ou d’identité hautement sensibles.',
    },
    programmes: {
      title: 'Programmes',
      description:
        'Explorez les programmes publiés de Luminol Academy par école, langue et objectif d’apprentissage.',
      eyebrow: 'Recherche & découverte',
      heroTitle: 'Trouvez le programme Luminol adapté à votre prochaine étape.',
      heroBody:
        'Recherchez dans le catalogue publié puis affinez par école ou langue d’enseignement. Chaque filtre reste dans l’URL afin que le résultat puisse être enregistré ou partagé.',
      searchLabel: 'Rechercher un programme',
      searchPlaceholder: 'Ex. leadership, anglais ou stress',
      schoolLabel: 'École',
      allSchools: 'Toutes les écoles',
      languageLabel: 'Langue d’enseignement',
      allLanguages: 'Toutes les langues',
      apply: 'Appliquer les filtres',
      clear: 'Effacer',
      unavailableTitle:
        'La découverte des programmes est momentanément indisponible.',
      unavailableBody:
        'Le catalogue public n’a pas pu être vérifié depuis la source CMS gouvernée. Vous pouvez toujours explorer chaque école Luminol ou contacter l’académie pour connaître les programmes actuels.',
      exploreSchools: 'Explorer les trois écoles',
      emptyTitle: 'Aucun programme publié ne correspond à ces filtres.',
      emptyBody:
        'Essayez un sujet plus large, une autre école ou une autre langue.',
      reset: 'Réinitialiser la recherche',
      published: 'Programmes publiés',
      programmeSingular: 'programme',
      programmePlural: 'programmes',
      featured: 'À la une',
      detailsAria: 'Détails du programme',
      viewSchool: 'Voir l’école',
      askLuminol: 'Demander à Luminol',
      languageNames: { ar: 'Arabe', fr: 'Français', en: 'Anglais' },
    },
    schoolPage: {
      schoolsLabel: 'Écoles Luminol',
      explorePrograms: 'Explorer les programmes',
      startJourney: 'Commencer votre parcours',
      promiseLabel: 'Notre promesse',
      programsEyebrow: 'Programmes et accompagnement',
      programsTitle: 'Choisissez le parcours adapté à votre prochaine étape.',
      programsBody:
        'Chaque programme répond à un objectif clair, suit une progression réfléchie et respecte la personne derrière l’objectif.',
      askProgram: 'Se renseigner sur ce programme',
      journeyEyebrow: 'Comment le parcours fonctionne',
      journeyTitle: 'Un chemin clair de l’intention vers un progrès concret.',
      audienceEyebrow: 'Conçu autour des personnes',
      audienceTitle: 'À qui cette école s’adresse',
      noteAria: 'Note sur le programme',
      important: 'Important',
      relatedEyebrow: 'Continuez à explorer Luminol',
      relatedTitle: 'La croissance relie toutes nos écoles.',
      relatedBody:
        'Explorez une autre dimension de votre développement personnel, linguistique ou professionnel.',
      ctaEyebrow: 'Votre prochaine étape',
      ctaTitle: 'Trouvons ensemble la bonne voie.',
      ctaBody:
        'Commencez par votre objectif. Luminol vous aidera à identifier le programme et l’expérience d’apprentissage adaptés.',
    },
    form: {
      sending: 'Envoi de votre demande…',
      success:
        'Merci. Votre demande a bien été transmise à Luminol et notre équipe va l’examiner.',
      error: 'Impossible d’envoyer votre demande. Veuillez réessayer.',
      eyebrow: 'Parlez-nous de votre objectif',
      title: 'Commencez votre parcours Luminol.',
      intro:
        'Expliquez-nous ce que vous recherchez. L’équipe Luminol utilisera ces informations uniquement pour comprendre votre demande et vous répondre.',
      fullName: 'Nom complet',
      email: 'Adresse e-mail',
      phone: 'Numéro de téléphone',
      optional: 'Facultatif',
      interest: 'Domaine d’intérêt',
      choose: 'Aidez-moi à choisir',
      psychology: 'Psychologie',
      languages: 'Langues',
      training: 'Formation professionnelle',
      message: 'Comment Luminol peut-elle vous aider ?',
      consent:
        'J’accepte que Luminol conserve et utilise ces informations pour répondre à ma demande.',
      submit: 'Envoyer ma demande',
    },
    certificate: {
      title: 'Vérification du certificat',
      description: 'Vérifiez un certificat de formation Luminol Academy.',
      eyebrow: 'Vérification du titre',
      verifiedTitle: 'Certificat vérifié.',
      revokedTitle: 'Certificat révoqué.',
      registryBody:
        'Cet enregistrement provient directement du registre sécurisé des certificats de Luminol Academy.',
      validCredential: 'Titre valide',
      revokedCredential: 'Titre révoqué',
      certifies: 'Ceci certifie que',
      completed: 'a terminé le programme Luminol',
      issued: 'Délivré le',
      status: 'Statut',
      verified: 'Vérifié',
      revoked: 'Révoqué',
      serial: 'Numéro de série',
      revokedNotice:
        'Ce titre n’est plus valide. Contactez Luminol Academy pour plus d’informations.',
      privacyTitle: 'Vérification respectueuse de la confidentialité',
      privacyBody:
        'Cette page est disponible parce que le titulaire du certificat a choisi de rendre ce titre public. Elle est exclue de l’indexation des moteurs de recherche.',
    },
  },
  ar: {
    site: {
      description:
        'نمِّ قدراتك النفسية واللغوية والمهنية مع أكاديمية لومينول، ضمن منظومة إنسانية واحدة تجمع علم النفس واللغات والتكوين المهني.',
      nav: {
        schools: 'مدارسنا',
        programmes: 'البرامج',
        approach: 'منهجنا',
        about: 'عن لومينول',
        contact: 'ابدأ رحلتك',
        homeAria: 'الصفحة الرئيسية للومينول',
        primaryAria: 'التنقل الرئيسي',
      },
      footerDisciplines: 'علم النفس · اللغات · التكوين المهني',
    },
    home: {
      heroEyebrow: 'علم النفس · اللغات · التطور المهني',
      heroTitle: 'تقدّم بوضوح.',
      heroAccent: 'وتعلّم بهدف.',
      heroLede:
        'تجمع لومينول بين التوازن النفسي وتعلّم اللغات والتطور المهني في منظومة إنسانية واحدة متكاملة ومدروسة.',
      exploreSchools: 'اكتشف مدارسنا',
      discoverLuminol: 'اكتشف لومينول',
      strengthsAria: 'نقاط قوة منصة لومينول',
      connectedSchools: 'مدارس مترابطة',
      humanJourney: 'رحلة إنسانية',
      multilingualFoundation: 'أساس بثلاث لغات',
      mind: 'العقل',
      understand: 'افهم',
      voice: 'الصوت',
      connect: 'تواصل',
      work: 'المسار',
      advance: 'تقدّم',
      schoolsEyebrow: 'ثلاث مدارس · رؤية واحدة',
      schoolsTitle: 'النمو الحقيقي لا يقتصر على جانب واحد.',
      schoolsIntro:
        'يزدهر الإنسان عندما يتطور توازنه النفسي وتواصله وقدراته المهنية معًا. تربط لومينول هذه الأبعاد الثلاثة مع الحفاظ على عمق كل تخصص.',
      discoverSchool: 'اكتشف هذه المدرسة',
      focusAreas: 'مجالات التركيز',
      approachEyebrow: 'منهج لومينول',
      approachTitle: 'تصبح المعرفة قوية عندما تغيّر طريقة عيشنا.',
      approachIntro:
        'نربط التفكير العلمي بالدفء الإنساني والهيكلة والتطبيق الواقعي، حتى يكون التعلّم شخصيًا ويصبح التقدم قابلًا للاستمرار.',
      principles: [
        {
          number: '01',
          title: 'الإنسان قبل الإجراء',
          text: 'تبدأ كل رحلة تعلم من الشخص نفسه: أهدافه وسياقه وإمكاناته.',
        },
        {
          number: '02',
          title: 'عمق بوضوح',
          text: 'نحوّل المعرفة الجادة إلى فهم واضح وتطبيق عملي وفائدة في الحياة اليومية.',
        },
        {
          number: '03',
          title: 'تقدّم يمكن ملاحظته',
          text: 'تُبنى برامجنا حول نتائج ذات معنى، لا حول المشاركة السلبية.',
        },
      ],
      aboutEyebrow: 'لماذا وُجدت لومينول',
      aboutTitle: 'طريقة أكثر إشراقًا لتنمية الإمكانات البشرية.',
      aboutLede:
        'نشأت لومينول من قناعة بسيطة: التعليم ذو المعنى يجب أن يقوّي الإنسان ككل.',
      aboutBody:
        'تجمع منظومتنا بين التوجيه المتخصص والتعلّم الهادف والتطوير العملي. تجربة راقية من دون جفاء، علمية من دون فقدان الدفء، وطموحة مع بقائها في المتناول.',
      values: ['موثوقة', 'مُمكِّنة', 'موجّهة نحو المستقبل'],
      aboutVisual: 'فكر · حداثة · إنسانية',
      pathwayEyebrow: 'فصلك القادم',
      pathwayTitle: 'ابدأ بالنمو الذي يهمك الآن.',
      pathwayPsychology: 'عزّز توازنك النفسي',
      pathwayLanguages: 'ابنِ صوتًا واثقًا',
      pathwayTraining: 'طوّر مسارك المهني',
      ctaEyebrow: 'ابدأ رحلتك مع لومينول',
      ctaTitle: 'هل أنت مستعد للتطور بهدف؟',
      ctaBody:
        'أخبرنا إلى أين تريد الوصول، وسنساعدك على إيجاد البرنامج والخطوة التالية الأنسب.',
      startConversation: 'ابدأ محادثة',
    },
    about: {
      title: 'عن لومينول',
      description:
        'اكتشف رؤية لومينول المؤسسة وفلسفتها ورسالتها في تطوير الإنسان.',
      heroEyebrow: 'عن لومينول',
      heroTitle: 'الإمكانات البشرية تستحق تعليمًا أكثر إشراقًا.',
      heroBody:
        'لومينول منظومة تقودها رؤيتها المؤسسة، تجمع التوازن النفسي وتعلّم اللغات والتطور المهني، وتبني التجربة حول الإنسان ككل لا حول مهارة واحدة فقط.',
      visualCaption: 'معرفة · إنسانية · تقدّم',
      originEyebrow: 'الفكرة المؤسسة',
      originTitle: 'يصبح النمو تحوليًا عندما تترابط المعارف.',
      originLede:
        'بدأت لومينول من ملاحظة بسيطة: القوة النفسية والتواصل والقدرة المهنية تؤثر في بعضها باستمرار.',
      originBodyOne:
        'يفصل التعليم التقليدي غالبًا بين هذه الاحتياجات. تجمعها لومينول في تجربة متناسقة مع حماية عمق ومعايير كل تخصص.',
      originBodyTwo:
        'والنتيجة أكاديمية جادة فكريًا، واعية إنسانيًا، وعملية بما يكفي لصناعة تغيير ملموس في الحياة اليومية.',
      missionLabel: 'الرسالة',
      missionTitle: 'جعل التنمية الإنسانية ذات المعنى واضحة ومتاحة.',
      missionBody:
        'تقديم توجيه مدروس وتعلّم عالي الجودة يساعد الناس على فهم أنفسهم والتواصل بثقة وبناء القدرات اللازمة للتقدم.',
      visionLabel: 'الرؤية',
      visionTitle: 'بناء منصة مترابطة للنمو مدى الحياة.',
      visionBody:
        'إنشاء منظومة موثوقة يستطيع فيها الأفراد والعائلات والمهنيون والمؤسسات التعلم والتطور وقياس التقدم عبر المراحل المهمة.',
      valuesEyebrow: 'ما الذي يوجّه لومينول',
      valuesTitle: 'معايير راقية. تجربة إنسانية.',
      valuesBody:
        'تشكّل هذه المبادئ المنصة والبرامج والمحتوى وكل تفاعل مع مجتمع لومينول.',
      values: [
        {
          number: '01',
          title: 'عمق فكري',
          description: 'نحترم المعرفة الجادة وننقلها بوضوح ونزاهة وعناية.',
        },
        {
          number: '02',
          title: 'دفء إنساني',
          description: 'يجب أن تبقى التجربة الراقية شخصية وداعمة ومتاحة فعلًا.',
        },
        {
          number: '03',
          title: 'تقدّم هادف',
          description:
            'يصبح التعلّم مهمًا عندما يقوّي الاختيارات والتواصل والتوازن والعمل.',
        },
        {
          number: '04',
          title: 'نمو مترابط',
          description:
            'لا يتطور الإنسان داخل صناديق منفصلة، لذلك تربط لومينول القدرات التي تشكّل حياته.',
        },
      ],
      oneJourney: 'رحلة إنسانية واحدة',
      psychologyName: 'علم النفس',
      psychologyTagline: 'افهم وعزّز.',
      languagesName: 'اللغات',
      languagesTagline: 'تعلّم وتواصل.',
      trainingName: 'التكوين',
      trainingTagline: 'طوّر وتقدّم.',
      ctaEyebrow: 'اعثر على مكانك في لومينول',
      ctaTitle: 'أي نوع من النمو يهمك أكثر اليوم؟',
      ctaBody: 'استكشف المدارس الثلاث أو أخبر فريقنا بما تريد تحقيقه.',
      ctaAction: 'ابدأ محادثة',
    },
    contact: {
      title: 'تواصل معنا',
      description:
        'أخبر لومينول بأهدافك في علم النفس أو اللغات أو التطور المهني واعثر على الخطوة التالية المناسبة.',
      eyebrow: 'تواصل مع لومينول',
      heroTitle: 'خطوتك التالية تبدأ بمحادثة.',
      heroBody:
        'سواء كنت تعرف ما تحتاجه أو تريد المساعدة في الاختيار، شارك هدفك وستوجّهك لومينول نحو المدرسة والبرنامج الأنسب.',
      exploreEyebrow: 'استكشف قبل إرسال طلبك',
      pathDescriptions: {
        psychology: 'التوازن النفسي، الإرشاد العائلي، الكوتشينغ والورشات.',
        languages: 'الإنجليزية، الفرنسية، الطلاقة ومسارات التواصل.',
        training: 'القيادة، مهارات العمل والتكوين الموجّه للمؤسسات.',
      },
      nextEyebrow: 'خطوة أولى مدروسة',
      nextTitle: 'ماذا يحدث بعد ذلك؟',
      steps: [
        'يُسجَّل طلبك بشكل آمن.',
        'يراجع الفريق هدفك ومجال اهتمامك.',
        'تتواصل معك لومينول بالخطوة التالية الأكثر ملاءمة.',
      ],
      privacyNote:
        'يرجى عدم إدراج معلومات طبية أو مالية أو معلومات هوية شديدة الحساسية في هذا النموذج.',
    },
    programmes: {
      title: 'البرامج',
      description:
        'استكشف برامج أكاديمية لومينول المنشورة حسب المدرسة واللغة وهدف التعلّم.',
      eyebrow: 'البحث والاستكشاف',
      heroTitle: 'اعثر على برنامج لومينول المناسب لخطوتك القادمة.',
      heroBody:
        'ابحث في دليل البرامج المنشورة ثم حدّد النتائج حسب المدرسة أو لغة التقديم. تبقى الفلاتر في الرابط حتى يمكنك حفظ النتيجة أو مشاركتها.',
      searchLabel: 'ابحث في البرامج',
      searchPlaceholder: 'مثال: قيادة، إنجليزية أو ضغط نفسي',
      schoolLabel: 'المدرسة',
      allSchools: 'كل المدارس',
      languageLabel: 'لغة التقديم',
      allLanguages: 'كل اللغات',
      apply: 'طبّق الفلاتر',
      clear: 'مسح',
      unavailableTitle: 'استكشاف البرامج غير متاح مؤقتًا.',
      unavailableBody:
        'تعذّر التحقق من الدليل العام عبر مصدر المحتوى المعتمد. لا يزال بإمكانك استكشاف مدارس لومينول أو التواصل مع الأكاديمية لمعرفة البرامج الحالية.',
      exploreSchools: 'استكشف المدارس الثلاث',
      emptyTitle: 'لا توجد برامج منشورة تطابق هذه الفلاتر.',
      emptyBody: 'جرّب موضوعًا أوسع أو مدرسة أخرى أو لغة مختلفة.',
      reset: 'إعادة ضبط البحث',
      published: 'البرامج المنشورة',
      programmeSingular: 'برنامج',
      programmePlural: 'برامج',
      featured: 'مميّز',
      detailsAria: 'تفاصيل البرنامج',
      viewSchool: 'عرض المدرسة',
      askLuminol: 'اسأل لومينول',
      languageNames: { ar: 'العربية', fr: 'الفرنسية', en: 'الإنجليزية' },
    },
    schoolPage: {
      schoolsLabel: 'مدارس لومينول',
      explorePrograms: 'استكشف البرامج',
      startJourney: 'ابدأ رحلتك',
      promiseLabel: 'وعدنا',
      programsEyebrow: 'البرامج والدعم',
      programsTitle: 'اختر المسار الذي يناسب خطوتك القادمة.',
      programsBody:
        'يُبنى كل برنامج حول هدف واضح وتدرّج مدروس وتجربة تحترم الإنسان وراء الهدف.',
      askProgram: 'اسأل عن هذا البرنامج',
      journeyEyebrow: 'كيف تسير الرحلة',
      journeyTitle: 'مسار واضح من النية إلى تقدّم ذي معنى.',
      audienceEyebrow: 'مصمم حول الإنسان',
      audienceTitle: 'لمن صُممت هذه المدرسة',
      noteAria: 'ملاحظة حول البرنامج',
      important: 'مهم',
      relatedEyebrow: 'واصل استكشاف لومينول',
      relatedTitle: 'النمو يربط بين جميع مدارسنا.',
      relatedBody: 'استكشف بُعدًا آخر من تطورك الشخصي أو اللغوي أو المهني.',
      ctaEyebrow: 'خطوتك التالية',
      ctaTitle: 'لنجد معًا الطريق الأنسب إلى الأمام.',
      ctaBody:
        'ابدأ بهدفك، وستساعدك لومينول على تحديد البرنامج وتجربة التعلّم المناسبة.',
    },
    form: {
      sending: 'جارٍ إرسال طلبك…',
      success: 'شكرًا لك. وصل طلبك إلى لومينول وسيقوم الفريق بمراجعته.',
      error: 'تعذّر إرسال طلبك. يرجى المحاولة مرة أخرى.',
      eyebrow: 'أخبرنا عن هدفك',
      title: 'ابدأ رحلتك مع لومينول.',
      intro:
        'شارك ما تبحث عنه. سيستخدم فريق لومينول هذه التفاصيل فقط لفهم طلبك والرد عليه.',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      optional: 'اختياري',
      interest: 'مجال الاهتمام',
      choose: 'ساعدني على الاختيار',
      psychology: 'علم النفس',
      languages: 'اللغات',
      training: 'التكوين المهني',
      message: 'كيف يمكن للومينول مساعدتك؟',
      consent:
        'أوافق على أن تحتفظ لومينول بهذه التفاصيل وتستخدمها للرد على طلبي.',
      submit: 'أرسل طلبي',
    },
    certificate: {
      title: 'التحقق من الشهادة',
      description: 'تحقق من شهادة تعليمية صادرة عن أكاديمية لومينول.',
      eyebrow: 'التحقق من الاعتماد',
      verifiedTitle: 'تم التحقق من الشهادة.',
      revokedTitle: 'تم إلغاء الشهادة.',
      registryBody:
        'يأتي هذا السجل مباشرة من سجل الشهادات الآمن لدى أكاديمية لومينول.',
      validCredential: 'اعتماد صالح',
      revokedCredential: 'اعتماد ملغى',
      certifies: 'تشهد هذه الوثيقة أن',
      completed: 'قد أتم برنامج لومينول',
      issued: 'تاريخ الإصدار',
      status: 'الحالة',
      verified: 'موثقة',
      revoked: 'ملغاة',
      serial: 'الرقم التسلسلي',
      revokedNotice:
        'لم تعد هذه الشهادة صالحة. تواصل مع أكاديمية لومينول لمزيد من المعلومات.',
      privacyTitle: 'تحقق يحترم الخصوصية',
      privacyBody:
        'هذه الصفحة متاحة لأن صاحب الشهادة اختار جعل هذا الاعتماد عامًا، وهي مستبعدة من فهرسة محركات البحث.',
    },
  },
} as const satisfies Record<Locale, PublicCopy>;

export function getPublicCopy(locale: Locale): PublicCopy {
  return PUBLIC_COPY[locale];
}
