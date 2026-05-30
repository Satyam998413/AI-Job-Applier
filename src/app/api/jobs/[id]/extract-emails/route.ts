import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { getSession } from "@/server/auth/session";
import { extractEmailsFromText } from "@/server/services/jobs/extractEmails";
import { jobToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid job id", 400);

    await dbConnect();
    const job = await Job.findById(id);
    if (!job) return fail("Job not found", 404);

    // Run only the text extractor for now. URL-fetch + page extraction is plan/24's
    // next iteration once the per-domain throttle + robots gate are in place.
    const extracted = extractEmailsFromText(job.description, "description").map((e) => ({
      ...e,
      extractedAt: new Date(),
    }));

    await Job.updateOne({ _id: job._id }, { $set: { extractedEmails: extracted } });
    const updated = await Job.findById(id);
    return ok(jobToDto(updated!));
  } catch (err) {
    return handleError(err);
  }
}
