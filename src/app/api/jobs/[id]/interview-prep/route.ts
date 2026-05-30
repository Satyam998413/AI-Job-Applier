import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Match } from "@/server/models/Match";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { generateInterviewQuestions } from "@/server/services/llm/generateInterviewQuestions";
import { enforceRateLimit } from "@/server/services/rateLimit";
import { matchToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid job id", 400);

    const limited = await enforceRateLimit(session.userId, "interviewPrep");
    if (limited) return limited;

    await dbConnect();
    const [resume, job] = await Promise.all([
      getDefaultResume(session.userId),
      Job.findById(id),
    ]);
    if (!job) return fail("Job not found", 404);
    if (!resume) return fail("Upload a resume before generating interview questions.", 409);

    const questions = await generateInterviewQuestions(session.userId, {
      candidateSummary: resume.summary,
      candidateSkills: resume.skills,
      experienceYears: resume.experienceYears,
      resumeText: resume.rawText,
      jobTitle: job.title,
      jobCompany: job.company,
      jobDescription: job.description,
    });

    const match = await Match.findOneAndUpdate(
      { userId: session.userId, jobId: job._id },
      { $set: { interviewQuestions: questions, interviewPrepAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return ok(matchToDto(match!), 201);
  } catch (err) {
    return handleError(err);
  }
}
