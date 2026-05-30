import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Resume } from "@/server/models/Resume";
import { getSession } from "@/server/auth/session";
import { readResumeFile } from "@/server/services/resume/storage";
import { fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid resume id", 400);

    await dbConnect();
    const resume = await Resume.findOne({ _id: id, userId: session.userId });
    if (!resume) return fail("Resume not found", 404);
    if (!resume.filePath) return fail("Original file is not stored for this resume", 410);

    const buffer = await readResumeFile(resume.filePath);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": resume.mimeType || "application/octet-stream",
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": `inline; filename="${resume.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
