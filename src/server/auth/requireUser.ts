import { redirect } from "next/navigation";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { getSession, hasRefreshCookie } from "./session";
import type { UserDto } from "@/types";

/**
 * Page-level guard for server components. Returns the current user.
 *
 * When the access JWT has expired but a refresh cookie is present, redirects
 * through `/api/auth/refresh` so the session is silently rotated and the user
 * keeps browsing. Without a refresh cookie, redirects straight to `/login`.
 *
 * `isAdmin` is included as a non-DTO extension because pages use it to gate UI; the
 * public `UserDto` over the API does not expose it.
 */
export async function requireUser(): Promise<UserDto & { isAdmin: boolean }> {
  const session = await getSession();
  if (!session) {
    if (await hasRefreshCookie()) redirect("/api/auth/refresh");
    redirect("/login");
  }

  await dbConnect();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect("/login");

  return {
    id: String(user._id),
    email: user.email,
    fullName: user.fullName,
    isAdmin: Boolean(user.isAdmin),
  };
}
