import { jaccard, normalizeQuestion, tokenize } from "../normalize";

describe("normalizeQuestion", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeQuestion("What's your expected salary?")).toBe("what s your expected salary");
  });

  it("collapses whitespace", () => {
    expect(normalizeQuestion("  Tell   me\tabout  yourself  ")).toBe("tell me about yourself");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeQuestion("")).toBe("");
    expect(normalizeQuestion("   ")).toBe("");
  });
});

describe("tokenize", () => {
  it("drops stop words and 1-char tokens", () => {
    expect(tokenize("what is your expected salary")).toEqual(new Set(["expected", "salary"]));
  });

  it("returns empty set when input is only stop words", () => {
    expect(tokenize("what is your")).toEqual(new Set());
  });
});

describe("jaccard", () => {
  it("returns 1 when both sides have no content tokens", () => {
    // Both sides reduce to empty token sets — defined as fully similar (same nothing).
    expect(jaccard("what is your", "tell me about")).toBe(1);
  });

  it("returns 0 when one side has tokens and the other doesn't", () => {
    expect(jaccard("what is your salary", "what is your")).toBe(0);
  });

  it("computes intersection-over-union on content tokens", () => {
    // tokens(a) = {expected, salary}, tokens(b) = {salary, range}
    // intersection = {salary} = 1; union = 3 → 1/3
    expect(jaccard("what is your expected salary", "what salary range")).toBeCloseTo(1 / 3);
  });

  it("returns 1 for identical content tokens regardless of stop words", () => {
    expect(jaccard("what is the expected salary", "tell me about expected salary")).toBe(1);
  });
});
