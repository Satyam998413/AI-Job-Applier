import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { dbConnect } from "@/server/db/connect";
import { getAdminStats, getSuspiciousSignals } from "@/server/services/stats/getAdminStats";
import { AdminView } from "./_components/AdminView";

export const runtime = "nodejs";

export default async function AdminPage() {
  const user = await requireAdmin();
  await dbConnect();
  const [stats, signals] = await Promise.all([getAdminStats(), getSuspiciousSignals()]);

  return (
    <AppShell userName={user.fullName} isAdmin>
      <AdminView stats={stats} signals={signals} />
    </AppShell>
  );
}
