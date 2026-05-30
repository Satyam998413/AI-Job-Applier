import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Resume } from "@/server/models/Resume";
import { Match } from "@/server/models/Match";
import { jobToDto, matchToDto } from "@/server/serializers";
import { JobDetailView } from "./_components/JobDetailView";

export const runtime = "nodejs";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!isValidObjectId(id)) notFound();

  await dbConnect();
  const [job, resume, match] = await Promise.all([
    Job.findById(id),
    Resume.exists({ userId: user.id }),
    Match.findOne({ userId: user.id, jobId: id }),
  ]);
  if (!job) notFound();

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <JobDetailView
        job={jobToDto(job)}
        initialMatch={match ? matchToDto(match) : null}
        hasResume={Boolean(resume)}
      />
    </AppShell>
  );
}
