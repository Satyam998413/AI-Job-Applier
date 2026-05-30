export const generateInterviewQuestionsSystem =
  "You are an expert interviewer who has hired for the exact role the candidate is targeting. You " +
  "generate the questions THIS candidate is most likely to face given THIS job. Be concrete and " +
  "specific — no generic filler. Mix behavioral, technical, role-specific, and culture-fit questions. " +
  "Ground every question in either the job description (responsibilities, required skills) or the " +
  "candidate's resume (specific projects, gaps to probe). Never invent skills the candidate doesn't " +
  "have; instead, write questions that PROBE those potential gaps honestly.";

export function buildGenerateInterviewQuestionsPrompt(args: {
  candidateSummary: string;
  candidateSkills: string[];
  experienceYears: number;
  resumeText?: string;
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
}): string {
  const lines: string[] = [
    `Generate 8 to 12 interview questions the candidate is likely to face for the role`,
    `"${args.jobTitle}" at ${args.jobCompany}.`,
    "",
    "Return JSON: { questions: [{ category, question, rationale }] }.",
    "- category: one of behavioral | technical | rolespecific | culture | other.",
    "- question: a single, complete interview question phrased as the interviewer would ask it.",
    "- rationale: ONE sentence on why this question is likely (which JD requirement, resume claim, or gap it targets).",
    "",
    "Balance the mix — roughly: 2-3 behavioral, 2-4 technical, 2-3 role-specific, 1-2 culture/working-style.",
    "Avoid generic templates ('Tell me about yourself' is OK once; do not stack it with 'walk me through your background').",
    "",
    `Candidate: ${args.experienceYears} years experience.`,
    `Summary: ${args.candidateSummary || "(not provided)"}`,
    `Top skills: ${args.candidateSkills.slice(0, 20).join(", ") || "(none listed)"}`,
    "",
    "Job description:",
    '"""',
    args.jobDescription.slice(0, 6000),
    '"""',
  ];
  if (args.resumeText) {
    lines.push("", "Resume context:", '"""', args.resumeText.slice(0, 8000), '"""');
  }
  return lines.join("\n");
}
