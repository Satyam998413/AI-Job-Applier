import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { SettingsView } from "./_components/SettingsView";

export const runtime = "nodejs";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <SettingsView />
    </AppShell>
  );
}
