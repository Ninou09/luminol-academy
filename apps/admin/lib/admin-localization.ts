import type { Locale } from '@luminol/localization';

export type AdminSearchCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  fieldLabel: string;
  placeholder: string;
  searching: string;
  search: string;
  results: string;
  resultShown: string;
  resultsShown: string;
  noMatchingRecords: string;
  forQuery: string;
  people: string;
  enquiries: string;
  programmes: string;
  firstTwenty: string;
  accountCreated: string;
  noPeople: string;
  noEnquiries: string;
  noProgrammes: string;
  published: string;
  draft: string;
  updated: string;
  minimumPrompt: string;
  privacyPrompt: string;
};

export type AdminCopy = {
  metadata: { title: string; description: string };
  shell: {
    aria: string;
    navigationAria: string;
    administration: string;
    administrator: string;
    overview: string;
    enquiries: string;
    learners: string;
    programmes: string;
    search: string;
    finance: string;
    protectedWorkspace: string;
    protectedNote: string;
    searchWorkspace: string;
    privacyNote: string;
  };
  dashboard: {
    topbarTitle: string;
    topbarSubtitle: string;
    eyebrow: string;
    title: string;
    intro: string;
    health: string;
    summaryAria: string;
    activePeople: string;
    synchronizedAccounts: string;
    activeEnrollments: string;
    learningNow: string;
    publishedCourses: string;
    availableProgrammes: string;
    newEnquiries: string;
    awaitingReview: string;
    completionRate: string;
    completionRateAria: string;
    growth: string;
    recentEnquiries: string;
    newSuffix: string;
    updateEnquiryStatus: string;
    moveTo: string;
    update: string;
    noEnquiries: string;
    learning: string;
    recentEnrollments: string;
    learner: string;
    publishedCourse: string;
    selectLearner: string;
    selectCourse: string;
    createEnrollment: string;
    enrollmentReadiness: string;
    updateEnrollmentStatus: string;
    noEnrollments: string;
    portfolio: string;
    programmeReadiness: string;
    recentSuffix: string;
    programme: string;
    modules: string;
    enrollments: string;
    status: string;
    updated: string;
    published: string;
    draft: string;
    noCourses: string;
  };
  search: AdminSearchCopy;
  finance: {
    eyebrow: string;
    title: string;
    intro: string;
    back: string;
    invoices: string;
    recent: string;
    noInvoices: string;
    summaryAria: string;
    payments: string;
    refunds: string;
    corporateRecords: string;
    reconciliationExceptions: string;
    reconciliation: string;
    difference: string;
    noReconciliation: string;
  };
  certificates: {
    eyebrow: string;
    title: string;
    intro: string;
    back: string;
    summaryAria: string;
    eligibleCompletions: string;
    totalCertificates: string;
    active: string;
    revoked: string;
    readyForReview: string;
    recentRecords: string;
    currentlyValid: string;
    invalidated: string;
    awaitingAction: string;
    ready: string;
    issueCertificate: string;
    noAwaitingTitle: string;
    noAwaitingBody: string;
    history: string;
    issuedCertificates: string;
    records: string;
    issued: string;
    replacementReason: string;
    replaceCertificate: string;
    revocationReason: string;
    issuedInError: string;
    misconduct: string;
    replacement: string;
    revokeCertificate: string;
    noIssuedTitle: string;
    noIssuedBody: string;
  };
  notifications: {
    back: string;
    title: string;
    intro: string;
    noFailures: string;
    attempt: string;
    noErrorCode: string;
    organization: string;
    personal: string;
    next: string;
  };
};

