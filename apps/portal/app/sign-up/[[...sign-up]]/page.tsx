import { SignUp } from '@clerk/nextjs';

import { AuthShell, clerkAppearance } from '../../../components/auth-shell';

export default function SignUpPage() {
  return (
    <AuthShell mode="signUp">
      <SignUp appearance={clerkAppearance} />
    </AuthShell>
  );
}
