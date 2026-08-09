import type { Locale } from '@luminol/localization';

type PortalCopy = {
  metadata: { title: string; description: string };
  shell: {
    homeAria: string;
    portal: string;
    dashboard: string;
    search: string;
    notifications: string;
    billing: string;
    account: string;
  };
  dashboard: {
    eyebrow: string;
    welcome: string;
    intro: string;
    today: string;
    activeProgrammes: string;
    averageProgress: string;
    completed: string;
    certificates: string;
    learning: string;
    myProgrammes: string;
    openProgramme: string;
    readyToBegin: string;
    lessons: string;
    emptyTitle: string;
    emptyBody: string;
    discoverProgrammes: string;
    achievements: string;
    issued: string;
    revoked: string;
    publicVerification: string;
    privateVerification: string;
    openVerification: string;
    makePrivate: string;
    publishVerification: string;
    noCertificates: string;
  };
  search: {
    eyebrow: string;
    title: string;
    intro: string;
    label: string;
    placeholder: string;
    action: string;
    results: string;
    noResults: string;
    prompt: string;
    programme: string;
    module: string;
    lesson: string;
    open: string;
  };
  account: {
    eyebrow: string;
    title: string;
    intro: string;
    identity: string;
    name: string;
    email: string;
    roles: string;
    joined: string;
    security: string;
    securityBody: string;
  };
  notifications: {
    eyebrow: string;
    title: string;
    markRead: string;
    markUnread: string;
    empty: string;
    emailPreferences: string;
    preferencesBody: string;
    marketing: string;
    timeZone: string;
    save: string;
  };
  finance: {
    eyebrow: string;
    title: string;
    intro: string;
    invoices: string;
    noInvoices: string;
    payments: string;
    noPayments: string;
    subscriptions: string;
    noSubscriptions: string;
    receiptIssued: string;
    receiptPending: string;
    renews: string;
  };
  certificate: {
    title: string;
    certifies: string;
    completed: string;
    issued: string;
    serial: string;
    status: string;
    printHint: string;
  };
  course: {
    back: string;
    eyebrow: string;
    intro: string;
    resume: string;
    start: string;
    module: string;
    minutes: string;
    markComplete: string;
    completed: string;
    preparingTitle: string;
    preparingBody: string;
  };
  lesson: {
    breadcrumb: string;
    module: string;
    minutes: string;
    material: string;
    materialBody: string;
    openResource: string;
    pendingBody: string;
    previous: string;
    next: string;
    programme: string;
    startOfProgramme: string;
    reviewCurriculum: string;
    lessonsInProgramme: string;
    completed: string;
    completeContinue: string;
  };
  languages: {
    eyebrow: string;
    title: string;
    intro: string;
    placement: string;
    availableAssessments: string;
    available: string;
    emptyTitle: string;
    emptyBody: string;
    version: string;
    untimed: string;
    latestAttempt: string;
    level: string;
    viewResult: string;
    resume: string;
    start: string;
  };
  placement: {
    result: string;
    levelIs: string;
    resultPending: string;
    recommendedLevel: string;
    totalScore: string;
    skillAreas: string;
    status: string;
    stillInProgress: string;
    completeFirst: string;
    resume: string;
    skillProfile: string;
    breakdown: string;
    instructorReview: string;
    reviewBody: string;
    diagnostic: string;
    explore: string;
    session: string;
    beforeBegin: string;
    fairAssessment: string;
    sixSkills: string;
    sixSkillsBody: string;
    protectedProgress: string;
    protectedBody: string;
    contentPending: string;
    timeLimit: string;
  };
};

