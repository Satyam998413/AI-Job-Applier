import { clearSessionCookie, readRefreshCookie } from "@/server/auth/session";
import { revokeRefreshToken } from "@/server/auth/refresh";
import { ok } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  await revokeRefreshToken(await readRefreshCookie());
  await clearSessionCookie();
  return ok({ success: true });
}
