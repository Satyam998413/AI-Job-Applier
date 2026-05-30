import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { Job } from "@/server/models/Job";
import { User } from "@/server/models/User";
import { verifyShareToken, hashToken } from "@/server/services/interview/shareToken";
import { interviewToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";
import type { PublicInterviewDto } from "@/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { token } = await params;
    const verified = verifyShareToken(token);
    if (!verified) return fail("Invalid or expired share token", 404);

    await dbConnect();
    const interview = await Interview.findOne({
      _id: verified.interviewId,
      "share.tokenHash": hashToken(token),
    });
    if (!interview) return fail("Invalid or expired share token", 404);
    if (interview.share.revokedAt) return fail("This share link has been revoked", 410);
    if (interview.share.expiresAt && interview.share.expiresAt.getTime() < Date.now()) {
      return fail("This share link has expired", 410);
    }

    await Interview.updateOne({ _id: interview._id }, { $inc: { "share.viewedCount": 1 } });

    const [user, job] = await Promise.all([
      User.findById(interview.userId, { fullName: 1 }),
      interview.jobId ? Job.findById(interview.jobId, { title: 1, company: 1 }) : null,
    ]);
    const dto = interviewToDto(interview);
    const out: PublicInterviewDto = {
      candidateName: user?.fullName ?? "Candidate",
      jobTitle: job?.title ?? null,
      jobCompany: job?.company ?? null,
      status: dto.status,
      questions: dto.questions,
      scores: dto.scores,
      completedAt: dto.completedAt,
    };
    return ok(out);
  } catch (err) {
    return handleError(err);
  }
}
