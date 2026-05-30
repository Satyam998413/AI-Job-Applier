import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { AiProvider, AI_PROVIDER_NAMES } from "@/server/models/AiProvider";
import { getSession } from "@/server/auth/session";
import { encrypt, lastFour } from "@/server/crypto/secretBox";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

const providerSchema = z.enum(AI_PROVIDER_NAMES);
const bodySchema = z.object({ apiKey: z.string().trim().min(8, "API key looks too short") });

type Ctx = { params: Promise<{ provider: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const provider = providerSchema.parse((await params).provider);
    const { apiKey } = bodySchema.parse(await req.json());

    await dbConnect();
    const existingActive = await AiProvider.findOne({ userId: session.userId, isActive: true });
    const makeActive = !existingActive; // First key set becomes active automatically.

    await AiProvider.findOneAndUpdate(
      { userId: session.userId, provider },
      {
        $set: {
          encrypted: encrypt(apiKey),
          lastFour: lastFour(apiKey),
          ...(makeActive ? { isActive: true } : {}),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return ok({ provider, configured: true, isActive: makeActive }, 201);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const provider = providerSchema.parse((await params).provider);
    await dbConnect();
    const deleted = await AiProvider.findOneAndDelete({ userId: session.userId, provider });

    // If we removed the active provider, promote another configured one if any.
    if (deleted?.isActive) {
      const next = await AiProvider.findOne({ userId: session.userId }).sort({ updatedAt: -1 });
      if (next) {
        next.isActive = true;
        await next.save();
      }
    }
    return ok({ provider, configured: false });
  } catch (err) {
    return handleError(err);
  }
}
