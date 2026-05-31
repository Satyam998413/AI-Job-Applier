import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

const bodySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  mobile: z
    .string()
    .trim()
    .regex(/^\+?[0-9 \-()]{7,20}$/u, "Enter a valid phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/**
 * PATCH /api/auth/update-profile
 * Updates the authenticated user's profile information.
 */
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { fullName, mobile } = bodySchema.parse(await req.json());
    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      session.userId,
      { $set: { fullName, mobile } },
      { new: true },
    ).lean();

    if (!updated) return fail("User not found", 404);

    return ok({
      id: String(updated._id),
      email: updated.email,
      fullName: updated.fullName,
    });
  } catch (err) {
    return handleError(err);
  }
}
