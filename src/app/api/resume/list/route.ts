import { dbConnect } from "@/server/db/connect";
import { Resume } from "@/server/models/Resume";
import { getSession } from "@/server/auth/session";
import { resumeToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const resumes = await Resume.find({ userId: session.userId }).sort({
      isDefault: -1,
      updatedAt: -1,
    });
    return ok(resumes.map(resumeToDto));
  } catch (err) {
    return handleError(err);
  }
}