const ADMIN_COPY: Record<Locale, AdminCopy> = {
  en: {
    metadata: {
      title: 'Administration | Luminol Academy',
      description: 'Protected administration workspace for Luminol Academy operations.',
    },
    shell: {
      aria: 'Luminol administration',
      navigationAria: 'Administration navigation',
      administration: 'Administration',
      administrator: 'Administrator',
      overview: 'Overview',
      enquiries: 'Enquiries',
      learners: 'Learners',
      programmes: 'Programmes',
      search: 'Search',
      finance: 'Finance',
      protectedWorkspace: 'Protected workspace',
      protectedNote: 'Server-authorized operations for the Luminol team.',
      searchWorkspace: 'Operations search',
      privacyNote: 'Search is limited to operational identity, enquiry routing and course metadata. Enquiry messages and sensitive learning content are not searched here.',
    },
    dashboard: {
      topbarTitle: 'Academic operations',
      topbarSubtitle: 'Live platform overview',
      eyebrow: 'Operations centre',
      title: 'Clarity for every branch.',
      intro: 'One view of people, programmes, enquiries and learning activity across the Luminol ecosystem.',
      health: 'Platform data connected',
      summaryAria: 'Operations summary',
      activePeople: 'Active people',
      synchronizedAccounts: 'Synchronized accounts',
      activeEnrollments: 'Active enrolments',
      learningNow: 'Learning now',
      publishedCourses: 'Published courses',
      availableProgrammes: 'Available programmes',
      newEnquiries: 'New enquiries',
      awaitingReview: 'Awaiting review',
      completionRate: 'Completion rate',
      completionRateAria: 'Programme completion rate',
      growth: 'Growth',
      recentEnquiries: 'Recent enquiries',
      newSuffix: 'new',
      updateEnquiryStatus: 'Update enquiry status',
      moveTo: 'Move to…',
      update: 'Update',
      noEnquiries: 'No enquiries have arrived yet.',
      learning: 'Learning',
      recentEnrollments: 'Recent enrolments',
      learner: 'Learner',
      publishedCourse: 'Published course',
      selectLearner: 'Select learner',
      selectCourse: 'Select course',
      createEnrollment: 'Create enrolment',
      enrollmentReadiness: 'A synchronized learner and published course are required before an enrolment can be created.',
      updateEnrollmentStatus: 'Update enrolment status',
      noEnrollments: 'No learner enrolments yet.',
      portfolio: 'Portfolio',
      programmeReadiness: 'Programme readiness',
      recentSuffix: 'recent',
      programme: 'Programme',
      modules: 'Modules',
      enrollments: 'Enrolments',
      status: 'Status',
      updated: 'Updated',
      published: 'Published',
      draft: 'Draft',
      noCourses: 'No courses have been synchronized.',
    },
    search: {
      eyebrow: 'Search & discovery',
      title: 'Find operational records.',
      intro: 'Search active people, enquiry identity and routing metadata, and the course portfolio without exposing enquiry messages or private learning content.',
      fieldLabel: 'Search administration records',
      placeholder: 'Try a name, email, course title or slug',
      searching: 'Searching…',
      search: 'Search',
      results: 'Results',
      resultShown: 'result shown',
      resultsShown: 'results shown',
      noMatchingRecords: 'No matching records',
      forQuery: 'For',
      people: 'People',
      enquiries: 'Enquiries',
      programmes: 'Programmes',
      firstTwenty: 'Showing the first 20 matches',
      accountCreated: 'Account created',
      noPeople: 'No active people match.',
      noEnquiries: 'No enquiry identities match.',
      noProgrammes: 'No programmes match.',
      published: 'Published',
      draft: 'Draft',
      updated: 'Updated',
      minimumPrompt: 'Enter at least 3 characters to search.',
      privacyPrompt: 'Results remain inside this server-authorized administration workspace and protected search terms are submitted in the request body rather than the URL.',
    },
    finance: {
      eyebrow: 'Finance operations',
      title: 'Billing and payments',
      intro: 'Manage invoice lifecycles, refunds, corporate accounts, and settlement reconciliation.',
      back: 'Back to operations',
      invoices: 'Invoices',
      recent: 'recent',
      noInvoices: 'No invoices.',
      summaryAria: 'Finance summary',
      payments: 'Payments',
      refunds: 'Refunds',
      corporateRecords: 'Corporate records',
      reconciliationExceptions: 'Reconciliation exceptions',
      reconciliation: 'Reconciliation',
      difference: 'difference',
      noReconciliation: 'No reconciliation records.',
    },
    certificates: {
      eyebrow: 'Credential operations',
      title: 'Certificate registry',
      intro: 'Issue certificates from verified completions, review their audit history, and manage replacements or revocations.',
      back: 'Back to operations',
      summaryAria: 'Certificate summary',
      eligibleCompletions: 'Eligible completions',
      totalCertificates: 'Total certificates',
      active: 'Active',
      revoked: 'Revoked',
      readyForReview: 'Ready for certificate review',
      recentRecords: 'Most recent 100 records',
      currentlyValid: 'Currently valid credentials',
      invalidated: 'Invalidated credentials',
      awaitingAction: 'Awaiting action',
      ready: 'ready',
      issueCertificate: 'Issue certificate',
      noAwaitingTitle: 'No certificates are waiting to be issued.',
      noAwaitingBody: 'A learner appears here only after a published programme enrolment has been marked completed with a completion date.',
      history: 'Credential history',
      issuedCertificates: 'Issued certificates',
      records: 'records',
      issued: 'issued',
      replacementReason: 'Replacement reason',
      replaceCertificate: 'Replace certificate',
      revocationReason: 'Revocation reason',
      issuedInError: 'Issued in error',
      misconduct: 'Misconduct',
      replacement: 'Replacement',
      revokeCertificate: 'Revoke certificate',
      noIssuedTitle: 'No certificates have been issued yet.',
      noIssuedBody: 'Issued credentials and their audit history will appear here.',
    },
    notifications: {
      back: 'Overview',
      title: 'Notification delivery',
      intro: 'Failure details exclude message bodies and recipient private data.',
      noFailures: 'No retry-scheduled or dead-letter deliveries.',
      attempt: 'attempt',
      noErrorCode: 'No error code',
      organization: 'Organization',
      personal: 'Personal',
      next: 'next',
    },
  },
  fr: {
    metadata: {
      title: 'Administration | Luminol Academy',
      description: 'Espace d’administration protégé pour les opérations de Luminol Academy.',
    },
    shell: {
      aria: 'Administration Luminol',
      navigationAria: 'Navigation de l’administration',
      administration: 'Administration',
      administrator: 'Administrateur',
      overview: 'Vue d’ensemble',
      enquiries: 'Demandes',
      learners: 'Apprenants',
      programmes: 'Programmes',
      search: 'Recherche',
      finance: 'Finance',
      protectedWorkspace: 'Espace protégé',
      protectedNote: 'Opérations autorisées côté serveur pour l’équipe Luminol.',
      searchWorkspace: 'Recherche opérationnelle',
      privacyNote: 'La recherche est limitée à l’identité opérationnelle, au routage des demandes et aux métadonnées des programmes. Les messages des demandes et le contenu pédagogique sensible ne sont pas recherchés ici.',
    },
    dashboard: {
      topbarTitle: 'Opérations académiques',
      topbarSubtitle: 'Vue en direct de la plateforme',
      eyebrow: 'Centre des opérations',
      title: 'Une vision claire pour chaque branche.',
      intro: 'Une vue unique des personnes, programmes, demandes et activités d’apprentissage dans tout l’écosystème Luminol.',
      health: 'Données de la plateforme connectées',
      summaryAria: 'Résumé des opérations',
      activePeople: 'Personnes actives',
      synchronizedAccounts: 'Comptes synchronisés',
      activeEnrollments: 'Inscriptions actives',
      learningNow: 'En apprentissage',
      publishedCourses: 'Cours publiés',
      availableProgrammes: 'Programmes disponibles',
      newEnquiries: 'Nouvelles demandes',
      awaitingReview: 'En attente d’examen',
      completionRate: 'Taux d’achèvement',
      completionRateAria: 'Taux d’achèvement des programmes',
      growth: 'Développement',
      recentEnquiries: 'Demandes récentes',
      newSuffix: 'nouvelles',
      updateEnquiryStatus: 'Modifier le statut de la demande',
      moveTo: 'Passer à…',
      update: 'Mettre à jour',
      noEnquiries: 'Aucune demande reçue pour le moment.',
      learning: 'Apprentissage',
      recentEnrollments: 'Inscriptions récentes',
      learner: 'Apprenant',
      publishedCourse: 'Cours publié',
      selectLearner: 'Sélectionner un apprenant',
      selectCourse: 'Sélectionner un cours',
      createEnrollment: 'Créer l’inscription',
      enrollmentReadiness: 'Un apprenant synchronisé et un cours publié sont requis avant de pouvoir créer une inscription.',
      updateEnrollmentStatus: 'Modifier le statut de l’inscription',
      noEnrollments: 'Aucune inscription d’apprenant pour le moment.',
      portfolio: 'Catalogue',
      programmeReadiness: 'État des programmes',
      recentSuffix: 'récents',
      programme: 'Programme',
      modules: 'Modules',
      enrollments: 'Inscriptions',
      status: 'Statut',
      updated: 'Mis à jour',
      published: 'Publié',
      draft: 'Brouillon',
      noCourses: 'Aucun cours n’a été synchronisé.',
    },
    search: {
      eyebrow: 'Recherche et découverte',
      title: 'Retrouvez les dossiers opérationnels.',
      intro: 'Recherchez les comptes actifs, l’identité et le routage des demandes ainsi que le catalogue de programmes sans exposer les messages des demandes ni le contenu pédagogique privé.',
      fieldLabel: 'Rechercher dans les dossiers administratifs',
      placeholder: 'Nom, e-mail, titre ou identifiant de programme',
      searching: 'Recherche…',
      search: 'Rechercher',
      results: 'Résultats',
      resultShown: 'résultat affiché',
      resultsShown: 'résultats affichés',
      noMatchingRecords: 'Aucun dossier correspondant',
      forQuery: 'Pour',
      people: 'Personnes',
      enquiries: 'Demandes',
      programmes: 'Programmes',
      firstTwenty: 'Affichage des 20 premiers résultats',
      accountCreated: 'Compte créé le',
      noPeople: 'Aucun compte actif ne correspond.',
      noEnquiries: 'Aucune identité de demande ne correspond.',
      noProgrammes: 'Aucun programme ne correspond.',
      published: 'Publié',
      draft: 'Brouillon',
      updated: 'Mis à jour le',
      minimumPrompt: 'Saisissez au moins 3 caractères pour rechercher.',
      privacyPrompt: 'Les résultats restent dans cet espace d’administration autorisé côté serveur et les termes protégés sont envoyés dans le corps de la requête plutôt que dans l’URL.',
    },
    finance: {
      eyebrow: 'Opérations financières',
      title: 'Facturation et paiements',
      intro: 'Gérez le cycle de vie des factures, les remboursements, les comptes d’entreprise et le rapprochement des règlements.',
      back: 'Retour aux opérations',
      invoices: 'Factures',
      recent: 'récentes',
      noInvoices: 'Aucune facture.',
      summaryAria: 'Résumé financier',
      payments: 'Paiements',
      refunds: 'Remboursements',
      corporateRecords: 'Dossiers d’entreprise',
      reconciliationExceptions: 'Écarts de rapprochement',
      reconciliation: 'Rapprochement',
      difference: 'écart',
      noReconciliation: 'Aucun dossier de rapprochement.',
    },
    certificates: {
      eyebrow: 'Gestion des attestations',
      title: 'Registre des certificats',
      intro: 'Émettez des certificats à partir des validations vérifiées, consultez leur historique d’audit et gérez les remplacements ou révocations.',
      back: 'Retour aux opérations',
      summaryAria: 'Résumé des certificats',
      eligibleCompletions: 'Validations éligibles',
      totalCertificates: 'Total des certificats',
      active: 'Actifs',
      revoked: 'Révoqués',
      readyForReview: 'Prêts pour vérification du certificat',
      recentRecords: '100 dossiers les plus récents',
      currentlyValid: 'Certificats actuellement valides',
      invalidated: 'Certificats invalidés',
      awaitingAction: 'En attente d’action',
      ready: 'prêts',
      issueCertificate: 'Émettre le certificat',
      noAwaitingTitle: 'Aucun certificat n’attend d’être émis.',
      noAwaitingBody: 'Un apprenant apparaît ici uniquement lorsqu’une inscription à un programme publié est marquée comme terminée avec une date d’achèvement.',
      history: 'Historique des certificats',
      issuedCertificates: 'Certificats émis',
      records: 'dossiers',
      issued: 'émis le',
      replacementReason: 'Motif du remplacement',
      replaceCertificate: 'Remplacer le certificat',
      revocationReason: 'Motif de révocation',
      issuedInError: 'Émis par erreur',
      misconduct: 'Faute',
      replacement: 'Remplacement',
      revokeCertificate: 'Révoquer le certificat',
      noIssuedTitle: 'Aucun certificat n’a encore été émis.',
      noIssuedBody: 'Les certificats émis et leur historique d’audit apparaîtront ici.',
    },
    notifications: {
      back: 'Vue d’ensemble',
      title: 'Livraison des notifications',
      intro: 'Les détails d’échec excluent le contenu des messages et les données privées des destinataires.',
      noFailures: 'Aucune livraison planifiée pour nouvelle tentative ou placée en échec définitif.',
      attempt: 'tentative',
      noErrorCode: 'Aucun code d’erreur',
      organization: 'Organisation',
      personal: 'Personnel',
      next: 'prochaine tentative',
    },
  },
  ar: {
    metadata: {
      title: 'الإدارة | أكاديمية لومينول',
      description: 'فضاء إدارة محمي لعمليات أكاديمية لومينول.',
    },
    shell: {
      aria: 'إدارة لومينول',
      navigationAria: 'التنقل في لوحة الإدارة',
      administration: 'الإدارة',
      administrator: 'المسؤول',
      overview: 'نظرة عامة',
      enquiries: 'الطلبات',
      learners: 'المتعلمون',
      programmes: 'البرامج',
      search: 'البحث',
      finance: 'المالية',
      protectedWorkspace: 'فضاء محمي',
      protectedNote: 'عمليات مصرّح بها من الخادم لفريق لومينول.',
      searchWorkspace: 'البحث التشغيلي',
      privacyNote: 'يقتصر البحث على الهوية التشغيلية ومسار الطلبات وبيانات البرامج الوصفية. لا يتم البحث في رسائل الطلبات أو محتوى التعلّم الحساس.',
    },
    dashboard: {
      topbarTitle: 'العمليات الأكاديمية',
      topbarSubtitle: 'نظرة مباشرة على المنصة',
      eyebrow: 'مركز العمليات',
      title: 'وضوح لكل فرع.',
      intro: 'واجهة موحدة للأشخاص والبرامج والطلبات ونشاط التعلّم عبر منظومة لومينول.',
      health: 'بيانات المنصة متصلة',
      summaryAria: 'ملخص العمليات',
      activePeople: 'الأشخاص النشطون',
      synchronizedAccounts: 'الحسابات المتزامنة',
      activeEnrollments: 'التسجيلات النشطة',
      learningNow: 'يتعلمون الآن',
      publishedCourses: 'الدورات المنشورة',
      availableProgrammes: 'البرامج المتاحة',
      newEnquiries: 'الطلبات الجديدة',
      awaitingReview: 'بانتظار المراجعة',
      completionRate: 'نسبة الإكمال',
      completionRateAria: 'نسبة إكمال البرامج',
      growth: 'النمو',
      recentEnquiries: 'أحدث الطلبات',
      newSuffix: 'جديد',
      updateEnquiryStatus: 'تحديث حالة الطلب',
      moveTo: 'نقل إلى…',
      update: 'تحديث',
      noEnquiries: 'لم تصل أي طلبات بعد.',
      learning: 'التعلّم',
      recentEnrollments: 'أحدث التسجيلات',
      learner: 'المتعلم',
      publishedCourse: 'الدورة المنشورة',
      selectLearner: 'اختر متعلماً',
      selectCourse: 'اختر دورة',
      createEnrollment: 'إنشاء تسجيل',
      enrollmentReadiness: 'يلزم وجود متعلم متزامن ودورة منشورة قبل إنشاء تسجيل جديد.',
      updateEnrollmentStatus: 'تحديث حالة التسجيل',
      noEnrollments: 'لا توجد تسجيلات للمتعلمين بعد.',
      portfolio: 'المحفظة',
      programmeReadiness: 'جاهزية البرامج',
      recentSuffix: 'حديث',
      programme: 'البرنامج',
      modules: 'الوحدات',
      enrollments: 'التسجيلات',
      status: 'الحالة',
      updated: 'آخر تحديث',
      published: 'منشور',
      draft: 'مسودة',
      noCourses: 'لم تتم مزامنة أي دورات بعد.',
    },
    search: {
      eyebrow: 'البحث والاستكشاف',
      title: 'اعثر على السجلات التشغيلية.',
      intro: 'ابحث في الحسابات النشطة وهوية الطلبات ومسارها وبيانات البرامج دون كشف رسائل الطلبات أو محتوى التعلّم الخاص.',
      fieldLabel: 'البحث في سجلات الإدارة',
      placeholder: 'اسم أو بريد إلكتروني أو عنوان برنامج أو معرّف',
      searching: 'جارٍ البحث…',
      search: 'بحث',
      results: 'النتائج',
      resultShown: 'نتيجة معروضة',
      resultsShown: 'نتائج معروضة',
      noMatchingRecords: 'لا توجد سجلات مطابقة',
      forQuery: 'للبحث',
      people: 'الأشخاص',
      enquiries: 'الطلبات',
      programmes: 'البرامج',
      firstTwenty: 'عرض أول 20 نتيجة',
      accountCreated: 'تاريخ إنشاء الحساب',
      noPeople: 'لا توجد حسابات نشطة مطابقة.',
      noEnquiries: 'لا توجد هويات طلبات مطابقة.',
      noProgrammes: 'لا توجد برامج مطابقة.',
      published: 'منشور',
      draft: 'مسودة',
      updated: 'آخر تحديث',
      minimumPrompt: 'أدخل 3 أحرف على الأقل للبحث.',
      privacyPrompt: 'تبقى النتائج داخل فضاء الإدارة المصرّح به من الخادم، وتُرسل مصطلحات البحث المحمية في جسم الطلب بدلاً من عنوان URL.',
    },
    finance: {
      eyebrow: 'العمليات المالية',
      title: 'الفوترة والمدفوعات',
      intro: 'إدارة دورة حياة الفواتير والاستردادات وحسابات المؤسسات وتسوية المدفوعات.',
      back: 'العودة إلى العمليات',
      invoices: 'الفواتير',
      recent: 'حديثة',
      noInvoices: 'لا توجد فواتير.',
      summaryAria: 'الملخص المالي',
      payments: 'المدفوعات',
      refunds: 'الاستردادات',
      corporateRecords: 'سجلات المؤسسات',
      reconciliationExceptions: 'فروقات التسوية',
      reconciliation: 'التسوية',
      difference: 'الفرق',
      noReconciliation: 'لا توجد سجلات تسوية.',
    },
    certificates: {
      eyebrow: 'عمليات الشهادات',
      title: 'سجل الشهادات',
      intro: 'إصدار الشهادات من حالات الإكمال الموثقة، ومراجعة سجل التدقيق، وإدارة الاستبدال أو الإلغاء.',
      back: 'العودة إلى العمليات',
      summaryAria: 'ملخص الشهادات',
      eligibleCompletions: 'حالات الإكمال المؤهلة',
      totalCertificates: 'إجمالي الشهادات',
      active: 'نشطة',
      revoked: 'ملغاة',
      readyForReview: 'جاهزة لمراجعة الشهادة',
      recentRecords: 'أحدث 100 سجل',
      currentlyValid: 'شهادات صالحة حالياً',
      invalidated: 'شهادات أُبطلت',
      awaitingAction: 'بانتظار الإجراء',
      ready: 'جاهز',
      issueCertificate: 'إصدار الشهادة',
      noAwaitingTitle: 'لا توجد شهادات بانتظار الإصدار.',
      noAwaitingBody: 'يظهر المتعلم هنا فقط بعد وضع تسجيله في برنامج منشور بحالة مكتمل مع تاريخ إكمال.',
      history: 'سجل الشهادات',
      issuedCertificates: 'الشهادات الصادرة',
      records: 'سجل',
      issued: 'تاريخ الإصدار',
      replacementReason: 'سبب الاستبدال',
      replaceCertificate: 'استبدال الشهادة',
      revocationReason: 'سبب الإلغاء',
      issuedInError: 'صدرت بالخطأ',
      misconduct: 'سوء سلوك',
      replacement: 'استبدال',
      revokeCertificate: 'إلغاء الشهادة',
      noIssuedTitle: 'لم يتم إصدار أي شهادات بعد.',
      noIssuedBody: 'ستظهر هنا الشهادات الصادرة وسجل التدقيق الخاص بها.',
    },
    notifications: {
      back: 'نظرة عامة',
      title: 'تسليم الإشعارات',
      intro: 'تفاصيل الإخفاق لا تتضمن محتوى الرسائل أو البيانات الخاصة بالمستلمين.',
      noFailures: 'لا توجد إشعارات مجدولة لإعادة المحاولة أو منقولة إلى قائمة الإخفاق النهائي.',
      attempt: 'محاولة',
      noErrorCode: 'لا يوجد رمز خطأ',
      organization: 'المؤسسة',
      personal: 'شخصي',
      next: 'الموعد التالي',
    },
  },
};

