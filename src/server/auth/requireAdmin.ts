import { redirect } from "next/navigation";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { getSession, hasRefreshCookie } from "./session";
import type { UserDto } from "@/types";

/** Page-level guard: returns the current admin user or redirects /dashboard. */
export async function requireAdmin(): Promise<UserDto> {
  const session = await getSession();
  if (!session) {
    if (await hasRefreshCookie()) redirect("/api/auth/refresh");
    redirect("/login");
  }

  await dbConnect();
  const user = await User.findById(session.userId);
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/dashboard");

  return { id: user.id, email: user.email, fullName: user.fullName };
}

/** API-level guard: returns the session or throws an HttpError-like Error. */
export async function isCurrentAdmin(): Promise<{ userId: string } | null> {
  const session = await getSession();
  if (!session) return null;
  await dbConnect();
  const user = await User.findById(session.userId, { isAdmin: 1 });
  if (!user?.isAdmin) return null;
  return { userId: session.userId };
}
