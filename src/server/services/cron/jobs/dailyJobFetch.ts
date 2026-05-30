import { UserSettings } from "@/server/models/UserSettings";
import { Job } from "@/server/models/Job";
import { extractEmailsFromText } from "@/server/services/jobs/extractEmails";

const HOUR = 60 * 60 * 1000;
const DAY_HOURS: Record<string, number> = { last24h: 24, last2d: 48, last7d: 168, last30d: 720 };

/**
 * Walks users with auto-apply enabled. For each, runs HR email extraction over
 * jobs that match their date filter and don't already have extracted emails.
 *
 * Live provider fetching (JSearch etc.) is intentionally NOT done here yet —
 * that requires per-user API keys + quota checks. This handler is the gate that
 * keeps the rest of the daily loop running while the live fetch story matures.
 */
export async function dailyJobFetch(): Promise<{ userCount: number; stats: Record<string, unknown> }> {
  const users = await UserSettings.find({ autoApplyEnabled: true }).limit(100);
  let jobsTouched = 0;
  let emailsExtracted = 0;

  for (const u of users) {
    const sinceHours = DAY_HOURS[u.dateFilter] ?? 168;
    const since = new Date(Date.now() - sinceHours * HOUR);
    const jobs = await Job.find({
      postedAt: { $gte: since },
      $or: [{ extractedEmails: { $exists: false } }, { extractedEmails: { $size: 0 } }],
    }).limit(50);

    for (const job of jobs) {
      const extracted = extractEmailsFromText(job.description, "description").map((e) => ({
        ...e,
        extractedAt: new Date(),
      }));
      if (extracted.length > 0) {
        await Job.updateOne({ _id: job._id }, { $set: { extractedEmails: extracted } });
        emailsExtracted += extracted.length;
      }
      jobsTouched += 1;
    }
  }
  return { userCount: users.length, stats: { jobsTouched, emailsExtracted } };
}
