import { dbConnect } from "@/server/db/connect";
import { getSession } from "@/server/auth/session";
import {
  getUserSettings,
  updateUserSettings,
  userSettingsPatchSchema,
} from "@/server/services/userSettings";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    return ok(await getUserSettings(session.userId));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const patch = userSettingsPatchSchema.parse(await req.json());

    await dbConnect();
    return ok(await updateUserSettings(session.userId, patch));
  } catch (err) {
    return handleError(err);
  }
}
