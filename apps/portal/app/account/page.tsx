import { requireUser } from '@luminol/auth';
import {
  formatLocalizedDate,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../../components/portal-header';
import {
  getPortalCopy,
  getPortalStatusLabel,
} from '../../lib/portal-localization';
import { getPortalRequestLocale } from '../../lib/request-locale';

const accountExtras = {
  en: {
    back: 'Back to dashboard',
    learner: 'Learner',
    active: 'Active',
    status: 'Account status',
    synchronized:
      'Your protected identity is synchronized with the Luminol database.',
    profile: 'Profile details',
    identityChanges:
      'Identity changes are managed securely through your account menu.',
    primaryEmail: 'Primary synchronized email address.',
    access: 'Access',
    rolesBody: 'Roles currently assigned to this account.',
    lastSignIn: 'Last sign-in',
    notRecorded: 'Not recorded yet',
    lastSignInBody:
      'Latest sign-in timestamp received from the protected identity provider.',
    footer: 'Learning with lasting impact',
  },
  fr: {
    back: 'Retour au tableau de bord',
    learner: 'Apprenant',
    active: 'Actif',
    status: 'Statut du compte',
    synchronized:
      'Votre identité protégée est synchronisée avec la base de données Luminol.',
    profile: 'Détails du profil',
    identityChanges:
      'Les modifications d’identité sont gérées de manière sécurisée depuis le menu de votre compte.',
    primaryEmail: 'Adresse e-mail principale synchronisée.',
    access: 'Accès',
    rolesBody: 'Rôles actuellement attribués à ce compte.',
    lastSignIn: 'Dernière connexion',
    notRecorded: 'Pas encore enregistrée',
    lastSignInBody:
      'Dernière date de connexion reçue du fournisseur d’identité protégé.',
    footer: 'Un apprentissage qui laisse une trace durable',
  },
  ar: {
    back: 'العودة إلى لوحة التعلّم',
    learner: 'متعلّم',
    active: 'نشط',
    status: 'حالة الحساب',
    synchronized: 'هويتك المحمية متزامنة مع قاعدة بيانات لومينول.',
    profile: 'تفاصيل الملف',
    identityChanges: 'تُدار تغييرات الهوية بأمان من خلال قائمة حسابك.',
    primaryEmail: 'البريد الإلكتروني الأساسي المتزامن.',
    access: 'الوصول',
    rolesBody: 'الأدوار المعيّنة حالياً لهذا الحساب.',
    lastSignIn: 'آخر تسجيل دخول',
    notRecorded: 'لم يُسجّل بعد',
    lastSignInBody: 'آخر وقت لتسجيل الدخول وصل من مزوّد الهوية المحمي.',
    footer: 'للتعلّم أثرٌ يدوم',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export default async function AccountPage() {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale).account;
  const extras = accountExtras[locale];
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || extras.learner;
  const roles = user.roles.map(({ role }) => role.name);

  return (
    <main>
      <PortalHeader />

      <div className="course-shell">
        <Link className="back-link" href={localizeHref(locale, '/')}>
          ← {extras.back}
        </Link>

        <section className="course-hero" aria-labelledby="account-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="account-title" dir="auto">
              {name}
            </h1>
            <p>{copy.intro}</p>
          </div>
          <aside className="course-progress-card" aria-label={extras.status}>
            <strong>{getPortalStatusLabel(locale, 'ACTIVE')}</strong>
            <span>{extras.status}</span>
            <p>{extras.synchronized}</p>
          </aside>
        </section>

        <section className="curriculum" aria-label={copy.identity}>
          <article className="module">
            <div className="module-heading">
              <span>{copy.identity}</span>
              <h2>{extras.profile}</h2>
              <p>{extras.identityChanges}</p>
            </div>
            <dl className="lesson-list">
              <div className="lesson">
                <dt className="lesson-number" aria-hidden="true">
                  01
                </dt>
                <dd className="lesson-copy">
                  <div>{copy.email}</div>
                  <h3 dir="auto">{user.email}</h3>
                  <p>{extras.primaryEmail}</p>
                </dd>
              </div>
              <div className="lesson">
                <dt className="lesson-number" aria-hidden="true">
                  02
                </dt>
                <dd className="lesson-copy">
                  <div>{extras.access}</div>
                  <h3 dir="auto">
                    {roles.length > 0 ? roles.join(', ') : extras.learner}
                  </h3>
                  <p>{extras.rolesBody}</p>
                </dd>
              </div>
              <div className="lesson">
                <dt className="lesson-number" aria-hidden="true">
                  03
                </dt>
                <dd className="lesson-copy">
                  <div>{extras.lastSignIn}</div>
                  <h3>
                    {user.lastSignInAt
                      ? formatLocalizedDate(user.lastSignInAt, locale, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : extras.notRecorded}
                  </h3>
                  <p>{extras.lastSignInBody}</p>
                </dd>
              </div>
            </dl>
          </article>
        </section>
      </div>

      <footer>
        <span>© Luminol</span>
        <span>{extras.footer}</span>
      </footer>
    </main>
  );
}
