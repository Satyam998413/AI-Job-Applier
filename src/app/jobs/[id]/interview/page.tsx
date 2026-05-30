import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Resume } from "@/server/models/Resume";
import { Match } from "@/server/models/Match";
import { jobToDto } from "@/server/serializers";
import { InterviewPrepView } from "./_components/InterviewPrepView";
import type { InterviewQuestion } from "@/types";

export const runtime = "nodejs";

export default async function InterviewPrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  const [job, match, resume] = await Promise.all([
    Job.findById(id),
    Match.findOne({ userId: user.id, jobId: id }),
    Resume.exists({ userId: user.id }),
  ]);
  if (!job) notFound();

  const questions: InterviewQuestion[] = (match?.interviewQuestions ?? []) as InterviewQuestion[];
  const generatedAt = match?.interviewPrepAt ? match.interviewPrepAt.toISOString() : null;

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <InterviewPrepView
        job={jobToDto(job)}
        questions={questions}
        generatedAt={generatedAt}
        hasResume={Boolean(resume)}
      />
    </AppShell>
  );
}
