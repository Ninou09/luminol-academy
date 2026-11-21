import { SignIn } from '@clerk/nextjs';

import { AuthShell, clerkAppearance } from '../../../components/auth-shell';

export default function SignInPage() {
  return (
    <AuthShell mode="signIn">
      <SignIn appearance={clerkAppearance} />
    </AuthShell>
  );
}
