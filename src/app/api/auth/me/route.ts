import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";
import type { UserDto } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const user = await User.findById(session.userId).lean();
    if (!user) return fail("Not authenticated", 401);

    const dto: UserDto = {
      id: String(user._id),
      email: user.email,
      fullName: user.fullName,
    };
    return ok(dto);
  } catch (err) {
    return handleError(err);
  }
}
