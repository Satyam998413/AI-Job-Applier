import { isValidObjectId } from "mongoose";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { interviewToDto } from "@/server/serializers";
import { InterviewPrepareView } from "./_components/InterviewPrepareView";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export default async function InterviewPreparePage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  const doc = await Interview.findOne({ _id: id, userId: user.id });
  if (!doc) notFound();

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <InterviewPrepareView initial={interviewToDto(doc)} />
    </AppShell>
  );
}
