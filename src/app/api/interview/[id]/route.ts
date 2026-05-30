import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { getSession } from "@/server/auth/session";
import { interviewToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    await dbConnect();
    const doc = await Interview.findOne({ _id: id, userId: session.userId });
    if (!doc) return fail("Interview not found", 404);
    return ok(interviewToDto(doc));
  } catch (err) {
    return handleError(err);
  }
}
