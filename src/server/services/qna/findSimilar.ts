import { QnA, type QnaDoc } from "@/server/models/QnA";
import { normalizeQuestion, jaccard } from "./normalize";

export type SimilarMatch = {
  qna: QnaDoc;
  similarity: number;
};

const EXACT_THRESHOLD = 0.999;
const FUZZY_THRESHOLD = 0.55;
const MAX_RESULTS = 5;

/**
 * Find saved Q&As similar to a question. Returns the best matches ranked by similarity.
 * Exact normalized match always ranks first; fuzzy matches use Jaccard over content tokens.
 */
export async function findSimilarAnswers(userId: string, rawQuestion: string): Promise<SimilarMatch[]> {
  const normalized = normalizeQuestion(rawQuestion);
  if (!normalized) return [];

  const all = await QnA.find({ userId }).sort({ usageCount: -1, lastUsedAt: -1 });
  if (all.length === 0) return [];

  const scored: SimilarMatch[] = all
    .map((qna) => ({
      qna,
      similarity: qna.normalizedQuestion === normalized ? 1 : jaccard(normalized, qna.normalizedQuestion),
    }))
    .filter((m) => m.similarity >= FUZZY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, MAX_RESULTS);

  return scored;
}

export function isExactMatch(m: SimilarMatch): boolean {
  return m.similarity >= EXACT_THRESHOLD;
}
