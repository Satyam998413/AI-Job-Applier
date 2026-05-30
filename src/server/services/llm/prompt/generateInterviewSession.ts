type Input = {
  jobTitle: string | null;
  jobCompany: string | null;
  jobDescription: string | null;
  candidateSummary: string;
  candidateSkills: string[];
  categories: string[];
  questionCount: number;
  language: string;
};

export function buildGenerateInterviewSessionPrompt(input: Input): string {
  const lines: string[] = [];
  lines.push(`Generate ${input.questionCount} interview questions in language: ${input.language}.`);
  if (input.jobTitle) {
    lines.push(
      `Role context: ${input.jobTitle} at ${input.jobCompany ?? "(company unspecified)"}. Description: ${(input.jobDescription ?? "").slice(0, 800)}`,
    );
  } else {
    lines.push("Role context: generic mock interview — no specific role.");
  }
  lines.push(`Candidate summary: ${input.candidateSummary || "(none)"}`);
  lines.push(`Candidate top skills: ${input.candidateSkills.slice(0, 20).join(", ") || "(none)"}`);
  lines.push(`Categories to mix across: ${input.categories.join(", ")}`);
  lines.push("");
  lines.push("Each question should be concise, answerable in 60–120 seconds, and tied to the role.");
  lines.push("Vary by category. Do not number them — the rendering layer numbers them.");
  lines.push("");
  lines.push(`Return JSON: { "questions": [{ "question": string, "category": string }] }`);
  return lines.join("\n");
}
