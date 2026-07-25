import { Wordmark } from '@luminol/ui';
import { requireUser } from '@luminol/auth';
export default async function Page() {
  const user = await requireUser();
  return (
    <main>
      <nav>
        <Wordmark />
        <span className="portal-label">Learner portal</span>
      </nav>
      <section className="welcome">
        <p className="eyebrow">Your learning space</p>
        <h1>Welcome{user.firstName ? `, ${user.firstName}` : ''}.</h1>
        <p>
          Sign in to access your programmes, resources and learning community.
        </p>
        <p>Your secure learner account is ready.</p>
      </section>
      <footer>للتعلّم أثرٌ يدوم · Le savoir nous éclaire</footer>
    </main>
  );
}
