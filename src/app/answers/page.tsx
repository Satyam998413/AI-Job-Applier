import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { QnA } from "@/server/models/QnA";
import { Resume } from "@/server/models/Resume";
import { qnaToDto } from "@/server/serializers";
import { AnswersView } from "./_components/AnswersView";

export const runtime = "nodejs";

export default async function AnswersPage() {
  const user = await requireUser();
  await dbConnect();
  const [items, resume] = await Promise.all([
    QnA.find({ userId: user.id }).sort({ updatedAt: -1 }),
    Resume.exists({ userId: user.id }),
  ]);

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <AnswersView initialItems={items.map(qnaToDto)} hasResume={Boolean(resume)} />
    </AppShell>
  );
}
