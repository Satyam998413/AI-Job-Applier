import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

const bodySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { currentPassword, newPassword } = bodySchema.parse(await req.json());
    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) return fail("Not authenticated", 401);

    const ok_ = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok_) return fail("Current password is incorrect.", 401);

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
