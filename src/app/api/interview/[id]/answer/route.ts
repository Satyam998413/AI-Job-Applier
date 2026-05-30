import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  questionIndex: z.number().int().min(0),
  transcript: z.string().max(8000).optional(),
  codeSubmission: z.string().max(20000).optional(),
});

export async function POST(req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    const { questionIndex, transcript, codeSubmission } = bodySchema.parse(await req.json());

    await dbConnect();
    const doc = await Interview.findOne({ _id: id, userId: session.userId });
    if (!doc) return fail("Interview not found", 404);
    if (questionIndex >= doc.questions.length) return fail("Invalid question index", 400);

    const updates: Record<string, unknown> = {
      [`questions.${questionIndex}.answeredAt`]: new Date(),
    };
    if (transcript !== undefined) updates[`questions.${questionIndex}.transcript`] = transcript;
    if (codeSubmission !== undefined) updates[`questions.${questionIndex}.codeSubmission`] = codeSubmission;

    await Interview.updateOne({ _id: id }, { $set: updates });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
