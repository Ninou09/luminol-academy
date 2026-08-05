import { UserButton } from '@clerk/nextjs';
import { requireUser } from '@luminol/auth';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default async function AccountPage() {
  const user = await requireUser();
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Learner';
  const roles = user.roles.map(({ role }) => role.name);

  return (
    <main>
      <header className="portal-header">
        <Link href="/" className="brand-link" aria-label="Luminol learner home">
          <Wordmark />
        </Link>
        <div className="portal-account">
          <Link href="/">Dashboard</Link>
          <UserButton />
        </div>
      </header>

      <div className="course-shell">
        <Link className="back-link" href="/">
          ← Back to dashboard
        </Link>

        <section className="course-hero" aria-labelledby="account-title">
          <div>
            <p className="eyebrow">Secure learner account</p>
            <h1 id="account-title">{name}</h1>
            <p>
              Review the identity synchronized with Luminol and the access
              assigned to your learner account.
            </p>
          </div>
          <aside className="course-progress-card" aria-label="Account status">
            <strong>Active</strong>
            <span>Account status</span>
            <p>
              Your Clerk identity is synchronized with the Luminol database.
            </p>
          </aside>
        </section>

        <section className="curriculum" aria-label="Account details">
          <article className="module">
            <div className="module-heading">
              <span>Identity</span>
              <h2>Profile details</h2>
              <p>
                Identity changes are managed securely through your account menu.
              </p>
            </div>
            <dl className="lesson-list">
              <div className="lesson">
                <dt className="lesson-number" aria-hidden="true">
                  01
                </dt>
                <dd className="lesson-copy">
                  <div>Email</div>
                  <h3>{user.email}</h3>
                  <p>Primary synchronized email address.</p>
                </dd>
              </div>
              <div className="lesson">
                <dt className="lesson-number" aria-hidden="true">
                  02
                </dt>
                <dd className="lesson-copy">
                  <div>Access</div>
                  <h3>{roles.length > 0 ? roles.join(', ') : 'Learner'}</h3>
                  <p>Roles currently assigned to this account.</p>
                </dd>
              </div>
              <div className="lesson">
                <dt className="lesson-number" aria-hidden="true">
                  03
                </dt>
                <dd className="lesson-copy">
                  <div>Last sign-in</div>
                  <h3>
                    {user.lastSignInAt
                      ? dateFormatter.format(user.lastSignInAt)
                      : 'Not recorded yet'}
                  </h3>
                  <p>Latest sign-in timestamp received from Clerk.</p>
                </dd>
              </div>
            </dl>
          </article>
        </section>
      </div>

      <footer>
        <span>© Luminol</span>
        <span lang="ar" dir="rtl">
          للتعلّم أثرٌ يدوم
        </span>
        <span>Le savoir nous éclaire</span>
      </footer>
    </main>
  );
}
