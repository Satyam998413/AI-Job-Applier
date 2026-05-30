/**
 * Normalizes a job title or company name for duplicate detection.
 * Lowercases, strips punctuation, collapses whitespace.
 * Pure — safe to import client-side or in tests.
 */
export function normalizeForDedup(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\p{M}]/gu, "") // strip combining marks (e.g. accents)
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // punctuation/symbols → space
    .replace(/\s+/g, " ")
    .trim();
}
