import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

/** Signed share-token payload. The hash of this whole token is what's stored on Interview.share.tokenHash. */
type Payload = { interviewId: string; nonce: string };

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function issueShareToken(interviewId: string, expiresInDays: number): { raw: string; hash: string; expiresAt: Date } {
  const payload: Payload = { interviewId, nonce: randomBytes(8).toString("hex") };
  const raw = jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: `${expiresInDays}d`,
  });
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  return { raw, hash: hashToken(raw), expiresAt };
}

export function verifyShareToken(raw: string): { interviewId: string } | null {
  try {
    const decoded = jwt.verify(raw, env.JWT_SECRET);
    if (typeof decoded === "string") return null;
    const interviewId = (decoded as jwt.JwtPayload).interviewId;
    if (typeof interviewId !== "string") return null;
    return { interviewId };
  } catch {
    return null;
  }
}
