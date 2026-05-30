import { dbConnect } from "@/server/db/connect";
import { Resume } from "@/server/models/Resume";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { parseResume } from "@/server/services/resume/parseResume";
import { saveResumeFile } from "@/server/services/resume/storage";
import { resumeToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const resume = await getDefaultResume(session.userId);
    return ok(resume ? resumeToDto(resume) : null);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No file uploaded", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResume(session.userId, buffer, file.name, file.type);
    const stored = await saveResumeFile(session.userId, buffer, file.name);

    await dbConnect();
    // Multi-resume: every upload creates a NEW row. The very first upload becomes default.
    const existing = await Resume.countDocuments({ userId: session.userId });
    const resume = await Resume.create({
      userId: session.userId,
      fileName: file.name,
      rawText: parsed.rawText,
      skills: parsed.skills,
      summary: parsed.summary,
      experienceYears: parsed.experienceYears,
      extractedAt: new Date(),
      isDefault: existing === 0,
      filePath: stored?.url || null,
      mimeType: file.type || null,
      fileSize: file.size || buffer.byteLength,
    });
    // fileUrl is just the API path that serves the bytes back — set after insert so
    // the URL embeds the actual Mongo _id.
    resume.fileUrl = `/api/resume/${String(resume._id)}/file`;
    await resume.save();

    return ok(resumeToDto(resume), 201);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      if (err.message.includes("Could not read any text from the uploaded file")) {
        return fail(err.message, 400);
      }
      if (err.message.includes("Unsupported file type")) {
        return fail(err.message, 400);
      }
      if (err.message.includes("Legacy .doc files")) {
        return fail(err.message, 400);
      }
    }
    return handleError(err);
  }
}
