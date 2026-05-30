import { z } from "zod";
import { getActiveAdapter } from "./resolver";
import { scoreMatchSystem, buildScoreMatchPrompt } from "./prompt/scoreMatch";

const schema = z.object({
  score: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  reasoning: z.string(),
});

export type MatchResult = z.infer<typeof schema>;

export type ScoreMatchInput = {
  candidateSummary: string;
  candidateSkills: string[];
  experienceYears: number;
  jobTitle: string;
  jobDescription: string;
};

/** Score a resume against a job description via the user's active AI provider. */
export async function scoreMatch(userId: string, input: ScoreMatchInput): Promise<MatchResult> {
  const adapter = await getActiveAdapter(userId);
  const result = await adapter.generateJson({
    schema,
    systemInstruction: scoreMatchSystem,
    prompt: buildScoreMatchPrompt(input),
  });
  return { ...result, score: Math.round(result.score) };
}
