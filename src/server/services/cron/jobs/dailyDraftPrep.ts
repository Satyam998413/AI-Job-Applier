import { UserSettings } from "@/server/models/UserSettings";
import { Match } from "@/server/models/Match";
import { notify } from "@/server/services/notifications/notify";

/**
 * Picks up matches that have been scored but not yet tailored or applied, surfaces
 * them as "ready to review" notifications so the user can act on them.
 *
 * Actual draft generation (cover-letter / email) is deliberately NOT auto-fired —
 * that would burn LLM quota even when the user isn't looking. The notification
 * deep-links to the job page where the user clicks Generate.
 */
export async function dailyDraftPrep(): Promise<{ userCount: number; stats: Record<string, unknown> }> {
  const users = await UserSettings.find({ autoApplyEnabled: true }).limit(100);
  let notified = 0;

  for (const u of users) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fresh = await Match.find({
      userId: u.userId,
      status: "new",
      createdAt: { $gte: since },
      score: { $gte: 70 },
    }).limit(u.applyLimit);

    if (fresh.length === 0) continue;
    await notify(String(u.userId), {
      kind: "matchScored",
      title: `${fresh.length} high-match job${fresh.length === 1 ? "" : "s"} waiting`,
      body: "Review and tailor your applications.",
      href: "/jobs",
    });
    notified += 1;
  }
  return { userCount: users.length, stats: { notified } };
}
