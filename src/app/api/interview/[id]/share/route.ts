import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { getSession } from "@/server/auth/session";
import { issueShareToken } from "@/server/services/interview/shareToken";
import { env } from "@/lib/env";
import { ok, fail, handleError } from "@/lib/http";
import type { InterviewShareDto } from "@/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const DEFAULT_TTL_DAYS = 30;

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    await dbConnect();
    const doc = await Interview.findOne({ _id: id, userId: session.userId });
    if (!doc) return fail("Interview not found", 404);

    const { raw, hash, expiresAt } = issueShareToken(id, DEFAULT_TTL_DAYS);
    await Interview.updateOne(
      { _id: id },
      { $set: { share: { tokenHash: hash, expiresAt, revokedAt: null, viewedCount: 0 } } },
    );

    const dto: InterviewShareDto = {
      url: `${env.APP_URL.replace(/\/$/, "")}/i/${raw}`,
      expiresAt: expiresAt.toISOString(),
      revokedAt: null,
      viewedCount: 0,
    };
    return ok(dto, 201);
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
    await Interview.updateOne(
      { _id: id, userId: session.userId },
      { $set: { "share.revokedAt": new Date(), "share.tokenHash": null } },
    );
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
