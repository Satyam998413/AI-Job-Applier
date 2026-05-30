import { NextResponse } from "next/server";
import { User } from "@/server/models/User";
import { rotateRefreshToken } from "@/server/auth/refresh";
import {
  clearSessionCookie,
  readRefreshCookie,
  setRefreshCookie,
  setSessionCookie,
} from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";
import type { UserDto } from "@/types";

export const runtime = "nodejs";

/** Sanitize the redirect target so an open-redirect can't be smuggled via ?next=. */
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

async function refresh(): Promise<UserDto | null> {
  const result = await rotateRefreshToken(await readRefreshCookie());
  if (!result.ok) {
    await clearSessionCookie();
    return null;
  }
  const user = await User.findById(result.userId).lean();
  if (!user) {
    await clearSessionCookie();
    return null;
  }
  await setSessionCookie({ userId: String(user._id), email: user.email });
  await setRefreshCookie(result.nextRaw);
  return { id: String(user._id), email: user.email, fullName: user.fullName };
}

/** Server-side trampoline: pages redirect here when access is expired. */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const next = safeNext(url.searchParams.get("next"));
    const dto = await refresh();
    return NextResponse.redirect(new URL(dto ? next : "/login", url.origin));
  } catch (err) {
    return handleError(err);
  }
}

/** Client-side: apiFetch calls this on a 401 and retries the original request. */
export async function POST() {
  try {
    const dto = await refresh();
    if (!dto) return fail("Refresh failed", 401);
    return ok(dto);
  } catch (err) {
    return handleError(err);
  }
}
