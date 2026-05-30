import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue applying smarter."
      footer={<>No account? <Link href="/register">Create one</Link></>}
    >
      <LoginForm />
    </AuthShell>
  );
}
