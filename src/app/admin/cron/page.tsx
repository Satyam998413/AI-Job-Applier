import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { dbConnect } from "@/server/db/connect";
import { CronRun } from "@/server/models/CronRun";
import { cronRunToDto } from "@/server/serializers";
import { AdminCronView } from "./_components/AdminCronView";

export const runtime = "nodejs";

export default async function AdminCronPage() {
  const user = await requireAdmin();
  await dbConnect();
  const runs = await CronRun.find().sort({ scheduledAt: -1 }).limit(100);

  return (
    <AppShell userName={user.fullName} isAdmin>
      <AdminCronView runs={runs.map(cronRunToDto)} />
    </AppShell>
  );
}
