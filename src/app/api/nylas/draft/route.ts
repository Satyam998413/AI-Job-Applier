import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { User } from "@/server/models/User";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { generateEmail } from "@/server/services/llm/generateEmail";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  jobId: z.string(),
  recipientName: z.string().trim().optional(),
  notes: z.string().trim().max(800).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { jobId, recipientName, notes } = bodySchema.parse(await req.json());
    if (!isValidObjectId(jobId)) return fail("Invalid job id", 400);

    await dbConnect();
    const [user, resume, job] = await Promise.all([
      User.findById(session.userId),
      getDefaultResume(session.userId),
      Job.findById(jobId),
    ]);
    if (!user) return fail("Not authenticated", 401);
    if (!resume) return fail("Upload a resume before drafting outreach emails.", 409);
    if (!job) return fail("Job not found", 404);

    const draft = await generateEmail(session.userId, {
      candidateName: user.fullName,
      candidateSummary: resume.summary,
      candidateSkills: resume.skills,
      experienceYears: resume.experienceYears,
      resumeText: resume.rawText,
      jobTitle: job.title,
      jobCompany: job.company,
      jobDescription: job.description,
      recipientName,
      notes,
    });

    return ok(draft);
  } catch (err) {
    return handleError(err);
  }
}