const PORTAL_COPY = {
  en: {
    metadata: {
      title: 'Learner Portal | Luminol',
      description: 'Secure learning, progress, certificates and account services for Luminol Academy learners.',
    },
    shell: {
      homeAria: 'Luminol learner home',
      portal: 'Learner portal',
      dashboard: 'Dashboard',
      search: 'Search',
      notifications: 'Notifications',
      billing: 'Billing',
      account: 'Account',
    },
    dashboard: {
      eyebrow: 'Learning overview', welcome: 'Welcome', intro: 'Continue your programmes, review progress and access your learner records from one secure place.', today: 'Today', activeProgrammes: 'Active programmes', averageProgress: 'Average progress', completed: 'Completed', certificates: 'Certificates', learning: 'Learning', myProgrammes: 'My programmes', openProgramme: 'Open programme', readyToBegin: 'Ready to begin', lessons: 'lessons', emptyTitle: 'No active programmes yet.', emptyBody: 'Your enrolled programmes will appear here as soon as learning access is active.', discoverProgrammes: 'Explore programmes', achievements: 'Achievements', issued: 'Issued', revoked: 'Revoked', publicVerification: 'Public verification', privateVerification: 'Private', openVerification: 'Open verification', makePrivate: 'Make private', publishVerification: 'Publish verification', noCertificates: 'No certificates yet.',
    },
    search: { eyebrow: 'Search learning', title: 'Find your learning content.', intro: 'Search only the programmes, modules and lessons available to your learner account.', label: 'Search your learning', placeholder: 'Try a programme, module or lesson', action: 'Search', results: 'Results', noResults: 'No learning content matches this search.', prompt: 'Enter at least two characters to search.', programme: 'Programme', module: 'Module', lesson: 'Lesson', open: 'Open' },
    account: { eyebrow: 'Account', title: 'Your learner profile.', intro: 'Review the identity and access information linked to your synchronized learner account.', identity: 'Identity', name: 'Name', email: 'Email', roles: 'Roles', joined: 'Joined', security: 'Account security', securityBody: 'Authentication and sign-in security are managed through Luminol’s protected identity provider.' },
    notifications: { eyebrow: 'Updates', title: 'Notifications', markRead: 'Mark read', markUnread: 'Mark unread', empty: 'No notifications yet.', emailPreferences: 'Email preferences', preferencesBody: 'Essential account and learning messages are always sent. Optional updates require your consent.', marketing: 'Receive optional academy updates', timeZone: 'Time zone', save: 'Save preferences' },
    finance: { eyebrow: 'Billing', title: 'Invoices and payments', intro: 'Your payment history, receipts and subscription status in one secure view.', invoices: 'Invoices', noInvoices: 'No invoices yet.', payments: 'Payment history and receipts', noPayments: 'No payments yet.', subscriptions: 'Subscriptions', noSubscriptions: 'No active subscriptions.', receiptIssued: 'Receipt issued', receiptPending: 'Receipt pending', renews: 'renews' },
    certificate: { title: 'Certificate of completion', certifies: 'This certifies that', completed: 'successfully completed', issued: 'Issued', serial: 'Serial', status: 'Status', printHint: 'Use your browser’s print command to save or print this certificate.' },
    course: { back: 'Back to dashboard', eyebrow: 'My programme', intro: 'Move through each lesson at your pace. Your completed work is saved to your secure learner record.', resume: 'Resume learning', start: 'Start learning', module: 'Module', minutes: 'min', markComplete: 'Mark complete', completed: 'Completed', preparingTitle: 'Your curriculum is being prepared.', preparingBody: 'Your programme team will publish the first learning materials here. Your enrolment is already secure.' },
    lesson: { breadcrumb: 'Breadcrumb', module: 'Module', minutes: 'minutes', material: 'Learning material', materialBody: 'Open the approved learning resource in a new tab. Your progress remains available here when you return.', openResource: 'Open resource', pendingBody: 'This lesson is ready in your learning path. The programme team is preparing its final resource; you can return without losing your place.', previous: 'Previous lesson', next: 'Next lesson', programme: 'Programme', startOfProgramme: 'Start of programme', reviewCurriculum: 'Review your curriculum', lessonsInProgramme: 'Lessons in this programme', completed: 'Lesson completed', completeContinue: 'Complete and continue' },
    languages: { eyebrow: 'Language learning', title: 'Find your starting level.', intro: 'Take a secure CEFR placement assessment and receive a clear view of your reading, listening, speaking, writing, grammar and vocabulary.', placement: 'Placement', availableAssessments: 'Available assessments', available: 'available', emptyTitle: 'Placement assessments are being prepared.', emptyBody: 'Your language programmes will appear here as soon as they are published.', version: 'Version', untimed: 'Untimed', latestAttempt: 'Latest attempt', level: 'Level', viewResult: 'View result', resume: 'Resume assessment', start: 'Start assessment' },
    placement: { result: 'Placement result', levelIs: 'Your level is', resultPending: 'Result pending.', recommendedLevel: 'Recommended level', totalScore: 'Total score', skillAreas: 'Skill areas', status: 'Status', stillInProgress: 'This assessment is still in progress.', completeFirst: 'Complete and submit the assessment before viewing a result.', resume: 'Resume assessment', skillProfile: 'Skill profile', breakdown: 'Your CEFR breakdown', instructorReview: 'Instructor review in progress', reviewBody: 'Productive skills such as speaking or writing may require a qualified instructor before your final level is confirmed.', diagnostic: 'Diagnostic', explore: 'Explore', session: 'Placement session', beforeBegin: 'Before you begin', fairAssessment: 'A fair, focused assessment', sixSkills: 'Six skill areas', sixSkillsBody: 'Reading, listening, speaking, writing, grammar and vocabulary contribute to your CEFR recommendation.', protectedProgress: 'Progress is protected', protectedBody: 'Your attempt belongs only to your synchronized learner account. Submitted assessments are locked against further edits.', contentPending: 'Assessment questions are published through the instructor authoring workflow. This session is ready and will resume here when content is available.', timeLimit: 'Time limit' },
  },
  fr: {
    metadata: { title: 'Espace apprenant | Luminol', description: 'Espace sécurisé pour les apprentissages, la progression, les certificats et le compte des apprenants Luminol Academy.' },
    shell: { homeAria: 'Accueil apprenant Luminol', portal: 'Espace apprenant', dashboard: 'Tableau de bord', search: 'Recherche', notifications: 'Notifications', billing: 'Facturation', account: 'Compte' },
    dashboard: { eyebrow: 'Vue d’ensemble', welcome: 'Bienvenue', intro: 'Poursuivez vos programmes, suivez votre progression et accédez à vos dossiers apprenant depuis un espace sécurisé.', today: 'Aujourd’hui', activeProgrammes: 'Programmes actifs', averageProgress: 'Progression moyenne', completed: 'Terminés', certificates: 'Certificats', learning: 'Apprentissage', myProgrammes: 'Mes programmes', openProgramme: 'Ouvrir le programme', readyToBegin: 'Prêt à commencer', lessons: 'leçons', emptyTitle: 'Aucun programme actif pour le moment.', emptyBody: 'Vos programmes apparaîtront ici dès que votre accès à l’apprentissage sera actif.', discoverProgrammes: 'Explorer les programmes', achievements: 'Réalisations', issued: 'Émis', revoked: 'Révoqué', publicVerification: 'Vérification publique', privateVerification: 'Privé', openVerification: 'Ouvrir la vérification', makePrivate: 'Rendre privé', publishVerification: 'Publier la vérification', noCertificates: 'Aucun certificat pour le moment.' },
    search: { eyebrow: 'Recherche', title: 'Retrouvez vos contenus de formation.', intro: 'Recherchez uniquement dans les programmes, modules et leçons accessibles à votre compte apprenant.', label: 'Rechercher dans vos formations', placeholder: 'Programme, module ou leçon', action: 'Rechercher', results: 'Résultats', noResults: 'Aucun contenu ne correspond à cette recherche.', prompt: 'Saisissez au moins deux caractères.', programme: 'Programme', module: 'Module', lesson: 'Leçon', open: 'Ouvrir' },
    account: { eyebrow: 'Compte', title: 'Votre profil apprenant.', intro: 'Consultez les informations d’identité et d’accès liées à votre compte apprenant synchronisé.', identity: 'Identité', name: 'Nom', email: 'E-mail', roles: 'Rôles', joined: 'Inscription', security: 'Sécurité du compte', securityBody: 'L’authentification et la sécurité de connexion sont gérées par le fournisseur d’identité protégé de Luminol.' },
    notifications: { eyebrow: 'Actualités', title: 'Notifications', markRead: 'Marquer comme lu', markUnread: 'Marquer comme non lu', empty: 'Aucune notification.', emailPreferences: 'Préférences e-mail', preferencesBody: 'Les messages essentiels liés au compte et à l’apprentissage sont toujours envoyés. Les communications facultatives nécessitent votre consentement.', marketing: 'Recevoir les actualités facultatives de l’académie', timeZone: 'Fuseau horaire', save: 'Enregistrer les préférences' },
    finance: { eyebrow: 'Facturation', title: 'Factures et paiements', intro: 'Historique des paiements, reçus et abonnements dans un espace sécurisé.', invoices: 'Factures', noInvoices: 'Aucune facture.', payments: 'Paiements et reçus', noPayments: 'Aucun paiement.', subscriptions: 'Abonnements', noSubscriptions: 'Aucun abonnement actif.', receiptIssued: 'Reçu émis', receiptPending: 'Reçu en attente', renews: 'renouvellement le' },
    certificate: { title: 'Certificat de réussite', certifies: 'Ceci certifie que', completed: 'a terminé avec succès', issued: 'Émis', serial: 'Numéro de série', status: 'Statut', printHint: 'Utilisez la commande d’impression de votre navigateur pour enregistrer ou imprimer ce certificat.' },
    course: { back: 'Retour au tableau de bord', eyebrow: 'Mon programme', intro: 'Avancez à votre rythme. Le travail terminé est enregistré dans votre dossier apprenant sécurisé.', resume: 'Reprendre', start: 'Commencer', module: 'Module', minutes: 'min', markComplete: 'Marquer comme terminé', completed: 'Terminé', preparingTitle: 'Votre parcours est en préparation.', preparingBody: 'L’équipe du programme publiera ici les premiers contenus. Votre inscription est déjà sécurisée.' },
    lesson: { breadcrumb: 'Fil d’Ariane', module: 'Module', minutes: 'minutes', material: 'Support pédagogique', materialBody: 'Ouvrez la ressource approuvée dans un nouvel onglet. Votre progression reste enregistrée à votre retour.', openResource: 'Ouvrir la ressource', pendingBody: 'Cette leçon est prête dans votre parcours. L’équipe finalise sa ressource; vous pourrez revenir sans perdre votre progression.', previous: 'Leçon précédente', next: 'Leçon suivante', programme: 'Programme', startOfProgramme: 'Début du programme', reviewCurriculum: 'Revoir le parcours', lessonsInProgramme: 'Leçons de ce programme', completed: 'Leçon terminée', completeContinue: 'Terminer et continuer' },
    languages: { eyebrow: 'Apprentissage des langues', title: 'Trouvez votre niveau de départ.', intro: 'Passez une évaluation CECR sécurisée et obtenez une vue claire de vos compétences en lecture, écoute, expression orale, écriture, grammaire et vocabulaire.', placement: 'Positionnement', availableAssessments: 'Évaluations disponibles', available: 'disponibles', emptyTitle: 'Les évaluations sont en préparation.', emptyBody: 'Vos programmes de langues apparaîtront ici dès leur publication.', version: 'Version', untimed: 'Sans limite de temps', latestAttempt: 'Dernière tentative', level: 'Niveau', viewResult: 'Voir le résultat', resume: 'Reprendre l’évaluation', start: 'Commencer l’évaluation' },
    placement: { result: 'Résultat du positionnement', levelIs: 'Votre niveau est', resultPending: 'Résultat en attente.', recommendedLevel: 'Niveau recommandé', totalScore: 'Score total', skillAreas: 'Compétences', status: 'Statut', stillInProgress: 'Cette évaluation est toujours en cours.', completeFirst: 'Terminez et soumettez l’évaluation avant de consulter le résultat.', resume: 'Reprendre l’évaluation', skillProfile: 'Profil de compétences', breakdown: 'Votre profil CECR', instructorReview: 'Évaluation par un formateur en cours', reviewBody: 'Les compétences productives comme l’oral ou l’écrit peuvent nécessiter la validation d’un formateur qualifié avant confirmation du niveau final.', diagnostic: 'Diagnostic', explore: 'Explorer', session: 'Session de positionnement', beforeBegin: 'Avant de commencer', fairAssessment: 'Une évaluation équitable et ciblée', sixSkills: 'Six compétences', sixSkillsBody: 'Lecture, écoute, expression orale, écriture, grammaire et vocabulaire contribuent à votre recommandation CECR.', protectedProgress: 'Progression protégée', protectedBody: 'Votre tentative appartient uniquement à votre compte apprenant synchronisé. Une évaluation soumise ne peut plus être modifiée.', contentPending: 'Les questions sont publiées via le flux de création des formateurs. Cette session reprendra ici dès que le contenu sera disponible.', timeLimit: 'Durée maximale' },
  },
  ar: {
    metadata: { title: 'فضاء المتعلّم | لومينول', description: 'فضاء آمن للتعلّم ومتابعة التقدّم والشهادات وخدمات الحساب لمتعلّمي أكاديمية لومينول.' },
    shell: { homeAria: 'الصفحة الرئيسية لفضاء المتعلّم', portal: 'فضاء المتعلّم', dashboard: 'لوحة التعلّم', search: 'بحث', notifications: 'الإشعارات', billing: 'الفوترة', account: 'الحساب' },
    dashboard: { eyebrow: 'نظرة عامة على التعلّم', welcome: 'مرحباً', intro: 'واصل برامجك، تابع تقدّمك وادخل إلى سجلاتك التعليمية من مكان آمن واحد.', today: 'اليوم', activeProgrammes: 'البرامج النشطة', averageProgress: 'متوسط التقدّم', completed: 'المكتملة', certificates: 'الشهادات', learning: 'التعلّم', myProgrammes: 'برامجي', openProgramme: 'فتح البرنامج', readyToBegin: 'جاهز للبدء', lessons: 'دروس', emptyTitle: 'لا توجد برامج نشطة حالياً.', emptyBody: 'ستظهر برامجك هنا بمجرد تفعيل وصولك إلى التعلّم.', discoverProgrammes: 'استكشاف البرامج', achievements: 'الإنجازات', issued: 'صدرت', revoked: 'ملغاة', publicVerification: 'تحقق علني', privateVerification: 'خاصة', openVerification: 'فتح التحقق', makePrivate: 'جعلها خاصة', publishVerification: 'نشر التحقق', noCertificates: 'لا توجد شهادات بعد.' },
    search: { eyebrow: 'البحث في التعلّم', title: 'اعثر على محتوى تعلّمك.', intro: 'ابحث فقط داخل البرامج والوحدات والدروس المتاحة لحسابك.', label: 'ابحث في محتوى تعلّمك', placeholder: 'برنامج أو وحدة أو درس', action: 'بحث', results: 'النتائج', noResults: 'لا يوجد محتوى يطابق هذا البحث.', prompt: 'أدخل حرفين على الأقل للبحث.', programme: 'برنامج', module: 'وحدة', lesson: 'درس', open: 'فتح' },
    account: { eyebrow: 'الحساب', title: 'ملفك كمتعلّم.', intro: 'راجع معلومات الهوية والوصول المرتبطة بحسابك المتزامن.', identity: 'الهوية', name: 'الاسم', email: 'البريد الإلكتروني', roles: 'الأدوار', joined: 'تاريخ الانضمام', security: 'أمان الحساب', securityBody: 'تُدار المصادقة وأمان تسجيل الدخول عبر مزوّد الهوية المحمي لدى لومينول.' },
    notifications: { eyebrow: 'التحديثات', title: 'الإشعارات', markRead: 'تحديد كمقروء', markUnread: 'تحديد كغير مقروء', empty: 'لا توجد إشعارات بعد.', emailPreferences: 'تفضيلات البريد الإلكتروني', preferencesBody: 'تُرسل رسائل الحساب والتعلّم الأساسية دائماً، أما التحديثات الاختيارية فتتطلب موافقتك.', marketing: 'استلام تحديثات الأكاديمية الاختيارية', timeZone: 'المنطقة الزمنية', save: 'حفظ التفضيلات' },
    finance: { eyebrow: 'الفوترة', title: 'الفواتير والمدفوعات', intro: 'سجل المدفوعات والإيصالات وحالة الاشتراك في عرض آمن واحد.', invoices: 'الفواتير', noInvoices: 'لا توجد فواتير بعد.', payments: 'سجل المدفوعات والإيصالات', noPayments: 'لا توجد مدفوعات بعد.', subscriptions: 'الاشتراكات', noSubscriptions: 'لا توجد اشتراكات نشطة.', receiptIssued: 'تم إصدار الإيصال', receiptPending: 'الإيصال قيد الإصدار', renews: 'يتجدد في' },
    certificate: { title: 'شهادة إتمام', certifies: 'تشهد هذه الوثيقة أن', completed: 'أتم بنجاح', issued: 'تاريخ الإصدار', serial: 'الرقم التسلسلي', status: 'الحالة', printHint: 'استخدم أمر الطباعة في متصفحك لحفظ هذه الشهادة أو طباعتها.' },
    course: { back: 'العودة إلى لوحة التعلّم', eyebrow: 'برنامجي', intro: 'تقدّم في كل درس بالوتيرة التي تناسبك. يُحفظ عملك المكتمل في سجلك التعليمي الآمن.', resume: 'متابعة التعلّم', start: 'بدء التعلّم', module: 'الوحدة', minutes: 'د', markComplete: 'تحديد كمكتمل', completed: 'مكتمل', preparingTitle: 'يتم تحضير مسارك التعليمي.', preparingBody: 'سينشر فريق البرنامج مواد التعلّم الأولى هنا. تسجيلك محفوظ وآمن.' },
    lesson: { breadcrumb: 'مسار الصفحة', module: 'الوحدة', minutes: 'دقيقة', material: 'المادة التعليمية', materialBody: 'افتح المورد المعتمد في علامة تبويب جديدة. يبقى تقدّمك محفوظاً عند العودة.', openResource: 'فتح المورد', pendingBody: 'هذا الدرس موجود في مسارك، ويعمل فريق البرنامج على تجهيز مورده النهائي. يمكنك العودة دون فقدان موضعك.', previous: 'الدرس السابق', next: 'الدرس التالي', programme: 'البرنامج', startOfProgramme: 'بداية البرنامج', reviewCurriculum: 'مراجعة المسار', lessonsInProgramme: 'دروس هذا البرنامج', completed: 'تم إكمال الدرس', completeContinue: 'إكمال ومتابعة' },
    languages: { eyebrow: 'تعلّم اللغات', title: 'اعرف مستواك للانطلاق.', intro: 'أجرِ اختبار تحديد مستوى آمن وفق CEFR واحصل على رؤية واضحة لمهارات القراءة والاستماع والتحدث والكتابة والقواعد والمفردات.', placement: 'تحديد المستوى', availableAssessments: 'الاختبارات المتاحة', available: 'متاحة', emptyTitle: 'اختبارات تحديد المستوى قيد التحضير.', emptyBody: 'ستظهر برامج اللغات هنا بمجرد نشرها.', version: 'الإصدار', untimed: 'دون توقيت', latestAttempt: 'آخر محاولة', level: 'المستوى', viewResult: 'عرض النتيجة', resume: 'متابعة الاختبار', start: 'بدء الاختبار' },
    placement: { result: 'نتيجة تحديد المستوى', levelIs: 'مستواك هو', resultPending: 'النتيجة قيد الانتظار.', recommendedLevel: 'المستوى المقترح', totalScore: 'النتيجة الإجمالية', skillAreas: 'مجالات المهارة', status: 'الحالة', stillInProgress: 'هذا الاختبار ما يزال قيد الإنجاز.', completeFirst: 'أكمل الاختبار وأرسله قبل عرض النتيجة.', resume: 'متابعة الاختبار', skillProfile: 'ملف المهارات', breakdown: 'تفصيل مستواك وفق CEFR', instructorReview: 'مراجعة المدرّب قيد الإنجاز', reviewBody: 'قد تحتاج مهارات مثل التحدث أو الكتابة إلى مراجعة مدرّب مؤهل قبل تأكيد المستوى النهائي.', diagnostic: 'تشخيصي', explore: 'استكشاف', session: 'جلسة تحديد المستوى', beforeBegin: 'قبل البدء', fairAssessment: 'اختبار عادل ومركّز', sixSkills: 'ستة مجالات مهارية', sixSkillsBody: 'تساهم القراءة والاستماع والتحدث والكتابة والقواعد والمفردات في تحديد المستوى المقترح وفق CEFR.', protectedProgress: 'تقدّمك محمي', protectedBody: 'محاولتك مرتبطة بحسابك المتزامن فقط، ولا يمكن تعديل الاختبار بعد إرساله.', contentPending: 'تُنشر أسئلة الاختبار عبر مسار إعداد المدرّبين. ستستأنف هذه الجلسة هنا عندما يصبح المحتوى متاحاً.', timeLimit: 'المدة القصوى' },
  },
} as const satisfies Record<Locale, PortalCopy>;

