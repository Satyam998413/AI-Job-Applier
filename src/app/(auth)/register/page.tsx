import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "./_components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start matching jobs to your resume in minutes."
      footer={<>Already have an account? <Link href="/login">Sign in</Link></>}
    >
      <RegisterForm />
    </AuthShell>
  );
}
