import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

const bodySchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/set-password
 * Allows authenticated users (especially Nylas-signup users) to set their own password.
 * After this, they can login with email + password even if they originally signed up via Nylas.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { newPassword } = bodySchema.parse(await req.json());
    await dbConnect();

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await User.findByIdAndUpdate(
      session.userId,
      {
        $set: {
          passwordHash,
          passwordSetByUser: true,
        },
      },
      { new: true },
    ).lean();

    if (!updated) return fail("User not found", 404);

    return ok({
      id: String(updated._id),
      email: updated.email,
      fullName: updated.fullName,
      message: "Password set successfully. You can now login with your email and password.",
    });
  } catch (err) {
    return handleError(err);
  }
}
