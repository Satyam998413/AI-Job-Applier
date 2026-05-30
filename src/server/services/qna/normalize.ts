/**
 * Normalize a free-text job-application question into a canonical form used for
 * exact dedup (unique DB index) AND token-based similarity matching.
 *
 * Rules: lowercase → strip punctuation/diacritics → collapse whitespace → trim.
 * "What's your expected salary?" and "what is your expected salary" both collapse
 * to something close enough that token similarity handles the rest.
 */
export function normalizeQuestion(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "do", "for", "have", "i", "in",
  "is", "it", "of", "on", "or", "our", "the", "to", "us", "we", "what", "you",
  "your", "would", "could", "should", "can", "will", "tell", "me", "about",
]);

export function tokenize(normalized: string): Set<string> {
  return new Set(normalized.split(" ").filter((t) => t.length > 1 && !STOP.has(t)));
}

/** Jaccard similarity over content tokens, ignoring stop words. Returns 0..1. */
export function jaccard(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 && tb.size === 0) return 1;
  if (ta.size === 0 || tb.size === 0) return 0;
  let intersection = 0;
  for (const t of ta) if (tb.has(t)) intersection += 1;
  const union = ta.size + tb.size - intersection;
  return intersection / union;
}
