import { normalizeForDedup } from "../normalize";

describe("normalizeForDedup", () => {
  it("lowercases", () => {
    expect(normalizeForDedup("Frontend Engineer")).toBe("frontend engineer");
  });

  it("strips punctuation", () => {
    expect(normalizeForDedup("Sr. Frontend Engineer")).toBe("sr frontend engineer");
    expect(normalizeForDedup("Acme, Inc.")).toBe("acme inc");
    expect(normalizeForDedup("Backend/DevOps")).toBe("backend devops");
  });

  it("collapses whitespace", () => {
    expect(normalizeForDedup("  Senior   Engineer  ")).toBe("senior engineer");
    expect(normalizeForDedup("Lead\tEngineer")).toBe("lead engineer");
  });

  it("strips diacritics", () => {
    expect(normalizeForDedup("Café Engineer")).toBe("cafe engineer");
    expect(normalizeForDedup("naïve")).toBe("naive");
  });

  it("treats equivalent variants as equal after normalization", () => {
    const a = normalizeForDedup("Sr. Frontend Engineer");
    const b = normalizeForDedup("SR FRONTEND ENGINEER");
    expect(a).toBe(b);
  });

  it("keeps unicode letters that aren't ASCII", () => {
    // Pure non-letter content gets stripped to empty; pure non-Latin letters are kept.
    expect(normalizeForDedup("北京 Engineer")).toBe("北京 engineer");
  });

  it("returns empty for whitespace-only input", () => {
    expect(normalizeForDedup("   ")).toBe("");
    expect(normalizeForDedup("")).toBe("");
  });
});
