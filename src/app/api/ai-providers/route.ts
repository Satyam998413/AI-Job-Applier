import { dbConnect } from "@/server/db/connect";
import { AiProvider, AI_PROVIDER_NAMES } from "@/server/models/AiProvider";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";
import type { AiProviderRowDto, AiProviderName } from "@/types";

export const runtime = "nodejs";

/** Returns one row per supported provider, configured or not. */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const docs = await AiProvider.find({ userId: session.userId });
    const byProvider = new Map(docs.map((d) => [d.provider as AiProviderName, d]));

    const rows: AiProviderRowDto[] = AI_PROVIDER_NAMES.map((p) => {
      const d = byProvider.get(p);
      return {
        provider: p,
        configured: Boolean(d),
        lastFour: d ? d.lastFour : null,
        isActive: d ? d.isActive : false,
      };
    });
    return ok(rows);
  } catch (err) {
    return handleError(err);
  }
}
