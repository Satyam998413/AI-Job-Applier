import { put } from "@vercel/blob";
import { env } from "@/lib/env";

/**
 * Store an interview media chunk in Vercel Blob and return the public URL.
 * Returns null when no BLOB_READ_WRITE_TOKEN is configured — caller should treat
 * that as "media storage disabled" and bail.
 */
export async function uploadInterviewMedia(
  userId: string,
  interviewId: string,
  filename: string,
  body: Blob | ArrayBuffer | File,
  contentType: string,
): Promise<{ url: string; storageKey: string } | null> {
  if (!env.BLOB_READ_WRITE_TOKEN) return null;

  const key = `${userId}/interviews/${interviewId}/${filename}`;

  const result = await put(key, body, {
    access: "public",
    contentType,
    token: env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  });

  return { url: result.url, storageKey: key };
}

