import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { getUserStats } from "@/server/services/stats/getUserStats";
import { getUserActivity } from "@/server/services/stats/getUserActivity";
import { DashboardView } from "./_components/DashboardView";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const user = await requireUser();
  await dbConnect();
  const [stats, activity] = await Promise.all([
    getUserStats(user.id),
    getUserActivity(user.id, 12),
  ]);

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <DashboardView fullName={user.fullName} stats={stats} activity={activity} />
    </AppShell>
  );
}
