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
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
  mobile: z
    .string()
    .trim()
    .regex(/^\+?[0-9 \-()]{7,20}$/u, "Enter a valid phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function POST(req: Request) {
  try {
    const { email, password, fullName, mobile } = bodySchema.parse(await req.json());
    await dbConnect();

    const orClauses: Record<string, string>[] = [{ email: email.toLowerCase() }];
    if (mobile) orClauses.push({ mobile });
    const existing = await User.findOne({ $or: orClauses }).lean();
    if (existing) {
      const sameMobile = mobile && existing.mobile === mobile;
      return fail(
        sameMobile ? "An account with this mobile already exists" : "An account with this email already exists",
        409,
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, fullName, mobile });

    await setSessionCookie({ userId: user.id, email: user.email });
    const refresh = await issueRefreshToken(user.id);
    await setRefreshCookie(refresh);

    const dto: UserDto = { id: user.id, email: user.email, fullName: user.fullName };
    return ok(dto, 201);
  } catch (err) {
    return handleError(err);
  }
}
