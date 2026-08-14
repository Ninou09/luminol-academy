import type { Locale } from '@luminol/localization';

export type OrganizationAdminCopy = {
  metadataTitle: string;
  milestoneEyebrow: string;
  title: string;
  intro: string;
  back: string;
  findEyebrow: string;
  findTitle: string;
  page: string;
  of: string;
  organizationsCount: string;
  organizationName: string;
  userSearch: string;
  courseSearch: string;
  search: string;
  clearFilters: string;
  selectorLimit: string;
  collectionLimit: string;
  createEyebrow: string;
  newOrganization: string;
  seatLimit: string;
  createOrganization: string;
  noOrganizations: string;
  archived: string;
  summaryAria: string;
  persistedSeats: string;
  activeMemberships: string;
  activeTeams: string;
  assignedCourses: string;
  sponsoredCompletion: string;
  completed: string;
  memberships: string;
  user: string;
  selectUser: string;
  role: string;
  addOrReactivate: string;
  changeRole: string;
  deactivate: string;
  seats: string;
  activeMember: string;
  selectMember: string;
  allocateSeat: string;
  nextSeatStatus: string;
  moveTo: string;
  updateSeat: string;
  teams: string;
  teamName: string;
  createTeam: string;
  members: string;
  addMember: string;
  add: string;
  remove: string;
  archiveTeam: string;
  assignedLearning: string;
  publishedCourse: string;
  selectCourse: string;
  assignCourse: string;
  unassignCourse: string;
  mutationsDisabled: string;
  previousOrganizations: string;
  nextOrganizations: string;
  loading: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  notFoundTitle: string;
  notFoundBody: string;
  returnOrganizations: string;
  enumLabels: Record<string, string>;
};

