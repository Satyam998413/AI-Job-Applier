import { notFound } from "next/navigation";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { Job } from "@/server/models/Job";
import { User } from "@/server/models/User";
import { hashToken, verifyShareToken } from "@/server/services/interview/shareToken";
import { interviewToDto } from "@/server/serializers";
import { PublicInterviewSummary } from "./_components/PublicInterviewSummary";
import type { PublicInterviewDto } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function PublicInterviewPage({ params }: Props) {
  const { token } = await params;
  const verified = verifyShareToken(token);
  if (!verified) notFound();

  await dbConnect();
  const interview = await Interview.findOne({
    _id: verified.interviewId,
    "share.tokenHash": hashToken(token),
  });
  if (!interview) notFound();
  if (interview.share.revokedAt) notFound();
  if (interview.share.expiresAt && interview.share.expiresAt.getTime() < Date.now()) notFound();

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
    media: dto.media,
    completedAt: dto.completedAt,
  };

  return <PublicInterviewSummary data={out} />;
}
