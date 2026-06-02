export interface Input {
  question: string;
  jobRole: string;
  candidateSkills: string[];
}

export function buildGenerateSmartAnswerPrompt(input: Input): string {
  const skillsList = input.candidateSkills.length > 0 
    ? input.candidateSkills.join(", ")
    : "general skills";

  return `You are helping a candidate prepare for an interview for the role of ${input.jobRole}.

The candidate has experience with: ${skillsList}

Interview Question:
"${input.question}"

Generate a concise, confident, well-structured answer (under 200 words) that:
1. Directly addresses the question
2. Demonstrates relevant expertise and experience
3. Shows confidence and professionalism
4. Includes a specific example or scenario when appropriate
5. Ends with a positive note

Output ONLY the answer text, no preamble or explanation.`;
}
