import { SignUp } from '@luminol/auth';

export default function Page() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main aria-label="sign up">
        <p>Authentication is unavailable in this environment.</p>
      </main>
    );
  }
  return (
    <main aria-label="sign up">
      <SignUp routing="hash" />
    </main>
  );
}
