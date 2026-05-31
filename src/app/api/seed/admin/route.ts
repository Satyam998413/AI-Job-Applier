import bcrypt from "bcryptjs";
import { dbConnect } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { env } from "@/lib/env";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

/**
 * POST /api/seed/admin
 * Creates a default admin user from SEED_ADMIN_EMAIL & SEED_ADMIN_PASSWORD env vars.
 * Idempotent: returns success even if admin exists.
 * Only runs if SEED_ADMIN_EMAIL is set in environment.
 */
export async function POST(req: Request) {
  try {
    if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
      return fail("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in env", 400);
    }

    await dbConnect();

    // Check if admin already exists
    const existing = await User.findOne({ email: env.SEED_ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      if (existing.isAdmin) {
        return ok({
          message: "Admin user already exists",
          email: existing.email,
          isAdmin: true,
        });
      }
      // Upgrade existing user to admin
      existing.isAdmin = true;
      await existing.save();
      return ok({
        message: "User upgraded to admin",
        email: existing.email,
        isAdmin: true,
      });
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
    const adminUser = await User.create({
      email: env.SEED_ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      fullName: "Admin",
      isAdmin: true,
      passwordSetByUser: true,
    });

    return ok(
      {
        message: "Admin user created successfully",
        email: adminUser.email,
        isAdmin: true,
        id: adminUser.id,
      },
      201,
    );
  } catch (err) {
    return handleError(err);
  }
}
