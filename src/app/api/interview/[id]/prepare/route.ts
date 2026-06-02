import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { Job } from "@/server/models/Job";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { generateSmartAnswer } from "@/server/services/llm/generateSmartAnswers";
import { interviewToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 120;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    await dbConnect();
    const interview = await Interview.findOne({ _id: id, userId: session.userId });
    if (!interview) return fail("Interview not found", 404);
    if (interview.status !== "pending") {
      return fail("Interview is not in pending state", 400);
    }

    // Get candidate resume and job context for smart answer generation
    const [resume, job] = await Promise.all([
      getDefaultResume(session.userId),
      interview.jobId ? Job.findById(interview.jobId) : Promise.resolve(null),
    ]);

    const jobTitle = job?.title ?? "General";

    // Generate smart answers for each question
    const updatedQuestions = await Promise.all(
      interview.questions.map(async (q) => {
        if (!q.smartAnswer) {
          const answer = await generateSmartAnswer(session.userId, q.question, jobTitle, resume?.skills || []);
          return { ...q.toObject(), smartAnswer: answer };
        }
        return q.toObject();
      }),
    );

    // Update interview with smart answers and new status
    await Interview.updateOne(
      { _id: id },
      {
        questions: updatedQuestions,
        status: "preparing",
      },
    );

    const updated = await Interview.findById(id);
    return ok(interviewToDto(updated!), 200);
  } catch (err) {
    return handleError(err);
  }
}
