import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getNylas, requireNylasConfigured, nylasRedirectUri } from "@/server/services/nylas/nylasClient";
import { fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

/**
 * Start the Nylas OAuth dance. `intent` controls what the callback does:
 *   - "signup" or "login" → no current session needed; callback creates or logs in the user.
 *   - "connect" → user is already logged in; callback links the grant to that user.
 */
export async function GET(req: Request) {
  try {
    requireNylasConfigured();
    const url = new URL(req.url);
    const intent = url.searchParams.get("intent") === "connect" ? "connect" : "signup";

    // CSRF: random state + matching HttpOnly cookie, verified on callback.
    const stateToken = randomBytes(16).toString("hex");

    const authUrl = getNylas().auth.urlForOAuth2({
      clientId: env.NYLAS_CLIENT_ID!,
      redirectUri: nylasRedirectUri(),
      provider: "google",
      // Include refresh tokens so we can keep sending mail after the access token expires.
      accessType: "offline",
      state: stateToken,
    });

    const res = NextResponse.redirect(authUrl);
    const secure = env.APP_URL.startsWith("https://");
    res.cookies.set("nylas_state", stateToken, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 600,
    });
    res.cookies.set("nylas_intent", intent, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 600,
    });
    return res;
  } catch (err) {
    if (err instanceof Error && /not configured/i.test(err.message)) {
      return fail(err.message, 503);
    }
    return handleError(err);
  }
}
