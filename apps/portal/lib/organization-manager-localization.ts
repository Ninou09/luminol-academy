import type { Locale } from '@luminol/localization';

export type OrganizationManagerCopy = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  privacy: string;
  organizations: string;
  organizationStatus: string;
  yourRole: string;
  seatUtilization: string;
  seatLimit: string;
  allocatedSeats: string;
  availableSeats: string;
  activeSeats: string;
  completedSeats: string;
  invitedSeats: string;
  sponsoredProgress: string;
  assignments: string;
  completedAssignments: string;
  completion: string;
  teams: string;
  members: string;
  roster: string;
  allMembers: string;
  filterTeam: string;
  email: string;
  joined: string;
  assignedLearning: string;
  assigned: string;
  sponsoredLearners: string;
  noTeams: string;
  noRoster: string;
  noCourses: string;
  previous: string;
  next: string;
  page: string;
  of: string;
  roleLabels: Record<string, string>;
  statusLabels: Record<string, string>;
};

const COPY: Record<Locale, OrganizationManagerCopy> = {
  en: {
    nav: 'Organization',
    eyebrow: 'Organization workspace',
    title: 'Team learning overview',
    intro:
      'View the roster, seat use, assigned learning and approved aggregate progress for organizations you manage.',
    privacy:
      'This workspace shows organization roster identity and aggregate learning totals only. Assessment answers, psychology content, enquiries, personal finance and private certificate metadata are not available here.',
    organizations: 'Organizations you manage',
    organizationStatus: 'Organization status',
    yourRole: 'Your role',
    seatUtilization: 'Seat utilization',
    seatLimit: 'Seat limit',
    allocatedSeats: 'Allocated seats',
    availableSeats: 'Available seats',
    activeSeats: 'Active seats',
    completedSeats: 'Completed seats',
    invitedSeats: 'Invited seats',
    sponsoredProgress: 'Sponsored learning progress',
    assignments: 'Sponsored assignments',
    completedAssignments: 'Completed assignments',
    completion: 'Completion',
    teams: 'Teams',
    members: 'members',
    roster: 'Roster',
    allMembers: 'All active members',
    filterTeam: 'View team roster',
    email: 'Email',
    joined: 'Joined',
    assignedLearning: 'Assigned learning',
    assigned: 'Assigned',
    sponsoredLearners: 'Sponsored learners',
    noTeams: 'No active teams are available.',
    noRoster: 'No active members match this roster.',
    noCourses: 'No active learning assignments are available.',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    roleLabels: {
      OWNER: 'Owner',
      MANAGER: 'Manager',
      LEARNER: 'Learner',
    },
    statusLabels: {
      ACTIVE: 'Active',
      SUSPENDED: 'Suspended',
      ARCHIVED: 'Archived',
    },
  },
  fr: {
    nav: 'Organisation',
    eyebrow: 'Espace organisation',
    title: 'Vue d’ensemble de l’apprentissage en équipe',
    intro:
      'Consultez l’effectif, l’utilisation des places, les apprentissages attribués et les agrégats de progression approuvés pour les organisations que vous gérez.',
    privacy:
      'Cet espace affiche uniquement l’identité des membres de l’organisation et des totaux d’apprentissage agrégés. Les réponses d’évaluation, le contenu psychologique, les demandes, les finances personnelles et les métadonnées privées des certificats n’y sont pas disponibles.',
    organizations: 'Organisations que vous gérez',
    organizationStatus: 'Statut de l’organisation',
    yourRole: 'Votre rôle',
    seatUtilization: 'Utilisation des places',
    seatLimit: 'Limite de places',
    allocatedSeats: 'Places attribuées',
    availableSeats: 'Places disponibles',
    activeSeats: 'Places actives',
    completedSeats: 'Places terminées',
    invitedSeats: 'Invitations',
    sponsoredProgress: 'Progression des apprentissages sponsorisés',
    assignments: 'Attributions sponsorisées',
    completedAssignments: 'Attributions terminées',
    completion: 'Achèvement',
    teams: 'Équipes',
    members: 'membres',
    roster: 'Effectif',
    allMembers: 'Tous les membres actifs',
    filterTeam: 'Voir l’effectif de l’équipe',
    email: 'E-mail',
    joined: 'Inscrit le',
    assignedLearning: 'Apprentissages attribués',
    assigned: 'Attribué le',
    sponsoredLearners: 'Apprenants sponsorisés',
    noTeams: 'Aucune équipe active n’est disponible.',
    noRoster: 'Aucun membre actif ne correspond à cet effectif.',
    noCourses: 'Aucun apprentissage actif n’est attribué.',
    previous: 'Précédent',
    next: 'Suivant',
    page: 'Page',
    of: 'sur',
    roleLabels: {
      OWNER: 'Propriétaire',
      MANAGER: 'Gestionnaire',
      LEARNER: 'Apprenant',
    },
    statusLabels: {
      ACTIVE: 'Active',
      SUSPENDED: 'Suspendue',
      ARCHIVED: 'Archivée',
    },
  },
  ar: {
    nav: 'المؤسسة',
    eyebrow: 'مساحة المؤسسة',
    title: 'نظرة عامة على تعلّم الفريق',
    intro:
      'اطّلع على قائمة الأعضاء واستخدام المقاعد والتعلّم المسند ومؤشرات التقدّم المجمّعة المعتمدة للمؤسسات التي تديرها.',
    privacy:
      'تعرض هذه المساحة هوية أعضاء المؤسسة وإجماليات التعلّم المجمّعة فقط. لا تتوفر هنا إجابات التقييم أو المحتوى النفسي أو الاستفسارات أو البيانات المالية الشخصية أو بيانات الشهادات الخاصة.',
    organizations: 'المؤسسات التي تديرها',
    organizationStatus: 'حالة المؤسسة',
    yourRole: 'دورك',
    seatUtilization: 'استخدام المقاعد',
    seatLimit: 'حد المقاعد',
    allocatedSeats: 'المقاعد المخصصة',
    availableSeats: 'المقاعد المتاحة',
    activeSeats: 'المقاعد النشطة',
    completedSeats: 'المقاعد المكتملة',
    invitedSeats: 'الدعوات',
    sponsoredProgress: 'تقدّم التعلّم المموّل',
    assignments: 'الإسنادات المموّلة',
    completedAssignments: 'الإسنادات المكتملة',
    completion: 'نسبة الإكمال',
    teams: 'الفرق',
    members: 'أعضاء',
    roster: 'قائمة الأعضاء',
    allMembers: 'جميع الأعضاء النشطين',
    filterTeam: 'عرض أعضاء الفريق',
    email: 'البريد الإلكتروني',
    joined: 'تاريخ الانضمام',
    assignedLearning: 'التعلّم المسند',
    assigned: 'تاريخ الإسناد',
    sponsoredLearners: 'المتعلمون المموّلون',
    noTeams: 'لا توجد فرق نشطة.',
    noRoster: 'لا يوجد أعضاء نشطون ضمن هذه القائمة.',
    noCourses: 'لا توجد برامج تعلم نشطة مسندة.',
    previous: 'السابق',
    next: 'التالي',
    page: 'الصفحة',
    of: 'من',
    roleLabels: {
      OWNER: 'المالك',
      MANAGER: 'المسيّر',
      LEARNER: 'المتعلم',
    },
    statusLabels: {
      ACTIVE: 'نشطة',
      SUSPENDED: 'معلّقة',
      ARCHIVED: 'مؤرشفة',
    },
  },
};

export function getOrganizationManagerCopy(locale: Locale) {
  return COPY[locale];
}
