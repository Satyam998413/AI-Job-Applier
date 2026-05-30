import Nylas from "nylas";
import { env } from "@/lib/env";

/**
 * Single shared Nylas v3 SDK client. All Nylas calls in the app go through this module.
 * Throws a clear error if Nylas credentials are missing instead of failing deep inside the SDK.
 */

let cached: Nylas | null = null;

export function getNylas(): Nylas {
  if (!env.NYLAS_API_KEY) {
    throw new Error("Nylas is not configured. Set NYLAS_API_KEY in .env.local.");
  }
  if (!cached) cached = new Nylas({ apiKey: env.NYLAS_API_KEY, apiUri: env.NYLAS_API_URI });
  return cached;
}

export function isNylasConfigured(): boolean {
  return Boolean(env.NYLAS_API_KEY && env.NYLAS_CLIENT_ID);
}

export function requireNylasConfigured(): void {
  if (!env.NYLAS_API_KEY || !env.NYLAS_CLIENT_ID) {
    throw new Error(
      "Nylas is not configured. Set NYLAS_API_KEY and NYLAS_CLIENT_ID in .env.local.",
    );
  }
}

/** Full callback URL built from APP_URL. Must be registered in the Nylas dashboard. */
export function nylasRedirectUri(): string {
  return `${env.APP_URL.replace(/\/$/, "")}/api/nylas/callback`;
}
