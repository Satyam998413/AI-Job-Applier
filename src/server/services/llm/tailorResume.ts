import { getActiveAdapter } from "./resolver";
import { tailorResumeSystem, buildTailorResumePrompt } from "./prompt/tailorResume";

export type TailorResumeInput = {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
};

/** Generate an ATS-optimized resume (Markdown) tailored to a job via the user's active AI provider. */
export async function tailorResume(userId: string, input: TailorResumeInput): Promise<string> {
  const adapter = await getActiveAdapter(userId);
  return adapter.generateText({
    systemInstruction: tailorResumeSystem,
    prompt: buildTailorResumePrompt(input),
  });
}
