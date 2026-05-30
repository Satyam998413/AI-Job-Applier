import { Interview } from "@/server/models/Interview";
import { Job } from "@/server/models/Job";
import { UserSettings } from "@/server/models/UserSettings";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { generateInterviewSession } from "@/server/services/llm/generateInterviewSession";

/**
 * Create a new interview row with LLM-generated questions tailored to the optional
 * job + the candidate's resume. Uses the user's saved interview defaults for
 * count / categories / language.
 */
export async function startInterview(
  userId: string,
  options: { jobId?: string | null },
): Promise<string> {
  const [resume, settings, job] = await Promise.all([
    getDefaultResume(userId),
    UserSettings.findOne({ userId }),
    options.jobId ? Job.findById(options.jobId) : Promise.resolve(null),
  ]);

  const defaults = settings?.interviewDefaults ?? {
    questionCount: 10,
    durationMin: 30,
    categories: ["behavioral", "technical", "rolespecific"],
    language: "en",
  };

  const questions = await generateInterviewSession(userId, {
    jobTitle: job?.title ?? null,
    jobCompany: job?.company ?? null,
    jobDescription: job?.description ?? null,
    candidateSummary: resume?.summary ?? "",
    candidateSkills: resume?.skills ?? [],
    categories: defaults.categories,
    questionCount: defaults.questionCount,
    language: defaults.language,
  });

  const interview = await Interview.create({
    userId,
    jobId: options.jobId ?? null,
    status: "live",
    language: defaults.language,
    durationMin: defaults.durationMin,
    questions: questions.map((q) => ({
      question: q.question,
      category: q.category,
    })),
    startedAt: new Date(),
  });
  return String(interview._id);
}
