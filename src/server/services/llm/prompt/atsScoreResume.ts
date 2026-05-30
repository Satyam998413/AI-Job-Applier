export const atsScoreSystem =
  "You are an expert ATS (Applicant Tracking System) reviewer. You score a candidate's resume on how " +
  "well an ATS will parse and rank it. Be calibrated, specific, and honest. Base every observation on " +
  "what is actually present in the resume text. Never invent missing employers, skills, or numbers. " +
  "When a job description is provided, evaluate keyword fit and role-targeted phrasing against that JD; " +
  "without one, evaluate the resume in general against industry-standard ATS expectations.";

export type AtsBreakdownKey = "keywords" | "structure" | "experience" | "skills" | "clarity" | "actionVerbs";

export const ATS_BREAKDOWN_LABELS: Record<AtsBreakdownKey, string> = {
  keywords: "Keyword coverage",
  structure: "Sections & structure",
  experience: "Experience grounding",
  skills: "Skills relevance",
  clarity: "Clarity & ATS-readability",
  actionVerbs: "Action verbs & impact",
};

export function buildAtsScorePrompt(args: {
  resumeText: string;
  resumeSkills: string[];
  experienceYears: number;
  jobTitle?: string;
  jobDescription?: string;
}): string {
  const hasJob = Boolean(args.jobTitle && args.jobDescription);
  const lines: string[] = [
    hasJob
      ? `Score this resume's ATS readiness for the role "${args.jobTitle}".`
      : "Score this resume's general ATS readiness (no specific job).",
    "",
    "Return JSON: { score, breakdown[], strengths[], weaknesses[], suggestions[] }.",
    "- score: integer 0-100 overall ATS readiness.",
    "- breakdown: ARRAY of exactly six items, one per `key` in this list:",
    "  keywords, structure, experience, skills, clarity, actionVerbs.",
    "  Each item: { key, score (0-100 int), comment (1 sentence) }.",
    "- strengths: 2-4 short bullets (what the resume does well).",
    "- weaknesses: 2-4 short bullets (concrete issues an ATS or recruiter would catch).",
    "- suggestions: 3-6 actionable improvements, each ≤ 25 words.",
    "",
    `Candidate experience: ${args.experienceYears} years.`,
    `Candidate skills (parsed): ${args.resumeSkills.join(", ") || "(none)"}.`,
  ];
  if (hasJob) {
    lines.push("", "Target job description:", '"""', args.jobDescription!.slice(0, 6000), '"""');
  }
  lines.push("", "Resume text:", '"""', args.resumeText.slice(0, 12000), '"""');
  return lines.join("\n");
}
