import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { getPipeline } from "@/server/services/jobs/getPipeline";
import { PipelineView } from "./_components/PipelineView";

export const runtime = "nodejs";

export default async function PipelinePage() {
  const user = await requireUser();
  await dbConnect();
  const pipeline = await getPipeline(user.id);

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <PipelineView pipeline={pipeline} />
    </AppShell>
  );
}
