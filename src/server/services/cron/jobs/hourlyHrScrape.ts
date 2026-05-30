import { Job } from "@/server/models/Job";
import { extractEmailsFromText } from "@/server/services/jobs/extractEmails";

/**
 * Lightweight per-hour pass: pick the 25 most-recently posted jobs that haven't
 * had email extraction run, extract from the description text. URL-fetch +
 * per-domain throttle is intentionally NOT done here (still gated by plan/24).
 */
export async function hourlyHrScrape(): Promise<{ userCount: number; stats: Record<string, unknown> }> {
  const jobs = await Job.find({
    $or: [{ extractedEmails: { $exists: false } }, { extractedEmails: { $size: 0 } }],
  })
    .sort({ postedAt: -1 })
    .limit(25);

  let withEmails = 0;
  for (const job of jobs) {
    const extracted = extractEmailsFromText(job.description, "description").map((e) => ({
      ...e,
      extractedAt: new Date(),
    }));
    if (extracted.length === 0) continue;
    await Job.updateOne({ _id: job._id }, { $set: { extractedEmails: extracted } });
    withEmails += 1;
  }
  return { userCount: 0, stats: { jobsScanned: jobs.length, withEmails } };
}