const COPY: Record<Locale, OrganizationAdminCopy> = {
  en: {
    metadataTitle: 'Organizations | Luminol Administration',
    milestoneEyebrow: 'Milestone 16',
    title: 'Organizations & team learning',
    intro:
      'Academy-only administration for organization memberships, teams, seats, assigned learning and privacy-safe aggregate completion.',
    back: 'Back to administration',
    findEyebrow: 'Find',
    findTitle: 'Administration search',
    page: 'Page',
    of: 'of',
    organizationsCount: 'organizations',
    organizationName: 'Organization name',
    userSearch: 'User name or email',
    courseSearch: 'Published course',
    search: 'Search',
    clearFilters: 'Clear filters',
    selectorLimit:
      'User and course selectors show up to {count} matching results. Narrow the search to reach records outside the initial result set.',
    collectionLimit:
      'Each organization section shows up to {count} matching records. Use member, team, or course search to reach records outside the current slice.',
    createEyebrow: 'Create',
    newOrganization: 'New organization',
    seatLimit: 'Seat limit',
    createOrganization: 'Create organization',
    noOrganizations: 'No organizations have been created yet.',
    archived: 'Archived',
    summaryAria: 'Organization summary',
    persistedSeats: 'Persisted seats',
    activeMemberships: 'Active memberships',
    activeTeams: 'Active teams',
    assignedCourses: 'Assigned courses',
    sponsoredCompletion: 'Sponsored completion',
    completed: 'completed',
    memberships: 'Memberships',
    user: 'User',
    selectUser: 'Select user',
    role: 'Role',
    addOrReactivate: 'Add or reactivate',
    changeRole: 'Change role',
    deactivate: 'Deactivate',
    seats: 'Seats',
    activeMember: 'Active member',
    selectMember: 'Select member',
    allocateSeat: 'Allocate seat',
    nextSeatStatus: 'Next seat status',
    moveTo: 'Move to',
    updateSeat: 'Update seat',
    teams: 'Teams',
    teamName: 'Team name',
    createTeam: 'Create team',
    members: 'members',
    addMember: 'Add member',
    add: 'Add',
    remove: 'Remove',
    archiveTeam: 'Archive team',
    assignedLearning: 'Assigned learning',
    publishedCourse: 'Published course',
    selectCourse: 'Select course',
    assignCourse: 'Assign course',
    unassignCourse: 'Unassign',
    mutationsDisabled: 'Mutations are disabled for archived organizations.',
    previousOrganizations: 'Previous organizations',
    nextOrganizations: 'Next organizations',
    loading: 'Loading organization administration…',
    errorTitle: 'Organization administration is unavailable',
    errorBody:
      'No organization mutation was assumed to have succeeded. Retry the protected workspace after checking the current data state.',
    retry: 'Retry',
    notFoundTitle: 'Organization record not found',
    notFoundBody: 'The requested organization scope does not exist.',
    returnOrganizations: 'Return to organizations',
    enumLabels: {
      OWNER: 'Owner',
      MANAGER: 'Manager',
      LEARNER: 'Learner',
      INVITED: 'Invited',
      SUSPENDED: 'Suspended',
      ARCHIVED: 'Archived',
    },
  },
  fr: {
    metadataTitle: 'Organisations | Administration Luminol',
    milestoneEyebrow: 'Jalon 16',
    title: 'Organisations et apprentissage en équipe',
    intro:
      'Administration réservée à l’académie pour les adhésions, équipes, places, apprentissages attribués et agrégats d’achèvement respectueux de la confidentialité.',
    back: 'Retour à l’administration',
    findEyebrow: 'Trouver',
    findTitle: 'Recherche administrative',
    page: 'Page',
    of: 'sur',
    organizationsCount: 'organisations',
    organizationName: 'Nom de l’organisation',
    userSearch: 'Nom ou e-mail de l’utilisateur',
    courseSearch: 'Cours publié',
    search: 'Rechercher',
    clearFilters: 'Effacer les filtres',
    selectorLimit:
      'Les sélecteurs d’utilisateurs et de cours affichent jusqu’à {count} résultats. Affinez la recherche pour atteindre les autres dossiers.',
    collectionLimit:
      'Chaque section d’organisation affiche jusqu’à {count} dossiers correspondants. Utilisez la recherche de membre, d’équipe ou de cours pour atteindre les autres dossiers.',
    createEyebrow: 'Créer',
    newOrganization: 'Nouvelle organisation',
    seatLimit: 'Limite de places',
    createOrganization: 'Créer l’organisation',
    noOrganizations: 'Aucune organisation n’a encore été créée.',
    archived: 'Archivée',
    summaryAria: 'Résumé de l’organisation',
    persistedSeats: 'Places enregistrées',
    activeMemberships: 'Adhésions actives',
    activeTeams: 'Équipes actives',
    assignedCourses: 'Cours attribués',
    sponsoredCompletion: 'Achèvement sponsorisé',
    completed: 'terminés',
    memberships: 'Adhésions',
    user: 'Utilisateur',
    selectUser: 'Sélectionner un utilisateur',
    role: 'Rôle',
    addOrReactivate: 'Ajouter ou réactiver',
    changeRole: 'Modifier le rôle',
    deactivate: 'Désactiver',
    seats: 'Places',
    activeMember: 'Membre actif',
    selectMember: 'Sélectionner un membre',
    allocateSeat: 'Attribuer une place',
    nextSeatStatus: 'Prochain statut de la place',
    moveTo: 'Passer à',
    updateSeat: 'Mettre à jour la place',
    teams: 'Équipes',
    teamName: 'Nom de l’équipe',
    createTeam: 'Créer l’équipe',
    members: 'membres',
    addMember: 'Ajouter un membre',
    add: 'Ajouter',
    remove: 'Retirer',
    archiveTeam: 'Archiver l’équipe',
    assignedLearning: 'Apprentissage attribué',
    publishedCourse: 'Cours publié',
    selectCourse: 'Sélectionner un cours',
    assignCourse: 'Attribuer le cours',
    unassignCourse: 'Retirer l’attribution',
    mutationsDisabled:
      'Les modifications sont désactivées pour les organisations archivées.',
    previousOrganizations: 'Organisations précédentes',
    nextOrganizations: 'Organisations suivantes',
    loading: 'Chargement de l’administration des organisations…',
    errorTitle: 'L’administration des organisations est indisponible',
    errorBody:
      'Aucune modification d’organisation n’est considérée comme réussie. Réessayez après avoir vérifié l’état actuel des données.',
    retry: 'Réessayer',
    notFoundTitle: 'Organisation introuvable',
    notFoundBody: 'Le périmètre d’organisation demandé n’existe pas.',
    returnOrganizations: 'Retour aux organisations',
    enumLabels: {
      OWNER: 'Propriétaire',
      MANAGER: 'Gestionnaire',
      LEARNER: 'Apprenant',
      INVITED: 'Invité',
      SUSPENDED: 'Suspendue',
      ARCHIVED: 'Archivée',
    },
  },
  ar: {
    metadataTitle: 'المؤسسات | إدارة لومينول',
    milestoneEyebrow: 'المرحلة 16',
    title: 'المؤسسات والتعلّم الجماعي',
    intro:
      'إدارة مخصّصة للأكاديمية لعضويات المؤسسات والفرق والمقاعد والتعلّم المسند ومؤشرات الإكمال المجمّعة مع احترام الخصوصية.',
    back: 'العودة إلى الإدارة',
    findEyebrow: 'بحث',
    findTitle: 'البحث في إدارة المؤسسات',
    page: 'الصفحة',
    of: 'من',
    organizationsCount: 'مؤسسات',
    organizationName: 'اسم المؤسسة',
    userSearch: 'اسم المستخدم أو البريد الإلكتروني',
    courseSearch: 'الدورة المنشورة',
    search: 'بحث',
    clearFilters: 'مسح عوامل التصفية',
    selectorLimit:
      'تعرض قوائم المستخدمين والدورات حتى {count} نتيجة مطابقة. ضيّق البحث للوصول إلى السجلات الأخرى.',
    collectionLimit:
      'يعرض كل قسم للمؤسسة حتى {count} سجلاً مطابقاً. استخدم بحث العضو أو الفريق أو الدورة للوصول إلى السجلات الأخرى.',
    createEyebrow: 'إنشاء',
    newOrganization: 'مؤسسة جديدة',
    seatLimit: 'حد المقاعد',
    createOrganization: 'إنشاء المؤسسة',
    noOrganizations: 'لم يتم إنشاء أي مؤسسة بعد.',
    archived: 'مؤرشفة',
    summaryAria: 'ملخص المؤسسة',
    persistedSeats: 'المقاعد المسجلة',
    activeMemberships: 'العضويات النشطة',
    activeTeams: 'الفرق النشطة',
    assignedCourses: 'الدورات المسندة',
    sponsoredCompletion: 'إكمال التعلّم المموّل',
    completed: 'مكتمل',
    memberships: 'العضويات',
    user: 'المستخدم',
    selectUser: 'اختر مستخدماً',
    role: 'الدور',
    addOrReactivate: 'إضافة أو إعادة تفعيل',
    changeRole: 'تغيير الدور',
    deactivate: 'إلغاء التفعيل',
    seats: 'المقاعد',
    activeMember: 'عضو نشط',
    selectMember: 'اختر عضواً',
    allocateSeat: 'تخصيص مقعد',
    nextSeatStatus: 'حالة المقعد التالية',
    moveTo: 'نقل إلى',
    updateSeat: 'تحديث المقعد',
    teams: 'الفرق',
    teamName: 'اسم الفريق',
    createTeam: 'إنشاء فريق',
    members: 'أعضاء',
    addMember: 'إضافة عضو',
    add: 'إضافة',
    remove: 'إزالة',
    archiveTeam: 'أرشفة الفريق',
    assignedLearning: 'التعلّم المسند',
    publishedCourse: 'الدورة المنشورة',
    selectCourse: 'اختر دورة',
    assignCourse: 'إسناد الدورة',
    unassignCourse: 'إلغاء الإسناد',
    mutationsDisabled: 'تم تعطيل التعديلات للمؤسسات المؤرشفة.',
    previousOrganizations: 'المؤسسات السابقة',
    nextOrganizations: 'المؤسسات التالية',
    loading: 'جارٍ تحميل إدارة المؤسسات…',
    errorTitle: 'إدارة المؤسسات غير متاحة حالياً',
    errorBody:
      'لم نفترض نجاح أي تعديل على المؤسسة. أعد المحاولة بعد التحقق من الحالة الحالية للبيانات.',
    retry: 'إعادة المحاولة',
    notFoundTitle: 'لم يتم العثور على المؤسسة',
    notFoundBody: 'نطاق المؤسسة المطلوب غير موجود.',
    returnOrganizations: 'العودة إلى المؤسسات',
    enumLabels: {
      OWNER: 'المالك',
      MANAGER: 'المسيّر',
      LEARNER: 'المتعلم',
      INVITED: 'مدعو',
      SUSPENDED: 'معلّقة',
      ARCHIVED: 'مؤرشفة',
    },
  },
};

export function getOrganizationAdminCopy(locale: Locale) {
  return COPY[locale];
}
