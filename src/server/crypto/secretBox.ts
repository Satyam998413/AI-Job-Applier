import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { env } from "@/lib/env";

/**
 * AES-256-GCM at-rest encryption for user secrets (API keys).
 * `ENCRYPTION_KEY` must be a 32-byte base64 string (generate via `openssl rand -base64 32`).
 */

export type Sealed = {
  iv: string; // base64
  ciphertext: string; // base64
  tag: string; // base64
};

const ALGO = "aes-256-gcm";

let cachedKey: Buffer | null = null;
function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const buf = Buffer.from(env.ENCRYPTION_KEY, "base64");
  if (buf.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY must be a 32-byte base64 string. Generate one with `openssl rand -base64 32`.",
    );
  }
  cachedKey = buf;
  return buf;
}

export function encrypt(plaintext: string): Sealed {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    ciphertext: enc.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decrypt(sealed: Sealed): string {
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(sealed.iv, "base64"));
  decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

/** Last 4 visible chars of a secret, for non-sensitive display in the UI. */
export function lastFour(secret: string): string {
  const cleaned = secret.trim();
  return cleaned.length <= 4 ? cleaned : cleaned.slice(-4);
}
