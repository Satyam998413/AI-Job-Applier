import { z } from "zod";

/**
 * Validated, server-only environment. Importing this in a route handler / service
 * guarantees the required vars exist (throws clearly on boot if not).
 */
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  /** AES-256-GCM key, 32 bytes base64. Generate with `openssl rand -base64 32`. */
  ENCRYPTION_KEY: z.string().min(1, "ENCRYPTION_KEY is required"),
  /** Optional system fallback used when a user has no active AI provider configured. */
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  /** Per-user keys now own JSearch; this env value is unused (kept for backward compat). */
  RAPIDAPI_KEY: z.string().optional(),
  /** Nylas v3. Get from dashboard.nylas.com. Both optional — without them, email features are disabled. */
  NYLAS_API_KEY: z.string().optional(),
  NYLAS_CLIENT_ID: z.string().optional(),
  /** Public base URL where the app is hosted. Used to build the Nylas OAuth redirect URI. */
  APP_URL: z.string().url().default("http://localhost:3000"),
  /** Nylas region API host. US default; EU customers should set https://api.eu.nylas.com. */
  NYLAS_API_URI: z.string().url().default("https://api.us.nylas.com"),
  /** Shared secret Vercel Cron sends in Authorization: Bearer <…>. Without it, /api/cron/* is unreachable. */
  CRON_SECRET: z.string().optional(),
  /** Set to "true" to disable node-cron scheduler (useful for testing or multi-instance setups). */
  CRON_DISABLED: z.string().optional(),
  /** Vercel Blob read/write token (https://vercel.com/storage/blob). Without it, interview media upload is disabled. */
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  /** Whisper transcription model — defaults to OpenAI's `whisper-1`. */
  WHISPER_MODEL: z.string().min(1).default("whisper-1"),
  /** Optional admin seeding variables. Used by /api/seed/admin. */
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
