import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { QnA } from "@/server/models/QnA";
import { getSession } from "@/server/auth/session";
import { qnaToDto } from "@/server/serializers";
import { normalizeQuestion } from "@/server/services/qna/normalize";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

const patchSchema = z.object({
  question: z.string().trim().min(3).optional(),
  answer: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    const body = patchSchema.parse(await req.json());
    await dbConnect();
    const update: Record<string, unknown> = {};
    if (body.question) {
      update.question = body.question;
      update.normalizedQuestion = normalizeQuestion(body.question);
    }
    if (body.answer) update.answer = body.answer;
    if (body.category) update.category = body.category;

    const doc = await QnA.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: update },
      { new: true },
    );
    if (!doc) return fail("Not found", 404);
    return ok(qnaToDto(doc));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    await dbConnect();
    const doc = await QnA.findOneAndDelete({ _id: id, userId: session.userId });
    if (!doc) return fail("Not found", 404);
    return ok({ id });
  } catch (err) {
    return handleError(err);
  }
}
