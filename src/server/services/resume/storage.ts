import { put, del, get } from "@vercel/blob";
import { randomUUID } from "crypto";
import { env } from "@/lib/env";

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".txt", ".md", ".html", ".htm", ".rtf"]);

const CONTENT_TYPE_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".rtf": "application/rtf",
};

function safeExtension(fileName: string): string {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) ? ext : ".bin";
}

/**
 * Upload a resume file to Vercel Blob.
 * Returns null when no BLOB_READ_WRITE_TOKEN is configured.
 * Stored at: {userId}/resumes/{uuid}.{ext}
 */
export async function saveResumeFile(
  userId: string,
  buffer: Buffer,
  fileName: string,
): Promise<{ url: string; storageKey: string } | null> {
  if (!env.BLOB_READ_WRITE_TOKEN) return null;

  const ext = safeExtension(fileName);
  const contentType = CONTENT_TYPE_MAP[ext] ?? "application/octet-stream";
  const storageKey = `${userId}/resumes/${randomUUID()}${ext}`;

  const result = await put(storageKey, buffer, {
    access: "public",
    contentType,
    token: env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  });

  return { url: result.url, storageKey };
}

export async function readResumeFile(blobUrl: string): Promise<Buffer> {
  const response = await fetch(blobUrl);
  if (!response.ok) throw new Error(`Resume not found: ${blobUrl}`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Delete a resume file from Vercel Blob by its storage key.
 * Deletion is best-effort — errors are silently swallowed.
 */
export async function deleteResumeFile(storageKey: string | null | undefined): Promise<void> {
  if (!storageKey) return;
  if (!storageKey.includes("resumes/")) return;

  try {
    await del(storageKey, { token: env.BLOB_READ_WRITE_TOKEN });
  } catch {
    // Already deleted or never existed — never propagate.
  }
}