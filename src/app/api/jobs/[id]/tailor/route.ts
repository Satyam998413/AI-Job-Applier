import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Match } from "@/server/models/Match";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { tailorResume } from "@/server/services/llm/tailorResume";
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

    const limited = await enforceRateLimit(session.userId, "tailor");
    if (limited) return limited;

    await dbConnect();
    const [job, resume] = await Promise.all([
      Job.findById(id),
      getDefaultResume(session.userId),
    ]);
    if (!job) return fail("Job not found", 404);
    if (!resume) return fail("Upload a resume before tailoring.", 409);

    const tailored = await tailorResume(session.userId, {
      jobTitle: job.title,
      jobDescription: job.description,
      resumeText: resume.rawText,
    });

    const match = await Match.findOneAndUpdate(
      { userId: session.userId, jobId: job._id },
      { $set: { tailoredResume: tailored, status: "tailored" } },
      { new: true },
    );
    if (!match) return fail("Compute a match for this job before tailoring.", 409);

    return ok(matchToDto(match), 201);
  } catch (err) {
    return handleError(err);
  }
}
