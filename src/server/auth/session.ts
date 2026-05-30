import { cookies } from "next/headers";
import { signSession, verifySession, type SessionPayload } from "./jwt";

export const SESSION_COOKIE = "aja_session";
export const REFRESH_COOKIE = "aja_refresh";
const ACCESS_MAX_AGE = 60 * 60; // 1 hour — matches JWT expiry
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
}

export async function setRefreshCookie(rawToken: string): Promise<void> {
  const store = await cookies();
  store.set(REFRESH_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function hasRefreshCookie(): Promise<boolean> {
  const store = await cookies();
  return store.has(REFRESH_COOKIE);
}

export async function readRefreshCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

/** Returns the verified session payload, or null if unauthenticated. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
