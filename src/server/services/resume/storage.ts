import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

/**
 * On-disk store for original resume files. Files live under
 * `<project-root>/uploads/resumes/<userId>/<uuid>.<ext>` — OUTSIDE `public/` so they
 * are NOT directly URL-accessible. The authenticated route handler at
 * `/api/resume/[id]/file` is the only way to read them.
 */
const ROOT_DIR = path.join(process.cwd(), "uploads", "resumes");

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".txt", ".md", ".html", ".htm", ".rtf"]);

function safeExtension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) return ".bin";
  return ext;
}

export async function saveResumeFile(
  userId: string,
  buffer: Buffer,
  fileName: string,
): Promise<{ storageKey: string; relativePath: string }> {
  const dir = path.join(ROOT_DIR, userId);
  await mkdir(dir, { recursive: true });
  const id = randomUUID();
  const ext = safeExtension(fileName);
  const storageKey = `${id}${ext}`;
  const absolutePath = path.join(dir, storageKey);
  await writeFile(absolutePath, buffer);
  // Path relative to repo root — what we persist in Resume.filePath.
  const relativePath = path.relative(process.cwd(), absolutePath);
  return { storageKey, relativePath };
}

export async function readResumeFile(relativePath: string): Promise<Buffer> {
  // Hard-stop on escapes: the resolved path must still live under ROOT_DIR.
  const absolute = path.resolve(process.cwd(), relativePath);
  if (!absolute.startsWith(ROOT_DIR)) {
    throw new Error("Refusing to read a path outside the uploads directory");
  }
  return await readFile(absolute);
}

export async function deleteResumeFile(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) return;
  try {
    const absolute = path.resolve(process.cwd(), relativePath);
    if (!absolute.startsWith(ROOT_DIR)) return;
    await unlink(absolute);
  } catch {
    // File already gone (or never existed) — never propagate; deletion is best-effort.
  }
}
