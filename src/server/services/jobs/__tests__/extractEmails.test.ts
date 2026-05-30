import { extractEmailsFromText } from "../extractEmails";

describe("extractEmailsFromText", () => {
  it("matches an exact hr@ address", () => {
    expect(extractEmailsFromText("Send your CV to hr@acme.com.")).toEqual([
      { email: "hr@acme.com", source: "description", confidence: 0.95 },
    ]);
  });

  it("matches careers, jobs, recruiter prefixes", () => {
    const text = "Apply at careers@acme.com or jobs@acme.com. Recruiter@acme.com is also fine.";
    const emails = extractEmailsFromText(text).map((e) => e.email);
    expect(emails).toEqual(expect.arrayContaining(["careers@acme.com", "jobs@acme.com", "recruiter@acme.com"]));
    expect(emails).toHaveLength(3);
  });

  it("drops non-HR addresses", () => {
    expect(extractEmailsFromText("Contact john.smith@acme.com")).toEqual([]);
  });

  it("matches prefix-with-separator forms", () => {
    const emails = extractEmailsFromText(
      "careers-india@acme.com, hr.team@acme.com, hiring_us@acme.com",
    );
    expect(emails.map((e) => e.email).sort()).toEqual([
      "careers-india@acme.com",
      "hiring_us@acme.com",
      "hr.team@acme.com",
    ]);
  });

  it("is case-insensitive on the local part", () => {
    expect(extractEmailsFromText("HR@Acme.COM email")).toEqual([
      { email: "hr@acme.com", source: "description", confidence: 0.95 },
    ]);
  });

  it("dedupes and keeps the highest confidence per address", () => {
    // hr@ appears twice in text — should only return one row.
    expect(extractEmailsFromText("hr@acme.com or hr@acme.com")).toHaveLength(1);
  });

  it("sorts by confidence descending", () => {
    const out = extractEmailsFromText("apply@acme.com hr@acme.com careers@acme.com");
    expect(out.map((e) => e.email)).toEqual(["hr@acme.com", "careers@acme.com", "apply@acme.com"]);
  });

  it("passes through the source label", () => {
    const out = extractEmailsFromText("hr@acme.com", "page");
    expect(out[0].source).toBe("page");
  });
});
