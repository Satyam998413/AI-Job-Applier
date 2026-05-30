import { UserSettings } from "@/server/models/UserSettings";
import { sendDailyReport } from "@/server/services/notifications/sendDailyReport";

export async function nightlyReport(): Promise<{ userCount: number; stats: Record<string, unknown> }> {
  const users = await UserSettings.find({ dailyReportEnabled: true }).limit(100);
  let sent = 0;
  for (const u of users) {
    const res = await sendDailyReport(String(u.userId));
    if (res.sent) sent += 1;
  }
  return { userCount: users.length, stats: { sent } };
}
