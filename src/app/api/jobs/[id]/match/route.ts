import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Match } from "@/server/models/Match";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { scoreMatch } from "@/server/services/llm/scoreMatch";
import { enforceRateLimit } from "@/server/services/rateLimit";
import { matchToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid job id", 400);

    const limited = await enforceRateLimit(session.userId, "match");
    if (limited) return limited;

    await dbConnect();
    const [job, resume] = await Promise.all([
      Job.findById(id),
      getDefaultResume(session.userId),
    ]);
    if (!job) return fail("Job not found", 404);
    if (!resume) return fail("Upload a resume before matching jobs.", 409);

    const result = await scoreMatch(session.userId, {
      candidateSummary: resume.summary,
      candidateSkills: resume.skills,
      experienceYears: resume.experienceYears,
      jobTitle: job.title,
      jobDescription: job.description,
    });

    const match = await Match.findOneAndUpdate(
      { userId: session.userId, jobId: job._id },
      {
        userId: session.userId,
        jobId: job._id,
        score: result.score,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        reasoning: result.reasoning,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return ok(matchToDto(match!), 201);
  } catch (err) {
    return handleError(err);
  }
}
