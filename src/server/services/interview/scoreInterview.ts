import * as Sentry from "@sentry/nextjs";
import { Interview } from "@/server/models/Interview";
import { Job } from "@/server/models/Job";
import { scoreInterviewSession } from "@/server/services/llm/scoreInterviewSession";
import { transcribeAudio } from "./transcribe";
import { notify } from "@/server/services/notifications/notify";
import { interviewToDto } from "@/server/serializers";

/**
 * Background-style scoring. Called from /api/interview/[id]/finish. We move the
 * Interview through `scoring → scored`. For each audio chunk that lacks a stored
 * transcript, run Whisper. Then call LLM scoring across the whole session.
 */
export async function scoreInterview(interviewId: string): Promise<void> {
  const interview = await Interview.findById(interviewId);
  if (!interview) return;

  await Interview.updateOne({ _id: interviewId }, { $set: { status: "scoring" } });

  try {
    // Best-effort transcription for any audio chunks we haven't transcribed.
    for (let i = 0; i < interview.questions.length; i += 1) {
      const q = interview.questions[i];
      if (q.transcript) continue;
      const audio = interview.media.find((m) => m.kind === "audio");
      if (!audio?.url) continue;
      try {
        const blob = await fetch(audio.url).then((r) => r.blob());
        const text = await transcribeAudio(String(interview.userId), blob);
        if (text) interview.questions[i].transcript = text;
      } catch (err) {
        Sentry.captureException(err);
      }
    }
    await interview.save();

    const job = interview.jobId ? await Job.findById(interview.jobId) : null;
    const scores = await scoreInterviewSession(String(interview.userId), {
      jobTitle: job?.title ?? null,
      jobCompany: job?.company ?? null,
      questions: interviewToDto(interview).questions,
    });

    await Interview.updateOne(
      { _id: interviewId },
      { $set: { scores, status: "scored", completedAt: new Date() } },
    );

    await notify(String(interview.userId), {
      kind: "interviewScored",
      title: "Your AI Interview is scored",
      body: `Overall ${Math.round(scores.overall)}/100 · Comm ${Math.round(scores.communication)} · Tech ${Math.round(scores.technical)}`,
      href: `/jobs/${interview.jobId ?? ""}/interview`,
    });
  } catch (err) {
    Sentry.captureException(err);
    await Interview.updateOne({ _id: interviewId }, { $set: { status: "failed" } });
  }
}
