import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { getSession, setSessionCookie } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";
import type { UserProfileDto } from "@/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  mobile: z
    .string()
    .trim()
    .regex(/^\+?[0-9 \-()]{7,20}$/u, "Enter a valid phone number")
    .or(z.literal("").transform(() => ""))
    .optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) return fail("Not authenticated", 401);

    const dto: UserProfileDto = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      mobile: user.mobile ?? null,
      passwordSetByUser: user.passwordSetByUser,
    };
    return ok(dto);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const body = bodySchema.parse(await req.json());
    await dbConnect();
    const user = await User.findById(session.userId);
    if (!user) return fail("Not authenticated", 401);

    if (body.email && body.email !== user.email) {
      const existing = await User.findOne({ email: body.email.toLowerCase() }).lean();
      if (existing) return fail("That email is already in use.", 409);
      user.email = body.email.toLowerCase();
    }
    if (body.mobile !== undefined) {
      const next = body.mobile === "" ? undefined : body.mobile;
      if (next && next !== user.mobile) {
        const existing = await User.findOne({ mobile: next }).lean();
        if (existing) return fail("That mobile is already in use.", 409);
      }
      user.mobile = next;
    }
    if (body.fullName) user.fullName = body.fullName;
    await user.save();

    // If email changed, refresh the JWT so the session cookie stays consistent.
    await setSessionCookie({ userId: user.id, email: user.email });

    const dto: UserProfileDto = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      mobile: user.mobile ?? null,
      passwordSetByUser: user.passwordSetByUser,
    };
    return ok(dto);
  } catch (err) {
    return handleError(err);
  }
}
