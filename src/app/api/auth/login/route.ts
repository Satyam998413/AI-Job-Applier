import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { setRefreshCookie, setSessionCookie } from "@/server/auth/session";
import { issueRefreshToken } from "@/server/auth/refresh";
import { ok, fail, handleError } from "@/lib/http";
import type { UserDto } from "@/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  identifier: z.string().trim().min(1, "Email or mobile is required"),
  password: z.string().min(1, "Password is required"),
});

function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(v);
}

export async function POST(req: Request) {
  try {
    const { identifier, password } = bodySchema.parse(await req.json());
    await dbConnect();

    const user = looksLikeEmail(identifier)
      ? await User.findOne({ email: identifier.toLowerCase() })
      : await User.findOne({ mobile: identifier });
    if (!user) return fail("Invalid credentials", 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail("Invalid credentials", 401);

    await setSessionCookie({ userId: user.id, email: user.email });
    const refresh = await issueRefreshToken(user.id);
    await setRefreshCookie(refresh);

    const dto: UserDto = { id: user.id, email: user.email, fullName: user.fullName };
    return ok(dto);
  } catch (err) {
    return handleError(err);
  }
}
