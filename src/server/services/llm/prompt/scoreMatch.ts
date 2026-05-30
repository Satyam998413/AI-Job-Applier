export const scoreMatchSystem =
  "You are an expert technical recruiter. You compare a candidate's resume against a job description " +
  "and assess fit objectively. Base your judgment only on the provided information. Be calibrated: a " +
  "score of 100 means a near-perfect match, 50 means a partial match, below 30 means a poor match.";

export function buildScoreMatchPrompt(args: {
  candidateSummary: string;
  candidateSkills: string[];
  experienceYears: number;
  jobTitle: string;
  jobDescription: string;
}): string {
  return [
    "Score how well this candidate matches the job.",
    "Return:",
    "- score: integer 0-100 overall fit.",
    "- matchedSkills: candidate skills clearly relevant to this job.",
    "- missingSkills: important skills the job wants that the candidate seems to lack.",
    "- reasoning: 2-3 sentences explaining the score.",
    "",
    `Candidate experience: ${args.experienceYears} years`,
    `Candidate summary: ${args.candidateSummary}`,
    `Candidate skills: ${args.candidateSkills.join(", ") || "(none listed)"}`,
    "",
    `Job title: ${args.jobTitle}`,
    "Job description:",
    '"""',
    args.jobDescription.slice(0, 8000),
    '"""',
  ].join("\n");
}
