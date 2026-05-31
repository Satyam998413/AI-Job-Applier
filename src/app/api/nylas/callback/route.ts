import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { ConnectedEmail } from "@/server/models/ConnectedEmail";
import { getSession, setSessionCookie, setRefreshCookie } from "@/server/auth/session";
import { issueRefreshToken } from "@/server/auth/refresh";
import { getNylas, nylasRedirectUri } from "@/server/services/nylas/nylasClient";

export const runtime = "nodejs";

function fallbackName(email: string): string {
  return email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function appUrl(path: string, params?: Record<string, string>): URL {
  const u = new URL(path, env.APP_URL);
  if (params) for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");

    const store = await cookies();
    const expectedState = store.get("nylas_state")?.value;
    const intent = store.get("nylas_intent")?.value === "connect" ? "connect" : "signup";

    // Always clear our short-lived cookies on the response.
    function clearCookies(res: NextResponse) {
      res.cookies.set("nylas_state", "", { path: "/", maxAge: 0 });
      res.cookies.set("nylas_intent", "", { path: "/", maxAge: 0 });
      return res;
    }

    if (errorParam) {
      return clearCookies(
        NextResponse.redirect(appUrl(intent === "connect" ? "/settings" : "/login", { nylasError: errorParam })),
      );
    }
    if (!code || !state || !expectedState || state !== expectedState) {
      return clearCookies(
        NextResponse.redirect(appUrl(intent === "connect" ? "/settings" : "/login", { nylasError: "invalid_state" })),
      );
    }

    const exchange = await getNylas().auth.exchangeCodeForToken({
      clientId: env.NYLAS_CLIENT_ID!,
      redirectUri: nylasRedirectUri(),
      code,
    });

    const grantedEmail = exchange.email.toLowerCase();
    const grantId = exchange.grantId;
    const provider = "google"; // only provider we request in /api/nylas/auth today

    await dbConnect();
    const session = await getSession();

    let userId: string;

    if (intent === "connect") {
      if (!session) {
        return clearCookies(NextResponse.redirect(appUrl("/login", { nylasError: "no_session" })));
      }
      userId = session.userId;
    } else {
      // Sign-up or log-in via Nylas: find by email, else create a new user with a random pwd.
      let user = await User.findOne({ email: grantedEmail });
      if (!user) {
        const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 10);
        user = await User.create({
          email: grantedEmail,
          fullName: fallbackName(grantedEmail),
          passwordHash,
          passwordSetByUser: false, // Mark that user hasn't set their own password
        });
      }
      userId = user.id;
      await setSessionCookie({ userId: user.id, email: user.email });
      // Issue refresh token for session persistence across page reloads
      const refresh = await issueRefreshToken(user.id);
      await setRefreshCookie(refresh);
    }

    // Attach (or replace) the user's connected email.
    await ConnectedEmail.findOneAndUpdate(
      { userId },
      {
        $set: {
          grantId,
          provider,
          emailAddress: grantedEmail,
          syncStatus: "active",
          connectedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const dest = intent === "connect" ? "/settings" : "/dashboard";
    return clearCookies(NextResponse.redirect(appUrl(dest, { nylasConnected: "1" })));
  } catch (err) {
    const message = err instanceof Error ? err.message : "nylas_callback_failed";
    return NextResponse.redirect(appUrl("/login", { nylasError: encodeURIComponent(message) }));
  }
}
