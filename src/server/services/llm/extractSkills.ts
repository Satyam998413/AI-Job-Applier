import { z } from "zod";
import { getActiveAdapter } from "./resolver";
import { extractSkillsSystem, buildExtractSkillsPrompt } from "./prompt/extractSkills";

const schema = z.object({
  skills: z.array(z.string()).max(30),
  summary: z.string(),
  experienceYears: z.number().min(0),
});

export type ExtractedResume = z.infer<typeof schema>;

/** Extract structured skills/summary/experience from raw resume text via the user's active AI provider. */
export async function extractSkills(userId: string, resumeText: string): Promise<ExtractedResume> {
  const adapter = await getActiveAdapter(userId);
  return adapter.generateJson({
    schema,
    systemInstruction: extractSkillsSystem,
    prompt: buildExtractSkillsPrompt(resumeText),
  });
}
