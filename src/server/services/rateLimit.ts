import { NextResponse } from "next/server";
import { dbConnect } from "@/server/db/connect";
import { RateLimit } from "@/server/models/RateLimit";

export type RateLimitBucket =
  | "match"
  | "tailor"
  | "coverLetter"
  | "interviewPrep"
  | "ats"
  | "qnaSuggest"
  | "assistant";

type LimitConfig = { limit: number; windowSec: number };

const HOUR = 3600;

const LIMITS: Record<RateLimitBucket, LimitConfig> = {
  match: { limit: 60, windowSec: HOUR },
  tailor: { limit: 30, windowSec: HOUR },
  coverLetter: { limit: 30, windowSec: HOUR },
  interviewPrep: { limit: 20, windowSec: HOUR },
  ats: { limit: 30, windowSec: HOUR },
  qnaSuggest: { limit: 100, windowSec: HOUR },
  assistant: { limit: 100, windowSec: HOUR },
};

/**
 * Fixed-window per-user counter. Returns null if the call is allowed; returns
 * a 429 NextResponse (with Retry-After) if the user has exhausted their bucket.
 *
 * Atomicity: `windowStart` is floored to the window boundary, so concurrent
 * requests in the same window hit the same document; the unique index on
 * (userId, bucket, windowStart) + $inc guarantees no double-counting.
 */
export async function enforceRateLimit(
  userId: string,
  bucket: RateLimitBucket,
): Promise<NextResponse | null> {
  const config = LIMITS[bucket];
  const windowMs = config.windowSec * 1000;
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);

  await dbConnect();
  const doc = await RateLimit.findOneAndUpdate(
    { userId, bucket, windowStart },
    { $inc: { count: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (doc.count <= config.limit) return null;

  const resetMs = windowStart.getTime() + windowMs;
  const retryAfterSec = Math.max(1, Math.ceil((resetMs - now) / 1000));
  return NextResponse.json(
    {
      error: `Rate limit exceeded. Try again in ${retryAfterSec}s.`,
      retryAfterSec,
      limit: config.limit,
      windowSec: config.windowSec,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
