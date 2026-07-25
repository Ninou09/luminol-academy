import { Wordmark } from '@luminol/ui';
export default function Page() {
  return (
    <main>
      <nav>
        <Wordmark />
        <span className="portal-label">Learner portal</span>
      </nav>
      <section className="welcome">
        <p className="eyebrow">Your learning space</p>
        <h1>Welcome to Luminol.</h1>
        <p>
          Sign in to access your programmes, resources and learning community.
        </p>
        <button type="button">Sign in to continue</button>
        <small>Secure access powered by Clerk</small>
      </section>
      <footer>للتعلّم أثرٌ يدوم · Le savoir nous éclaire</footer>
    </main>
  );
}
