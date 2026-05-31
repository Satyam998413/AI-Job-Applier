import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { InterviewView } from "./_components/InterviewView";

export const runtime = "nodejs";

export default async function InterviewPage() {
  const user = await requireUser();
  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <InterviewView userId={user.id} />
    
    </AppShell>
  );
}
