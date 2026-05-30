import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { QnA } from "@/server/models/QnA";
import { getSession } from "@/server/auth/session";
import { qnaToDto } from "@/server/serializers";
import { normalizeQuestion } from "@/server/services/qna/normalize";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

const bodySchema = z.object({
  question: z.string().trim().min(3, "Question is too short"),
  answer: z.string().trim().min(1, "Answer is required"),
  category: z.string().trim().min(1).optional(),
  source: z.enum(["saved", "ai"]).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const items = await QnA.find({ userId: session.userId }).sort({ updatedAt: -1 });
    return ok(items.map(qnaToDto));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const body = bodySchema.parse(await req.json());
    const normalizedQuestion = normalizeQuestion(body.question);
    if (!normalizedQuestion) return fail("Question is too short", 400);

    await dbConnect();
    // Upsert by (user, normalized) so saving the same question replaces the answer.
    const doc = await QnA.findOneAndUpdate(
      { userId: session.userId, normalizedQuestion },
      {
        $set: {
          question: body.question,
          answer: body.answer,
          category: body.category ?? "general",
          source: body.source ?? "saved",
        },
        $setOnInsert: { usageCount: 0 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return ok(qnaToDto(doc!), 201);
  } catch (err) {
    return handleError(err);
  }
}
