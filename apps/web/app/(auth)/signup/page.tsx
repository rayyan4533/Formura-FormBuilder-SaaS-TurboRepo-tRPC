import { AuthShell } from "~/components/auth-shell";
import { SignUpForm } from "~/components/signup-form";

export default function SignupPage() {
  return (
    <AuthShell>
      <SignUpForm />
    </AuthShell>
  );
}
