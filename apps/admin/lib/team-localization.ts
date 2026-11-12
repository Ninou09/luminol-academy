import type { StaffRoleKey } from '@luminol/database/staff-roles';
import type { Locale } from '@luminol/localization';

export type TeamCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  findTitle: string;
  findIntro: string;
  emailLabel: string;
  find: string;
  notFound: string;
  ownAccount: string;
  staffTitle: string;
  staffIntro: string;
  noStaff: string;
  grant: string;
  revoke: string;
  roles: string;
  noRoles: string;
  auditTitle: string;
  noAudit: string;
  granted: string;
  revoked: string;
  by: string;
  adminNote: string;
  roleName: Record<StaffRoleKey, string>;
  roleDescription: Record<StaffRoleKey, string>;
};

const english: TeamCopy = {
  eyebrow: 'Luminol Operations',
  title: 'Team',
  intro:
    'Give each team member only the workspace they need. Changes take effect on their next page load and are recorded in the audit history below.',
  findTitle: 'Find a team member',
  findIntro:
    'The person must have signed in to Luminol at least once so their account exists.',
  emailLabel: 'Account email',
  find: 'Find',
  notFound: 'No active account uses this email yet.',
  ownAccount: 'You cannot change roles on your own account.',
  staffTitle: 'Current staff',
  staffIntro: 'Accounts that hold at least one governed staff role.',
  noStaff: 'No staff roles have been granted yet.',
  grant: 'Grant',
  revoke: 'Revoke',
  roles: 'Roles',
  noRoles: 'No staff roles',
  auditTitle: 'Role history',
  noAudit: 'No role changes recorded yet.',
  granted: 'granted',
  revoked: 'revoked',
  by: 'by',
  adminNote: 'Platform administration is never granted from this page.',
  roleName: {
    staff: 'Trainer',
    'enquiry-agent': 'Enquiry follow-up',
  },
  roleDescription: {
    staff:
      'Can be assigned as an instructor on cohorts and run sessions and attendance in the portal.',
    'enquiry-agent':
      'Works the enquiry desk: ownership, follow-up plans, outcomes and status. No finance or consultations.',
  },
};

const french: TeamCopy = {
  eyebrow: 'Luminol Opérations',
  title: 'Équipe',
  intro:
    'Donnez à chaque membre uniquement l’espace dont il a besoin. Les changements s’appliquent au prochain chargement de page et sont tracés dans l’historique ci-dessous.',
  findTitle: 'Trouver un membre',
  findIntro:
    'La personne doit s’être connectée au moins une fois à Luminol pour que son compte existe.',
  emailLabel: 'E-mail du compte',
  find: 'Rechercher',
  notFound: 'Aucun compte actif n’utilise encore cet e-mail.',
  ownAccount: 'Vous ne pouvez pas modifier les rôles de votre propre compte.',
  staffTitle: 'Équipe actuelle',
  staffIntro: 'Comptes disposant d’au moins un rôle d’équipe encadré.',
  noStaff: 'Aucun rôle d’équipe attribué pour le moment.',
  grant: 'Attribuer',
  revoke: 'Retirer',
  roles: 'Rôles',
  noRoles: 'Aucun rôle d’équipe',
  auditTitle: 'Historique des rôles',
  noAudit: 'Aucun changement de rôle enregistré.',
  granted: 'attribué',
  revoked: 'retiré',
  by: 'par',
  adminNote:
    'L’administration de la plateforme n’est jamais attribuée depuis cette page.',
  roleName: {
    staff: 'Formateur',
    'enquiry-agent': 'Suivi des demandes',
  },
  roleDescription: {
    staff:
      'Peut être affecté comme formateur sur des cohortes et gérer séances et présences dans le portail.',
    'enquiry-agent':
      'Traite les demandes : responsable, plan de relance, résultat et statut. Pas de finances ni de consultations.',
  },
};

const arabic: TeamCopy = {
  eyebrow: 'عمليات Luminol',
  title: 'الفريق',
  intro:
    'امنح كل عضو في الفريق مساحة العمل التي يحتاجها فقط. تُطبَّق التغييرات عند تحميل الصفحة التالي وتُسجَّل في السجل أدناه.',
  findTitle: 'البحث عن عضو',
  findIntro:
    'يجب أن يكون الشخص قد سجّل الدخول إلى Luminol مرة واحدة على الأقل حتى يوجد حسابه.',
  emailLabel: 'البريد الإلكتروني للحساب',
  find: 'بحث',
  notFound: 'لا يوجد حساب نشط بهذا البريد بعد.',
  ownAccount: 'لا يمكنك تعديل أدوار حسابك الخاص.',
  staffTitle: 'الفريق الحالي',
  staffIntro: 'الحسابات التي تملك دورًا واحدًا على الأقل من أدوار الفريق.',
  noStaff: 'لم يُمنح أي دور للفريق بعد.',
  grant: 'منح',
  revoke: 'سحب',
  roles: 'الأدوار',
  noRoles: 'لا أدوار للفريق',
  auditTitle: 'سجل الأدوار',
  noAudit: 'لا توجد تغييرات مسجلة على الأدوار بعد.',
  granted: 'مُنح',
  revoked: 'سُحب',
  by: 'بواسطة',
  adminNote: 'لا تُمنح إدارة المنصة أبدًا من هذه الصفحة.',
  roleName: {
    staff: 'مكوّن',
    'enquiry-agent': 'متابعة الطلبات',
  },
  roleDescription: {
    staff: 'يمكن تعيينه مكوّنًا على الأفواج وإدارة الحصص والحضور في البوابة.',
    'enquiry-agent':
      'يعالج الطلبات: المسؤولية وخطة المتابعة والنتيجة والحالة. بدون مالية أو استشارات.',
  },
};

const copies: Record<Locale, TeamCopy> = {
  en: english,
  fr: french,
  ar: arabic,
};

export function getTeamCopy(locale: Locale): TeamCopy {
  return copies[locale];
}