const ENUM_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    PSYCHOLOGY: 'Psychology', LANGUAGES: 'Languages', TRAINING: 'Professional training', GENERAL: 'General',
    NEW: 'New', IN_REVIEW: 'In review', CONTACTED: 'Contacted', ENROLLED: 'Enrolled', CLOSED: 'Closed', SPAM: 'Spam',
    PENDING: 'Pending', ACTIVE: 'Active', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
    DRAFT: 'Draft', OPEN: 'Open', PAID: 'Paid', VOID: 'Void', PAST_DUE: 'Past due', REFUNDED: 'Refunded',
    MATCHED: 'Matched', DISCREPANCY: 'Discrepancy',
    IN_APP: 'In app', EMAIL: 'Email', PROCESSING: 'Processing', DELIVERED: 'Delivered', RETRY_SCHEDULED: 'Retry scheduled', DEAD_LETTER: 'Dead letter',
    REVOKED: 'Revoked', SUPERSEDED: 'Superseded', ISSUED: 'Issued', REPLACEMENT_ISSUED: 'Replacement issued',
  },
  fr: {
    PSYCHOLOGY: 'Psychologie', LANGUAGES: 'Langues', TRAINING: 'Formation professionnelle', GENERAL: 'Général',
    NEW: 'Nouvelle', IN_REVIEW: 'En examen', CONTACTED: 'Contactée', ENROLLED: 'Inscrite', CLOSED: 'Clôturée', SPAM: 'Indésirable',
    PENDING: 'En attente', ACTIVE: 'Active', COMPLETED: 'Terminée', CANCELLED: 'Annulée',
    DRAFT: 'Brouillon', OPEN: 'Ouverte', PAID: 'Payée', VOID: 'Annulée', PAST_DUE: 'En retard', REFUNDED: 'Remboursée',
    MATCHED: 'Rapprochée', DISCREPANCY: 'Écart',
    IN_APP: 'Dans l’application', EMAIL: 'E-mail', PROCESSING: 'En traitement', DELIVERED: 'Livrée', RETRY_SCHEDULED: 'Nouvelle tentative planifiée', DEAD_LETTER: 'Échec définitif',
    REVOKED: 'Révoqué', SUPERSEDED: 'Remplacé', ISSUED: 'Émis', REPLACEMENT_ISSUED: 'Remplacement émis',
  },
  ar: {
    PSYCHOLOGY: 'علم النفس', LANGUAGES: 'اللغات', TRAINING: 'التكوين المهني', GENERAL: 'عام',
    NEW: 'جديد', IN_REVIEW: 'قيد المراجعة', CONTACTED: 'تم التواصل', ENROLLED: 'تم التسجيل', CLOSED: 'مغلق', SPAM: 'مزعج',
    PENDING: 'قيد الانتظار', ACTIVE: 'نشط', COMPLETED: 'مكتمل', CANCELLED: 'ملغى',
    DRAFT: 'مسودة', OPEN: 'مفتوحة', PAID: 'مدفوعة', VOID: 'ملغاة', PAST_DUE: 'متأخرة', REFUNDED: 'مستردة',
    MATCHED: 'متطابقة', DISCREPANCY: 'فرق',
    IN_APP: 'داخل التطبيق', EMAIL: 'بريد إلكتروني', PROCESSING: 'قيد المعالجة', DELIVERED: 'تم التسليم', RETRY_SCHEDULED: 'إعادة المحاولة مجدولة', DEAD_LETTER: 'إخفاق نهائي',
    REVOKED: 'ملغاة', SUPERSEDED: 'مستبدلة', ISSUED: 'تم الإصدار', REPLACEMENT_ISSUED: 'تم إصدار البديل',
  },
};

export function getAdminCopy(locale: Locale): AdminCopy {
  return ADMIN_COPY[locale];
}

export function getAdminEnumLabel(locale: Locale, value: string): string {
  return (
    ENUM_LABELS[locale][value] ??
    value
      .replaceAll('_', ' ')
      .toLocaleLowerCase('en')
      .replace(/^./, (character) => character.toUpperCase())
  );
}
