import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { getSession } from "@/server/auth/session";
import { uploadInterviewMedia } from "@/server/services/interview/uploadInterviewMedia";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No file uploaded", 400);
    const kindRaw = form.get("kind");
    const kind = kindRaw === "video" ? "video" : "audio";

    await dbConnect();
    const interview = await Interview.findOne({ _id: id, userId: session.userId });
    if (!interview) return fail("Interview not found", 404);

    const stored = await uploadInterviewMedia(session.userId,id, file.name, file, file.type || "audio/webm");
    if (!stored) return fail("Media storage is not configured (BLOB_READ_WRITE_TOKEN)", 503);

    await Interview.updateOne(
      { _id: id },
      {
        $push: {
          media: {
            kind,
            storageKey: stored.storageKey,
            url: stored.url,
            mimeType: file.type || "audio/webm",
            sizeBytes: file.size,
          },
        },
      },
    );
    return ok({ url: stored.url }, 201);
  } catch (err) {
    return handleError(err);
  }
}
