import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export type SessionPayload = {
  userId: string;
  email: string;
};

// Short-lived access JWT. Refresh tokens (30d, rotating) handle session continuity.
const EXPIRES_IN = "1h";

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { algorithm: "HS256", expiresIn: EXPIRES_IN });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string") return null;
    const { userId, email } = decoded as jwt.JwtPayload;
    if (typeof userId !== "string" || typeof email !== "string") return null;
    return { userId, email };
  } catch {
    return null;
  }
}
