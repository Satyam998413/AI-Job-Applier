import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { resumeToDto } from "@/server/serializers";
import { ResumeView } from "./_components/ResumeView";
import type { AtsJobOption } from "./_components/AtsCheckPanel";

export const runtime = "nodejs";

export default async function ResumePage() {
  const user = await requireUser();
  await dbConnect();
  const [resume, jobs] = await Promise.all([
    getDefaultResume(user.id),
    Job.find({}, { title: 1, company: 1 }).sort({ postedAt: -1 }).limit(50),
  ]);

  const jobOptions: AtsJobOption[] = jobs.map((j) => ({
    id: String(j._id),
    title: j.title,
    company: j.company,
  }));

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <ResumeView initialResume={resume ? resumeToDto(resume) : null} jobs={jobOptions} />
    </AppShell>
  );
}
