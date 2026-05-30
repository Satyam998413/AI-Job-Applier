import type { InterviewQuestionDto } from "@/types";

type Input = {
  jobTitle: string | null;
  jobCompany: string | null;
  questions: InterviewQuestionDto[];
};

export function buildScoreInterviewSessionPrompt(input: Input): string {
  const lines: string[] = [];
  lines.push("You are an experienced interview coach scoring a candidate's mock interview.");
  lines.push(
    `Job context: ${input.jobTitle ?? "(no specific role)"} at ${input.jobCompany ?? "(no specific company)"}.`,
  );
  lines.push("");
  lines.push("Below is the transcript of each question and the candidate's response.");
  lines.push(
    "Score on three axes: communication, technical, confidence — each 0..100. Then compute an overall 0..100.",
  );
  lines.push("Provide a short rubric (3–5 lines) explaining the dominant signals.");
  lines.push("");
  lines.push("Return JSON with this exact shape:");
  lines.push(
    `{ "communication": number, "technical": number, "confidence": number, "overall": number, "rubric": [{ "criterion": string, "score": number, "comment": string }] }`,
  );
  lines.push("");
  lines.push("Interview transcript:");
  input.questions.forEach((q, i) => {
    lines.push(`--- Q${i + 1} [${q.category}] ---`);
    lines.push(`Question: ${q.question}`);
    if (q.transcript) lines.push(`Verbal answer: ${q.transcript}`);
    if (q.codeSubmission) lines.push(`Code answer:\n${q.codeSubmission}`);
    if (!q.transcript && !q.codeSubmission) lines.push("(no answer provided)");
  });
  return lines.join("\n");
}
