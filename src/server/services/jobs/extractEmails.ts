/**
 * Pure email extraction from job-posting text. No I/O.
 *
 * Strategy: precision over recall. Only emails whose local-part hits the HR-prefix
 * allow-list are returned, each with a confidence score. Unknown-prefix emails are
 * dropped (a personal "john@example.com" is rarely the right contact).
 */

export type ExtractedEmail = {
  email: string;
  source: "description" | "page" | "guess";
  confidence: number;
};

const PREFIX_CONFIDENCE: Record<string, number> = {
  hr: 0.95,
  careers: 0.9,
  recruiter: 0.9,
  recruiting: 0.9,
  recruit: 0.85,
  jobs: 0.85,
  hiring: 0.8,
  talent: 0.8,
  apply: 0.75,
  joinus: 0.7,
  join: 0.65,
  work: 0.6,
};

// Standard RFC-5322-ish address. Local-part has been kept tight on purpose.
const EMAIL_RE = /([A-Za-z0-9._+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

function prefixConfidence(localPart: string): number | null {
  const lower = localPart.toLowerCase();
  // Exact match (e.g. "hr@…")
  if (PREFIX_CONFIDENCE[lower] !== undefined) return PREFIX_CONFIDENCE[lower];
  // Prefix-with-separator match (e.g. "careers-india@…", "hr.team@…")
  for (const [key, score] of Object.entries(PREFIX_CONFIDENCE)) {
    if (lower.startsWith(`${key}.`) || lower.startsWith(`${key}-`) || lower.startsWith(`${key}_`)) {
      return score;
    }
  }
  return null;
}

export function extractEmailsFromText(
  text: string,
  source: ExtractedEmail["source"] = "description",
): ExtractedEmail[] {
  const seen = new Map<string, ExtractedEmail>();
  for (const match of text.matchAll(EMAIL_RE)) {
    const [full, local, domain] = match;
    const confidence = prefixConfidence(local);
    if (confidence === null) continue;
    const email = `${local}@${domain}`.toLowerCase();
    const prior = seen.get(email);
    if (!prior || prior.confidence < confidence) {
      seen.set(email, { email, source, confidence });
    }
  }
  return [...seen.values()].sort((a, b) => b.confidence - a.confidence);
}
