import OpenAI from "openai";
import { dbConnect } from "@/server/db/connect";
import { AiProvider } from "@/server/models/AiProvider";
import { decrypt } from "@/server/crypto/secretBox";
import { env } from "@/lib/env";

/**
 * Transcribe an audio blob via the user's OpenAI key + Whisper. Falls back to the
 * env-level OpenAI key if the project ever wires one. Returns null when no key
 * is configured — caller treats that as "transcription unavailable, skip".
 */
export async function transcribeAudio(
  userId: string,
  audio: Blob | File,
): Promise<string | null> {
  await dbConnect();
  const doc = await AiProvider.findOne({ userId, provider: "openai" });
  if (!doc) return null;

  const client = new OpenAI({ apiKey: decrypt(doc.encrypted) });
  // The OpenAI SDK requires a File-like input. Re-wrap a Blob as File for safety.
  const file = audio instanceof File ? audio : new File([audio], "interview.webm", { type: audio.type || "audio/webm" });
  const result = await client.audio.transcriptions.create({
    file,
    model: env.WHISPER_MODEL,
  });
  return result.text;
}
