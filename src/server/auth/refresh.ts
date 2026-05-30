import { randomBytes, createHash } from "crypto";
import { dbConnect } from "@/server/db/connect";
import { RefreshToken } from "@/server/models/RefreshToken";
import { REFRESH_MAX_AGE } from "./session";

function hash(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Mints a new refresh token; persists its hash; returns the raw value to put in a cookie. */
export async function issueRefreshToken(userId: string): Promise<string> {
  await dbConnect();
  const raw = randomBytes(32).toString("hex");
  await RefreshToken.create({
    userId,
    tokenHash: hash(raw),
    expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
  });
  return raw;
}

export type RotateResult =
  | { ok: true; userId: string; nextRaw: string }
  | { ok: false; reason: "missing" | "invalid" | "expired" | "revoked" };

/**
 * Validates an incoming refresh token. On success: marks the old token revoked,
 * issues a replacement, returns the new raw token + the userId.
 *
 * Reuse detection: if a token that was already revoked is presented, every active
 * refresh token for that user is revoked — that's the classic stolen-token signal.
 */
export async function rotateRefreshToken(rawToken: string | null): Promise<RotateResult> {
  if (!rawToken) return { ok: false, reason: "missing" };
  await dbConnect();
  const tokenHash = hash(rawToken);
  const existing = await RefreshToken.findOne({ tokenHash });
  if (!existing) return { ok: false, reason: "invalid" };

  if (existing.revokedAt) {
    // Reuse of a revoked token — assume compromise; nuke everything for this user.
    await RefreshToken.updateMany(
      { userId: existing.userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    return { ok: false, reason: "revoked" };
  }
  if (existing.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const nextRaw = await issueRefreshToken(String(existing.userId));
  await RefreshToken.updateOne(
    { _id: existing._id },
    { $set: { revokedAt: new Date(), replacedBy: hash(nextRaw) } },
  );

  return { ok: true, userId: String(existing.userId), nextRaw };
}

export async function revokeRefreshToken(rawToken: string | null): Promise<void> {
  if (!rawToken) return;
  await dbConnect();
  await RefreshToken.updateOne(
    { tokenHash: hash(rawToken), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}
