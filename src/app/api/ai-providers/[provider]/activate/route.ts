import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { AiProvider, AI_PROVIDER_NAMES } from "@/server/models/AiProvider";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

const providerSchema = z.enum(AI_PROVIDER_NAMES);

type Ctx = { params: Promise<{ provider: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const provider = providerSchema.parse((await params).provider);
    await dbConnect();

    const target = await AiProvider.findOne({ userId: session.userId, provider });
    if (!target) return fail("Configure this provider first.", 404);

    // Deactivate all others, activate target, in two writes (no transactions on free Atlas).
    await AiProvider.updateMany(
      { userId: session.userId, _id: { $ne: target._id } },
      { $set: { isActive: false } },
    );
    target.isActive = true;
    await target.save();

    return ok({ provider, isActive: true });
  } catch (err) {
    return handleError(err);
  }
}