export function getPortalCopy(locale: Locale): PortalCopy {
  return PORTAL_COPY[locale];
}

const STATUS_LABELS: Record<Locale, Record<string, string>> = {
  en: { ACTIVE: 'Active', COMPLETED: 'Completed', IN_PROGRESS: 'In progress', REVIEW_REQUIRED: 'Review required', PAID: 'Paid', OPEN: 'Open', PENDING: 'Pending', FAILED: 'Failed', CANCELED: 'Canceled', CANCELLED: 'Cancelled', DRAFT: 'Draft', REVOKED: 'Revoked' },
  fr: { ACTIVE: 'Actif', COMPLETED: 'Terminé', IN_PROGRESS: 'En cours', REVIEW_REQUIRED: 'Révision requise', PAID: 'Payé', OPEN: 'Ouverte', PENDING: 'En attente', FAILED: 'Échec', CANCELED: 'Annulé', CANCELLED: 'Annulé', DRAFT: 'Brouillon', REVOKED: 'Révoqué' },
  ar: { ACTIVE: 'نشط', COMPLETED: 'مكتمل', IN_PROGRESS: 'قيد الإنجاز', REVIEW_REQUIRED: 'يتطلب مراجعة', PAID: 'مدفوع', OPEN: 'مفتوح', PENDING: 'قيد الانتظار', FAILED: 'فشل', CANCELED: 'ملغى', CANCELLED: 'ملغى', DRAFT: 'مسودة', REVOKED: 'ملغاة' },
};

