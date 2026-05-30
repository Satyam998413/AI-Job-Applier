import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Resume } from "@/server/models/Resume";
import { EmailComposerView, type ComposerJob } from "./_components/EmailComposerView";

export const runtime = "nodejs";

export default async function EmailPage() {
  const user = await requireUser();
  await dbConnect();

  const [jobs, resume] = await Promise.all([
    Job.find({}, { title: 1, company: 1 }).sort({ postedAt: -1 }).limit(50),
    Resume.exists({ userId: user.id }),
  ]);

  const composerJobs: ComposerJob[] = jobs.map((j) => ({
    id: String(j._id),
    title: j.title,
    company: j.company,
  }));

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <EmailComposerView jobs={composerJobs} hasResume={Boolean(resume)} />
    </AppShell>
  );
}
