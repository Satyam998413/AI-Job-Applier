import { ConnectedEmail } from "@/server/models/ConnectedEmail";
import { Match } from "@/server/models/Match";
import { EmailLog } from "@/server/models/EmailLog";
import { Notification } from "@/server/models/Notification";
import { User } from "@/server/models/User";
import { getNylas, isNylasConfigured } from "@/server/services/nylas/nylasClient";
import { notify } from "./notify";

type DailyStats = {
  jobsScored: number;
  emailsSent: number;
  applied: number;
  unreadNotifications: number;
};

async function gatherDailyStats(userId: string, since: Date): Promise<DailyStats> {
  const [jobsScored, emailsSent, applied, unreadNotifications] = await Promise.all([
    Match.countDocuments({ userId, createdAt: { $gte: since } }),
    EmailLog.countDocuments({ userId, status: "sent", createdAt: { $gte: since } }),
    Match.countDocuments({ userId, status: "applied", appliedAt: { $gte: since } }),
    Notification.countDocuments({ userId, seenAt: null }),
  ]);
  return { jobsScored, emailsSent, applied, unreadNotifications };
}

function renderReport(stats: DailyStats, fullName: string): { subject: string; body: string } {
  const subject = `Your AI-Job-Applier daily summary (${new Date().toLocaleDateString()})`;
  const body = [
    `Hi ${fullName},`,
    "",
    "Here's what happened on your account in the last 24 hours:",
    "",
    `  • ${stats.jobsScored} new job match(es) scored`,
    `  • ${stats.emailsSent} email(s) sent`,
    `  • ${stats.applied} application(s) marked applied`,
    `  • ${stats.unreadNotifications} unread notification(s)`,
    "",
    "Sign in to review pending drafts and tailored resumes.",
    "",
    "— AI-Job-Applier",
  ].join("\n");
  return { subject, body };
}

/**
 * Compose + send the daily summary email via the user's Nylas grant, write an in-app
 * notification, and persist the EmailLog. Silent no-op if Nylas isn't configured or
 * the user hasn't connected their inbox.
 */
export async function sendDailyReport(userId: string): Promise<{ sent: boolean; reason?: string }> {
  const user = await User.findById(userId);
  if (!user) return { sent: false, reason: "no-user" };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stats = await gatherDailyStats(userId, since);
  const report = renderReport(stats, user.fullName);

  await notify(userId, {
    kind: "dailyReport",
    title: report.subject,
    body: `${stats.jobsScored} matches · ${stats.emailsSent} emails · ${stats.applied} applied`,
    href: "/dashboard",
  });

  if (!isNylasConfigured()) return { sent: false, reason: "nylas-not-configured" };
  const conn = await ConnectedEmail.findOne({ userId, syncStatus: "active" });
  if (!conn) return { sent: false, reason: "no-connected-email" };

  try {
    const sent = await getNylas().messages.send({
      identifier: conn.grantId,
      requestBody: {
        to: [{ email: user.email }],
        subject: report.subject,
        body: `<pre style="font-family:inherit">${report.body
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>`,
      },
    });
    await EmailLog.create({
      userId,
      grantId: conn.grantId,
      provider: conn.provider,
      to: [user.email],
      cc: [],
      bcc: [],
      subject: report.subject,
      bodyPreview: report.body.slice(0, 280),
      status: "sent",
      messageId: sent.data?.id ?? null,
      mode: "compose",
    });
    return { sent: true };
  } catch (err) {
    await EmailLog.create({
      userId,
      grantId: conn.grantId,
      provider: conn.provider,
      to: [user.email],
      cc: [],
      bcc: [],
      subject: report.subject,
      bodyPreview: report.body.slice(0, 280),
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "Send failed",
      mode: "compose",
    });
    return { sent: false, reason: "send-failed" };
  }
}
