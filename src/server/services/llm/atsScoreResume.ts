import { z } from "zod";
import { getActiveAdapter } from "./resolver";
import { atsScoreSystem, buildAtsScorePrompt } from "./prompt/atsScoreResume";

const breakdownKey = z.enum([
  "keywords",
  "structure",
  "experience",
  "skills",
  "clarity",
  "actionVerbs",
]);

const schema = z.object({
  score: z.number().min(0).max(100),
  breakdown: z
    .array(
      z.object({
        key: breakdownKey,
        score: z.number().min(0).max(100),
        comment: z.string(),
      }),
    )
    .min(1)
    .max(8),
  strengths: z.array(z.string()).max(8),
  weaknesses: z.array(z.string()).max(8),
  suggestions: z.array(z.string()).max(8),
});

export type AtsResult = z.infer<typeof schema>;
export type AtsBreakdownItem = AtsResult["breakdown"][number];

export type AtsScoreInput = {
  resumeText: string;
  resumeSkills: string[];
  experienceYears: number;
  jobTitle?: string;
  jobDescription?: string;
};

/** Run an ATS readiness scan via the user's active AI provider. */
export async function atsScoreResume(userId: string, input: AtsScoreInput): Promise<AtsResult> {
  const adapter = await getActiveAdapter(userId);
  const result = await adapter.generateJson({
    schema,
    systemInstruction: atsScoreSystem,
    prompt: buildAtsScorePrompt(input),
  });
  return {
    ...result,
    score: Math.round(result.score),
    breakdown: result.breakdown.map((b) => ({ ...b, score: Math.round(b.score) })),
  };
}