const LESSON_TYPE_LABELS: Record<Locale, Record<string, string>> = {
  en: { VIDEO: 'Video', ARTICLE: 'Article', QUIZ: 'Quiz', DOWNLOAD: 'Download', LIVE: 'Live' },
  fr: { VIDEO: 'Vidéo', ARTICLE: 'Article', QUIZ: 'Quiz', DOWNLOAD: 'Téléchargement', LIVE: 'Direct' },
  ar: { VIDEO: 'فيديو', ARTICLE: 'مقال', QUIZ: 'اختبار', DOWNLOAD: 'تحميل', LIVE: 'مباشر' },
};

const SKILL_LABELS: Record<Locale, Record<string, string>> = {
  en: { READING: 'Reading', LISTENING: 'Listening', SPEAKING: 'Speaking', WRITING: 'Writing', GRAMMAR: 'Grammar', VOCABULARY: 'Vocabulary' },
  fr: { READING: 'Lecture', LISTENING: 'Écoute', SPEAKING: 'Expression orale', WRITING: 'Écriture', GRAMMAR: 'Grammaire', VOCABULARY: 'Vocabulaire' },
  ar: { READING: 'القراءة', LISTENING: 'الاستماع', SPEAKING: 'التحدث', WRITING: 'الكتابة', GRAMMAR: 'القواعد', VOCABULARY: 'المفردات' },
};

function fallbackEnumLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLocaleLowerCase('en')
    .replace(/^./, (character) => character.toUpperCase());
}

export function getPortalStatusLabel(locale: Locale, value: string) {
  return STATUS_LABELS[locale][value] ?? fallbackEnumLabel(value);
}

export function getLessonTypeLabel(locale: Locale, value: string) {
  return LESSON_TYPE_LABELS[locale][value] ?? fallbackEnumLabel(value);
}

export function getSkillLabel(locale: Locale, value: string) {
  return SKILL_LABELS[locale][value] ?? fallbackEnumLabel(value);
}
