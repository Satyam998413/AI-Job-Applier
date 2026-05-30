import { isExactMatch, type SimilarMatch } from "../findSimilar";

// findSimilarAnswers() hits Mongo, so it's exercised via integration tests, not here.
// The pure ranking predicate is isExactMatch — these tests pin its threshold behavior.

function fake(similarity: number): SimilarMatch {
  // Only `similarity` is read by isExactMatch; the rest is structural padding.
  return { qna: {} as SimilarMatch["qna"], similarity };
}

describe("isExactMatch", () => {
  it("is true at exactly 1.0", () => {
    expect(isExactMatch(fake(1))).toBe(true);
  });

  it("is true at the 0.999 threshold", () => {
    expect(isExactMatch(fake(0.999))).toBe(true);
  });

  it("is false just below the threshold", () => {
    expect(isExactMatch(fake(0.998))).toBe(false);
  });

  it("is false for fuzzy matches", () => {
    expect(isExactMatch(fake(0.7))).toBe(false);
    expect(isExactMatch(fake(0))).toBe(false);
  });
});
