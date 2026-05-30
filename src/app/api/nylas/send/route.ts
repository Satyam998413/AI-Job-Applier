import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { ConnectedEmail } from "@/server/models/ConnectedEmail";
import { Match } from "@/server/models/Match";
import { EmailLog } from "@/server/models/EmailLog";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { getNylas, requireNylasConfigured } from "@/server/services/nylas/nylasClient";
import { ok, fail, handleError } from "@/lib/http";
import type { EmailSendResultDto } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const emailListSchema = z
  .array(z.string().email())
  .or(z.string())
  .transform((v) => (Array.isArray(v) ? v : v.split(/[,;]\s*/).filter(Boolean)))
  .pipe(z.array(z.string().email()).max(20));

const bodySchema = z.object({
  to: emailListSchema,
  cc: emailListSchema.optional(),
  bcc: emailListSchema.optional(),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1),
  jobId: z.string().optional(),
  attachResume: z.boolean().optional(),
  mode: z.enum(["compose", "test"]).optional(),
});

function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");
}

async function buildResumeAttachment(userId: string, jobId?: string) {
  if (!jobId || !isValidObjectId(jobId)) {
    const resume = await getDefaultResume(userId);
    if (!resume?.rawText) return null;
    return {
      filename: "resume.txt",
      contentType: "text/plain",
      content: Buffer.from(resume.rawText, "utf8").toString("base64"),
    };
  }
  // Prefer the tailored resume for this job when present.
  const match = await Match.findOne({ userId, jobId });
  if (match?.tailoredResume) {
    return {
      filename: "tailored-resume.md",
      contentType: "text/markdown",
      content: Buffer.from(match.tailoredResume, "utf8").toString("base64"),
    };
  }
  const resume = await getDefaultResume(userId);
  if (!resume?.rawText) return null;
  return {
    filename: "resume.txt",
    contentType: "text/plain",
    content: Buffer.from(resume.rawText, "utf8").toString("base64"),
  };
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    requireNylasConfigured();
    const body = bodySchema.parse(await req.json());

    await dbConnect();
    const conn = await ConnectedEmail.findOne({ userId: session.userId });
    if (!conn || conn.syncStatus !== "active") {
      return fail("Connect your Google email in Settings to send.", 409);
    }

    const attachment = body.attachResume ? await buildResumeAttachment(session.userId, body.jobId) : null;
    const mode = body.mode ?? "compose";

    let messageId: string | null = null;
    let errorMessage: string | null = null;
    let status: "sent" | "failed" = "sent";

    try {
      const sent = await getNylas().messages.send({
        identifier: conn.grantId,
        requestBody: {
          to: body.to.map((email) => ({ email })),
          cc: body.cc?.map((email) => ({ email })),
          bcc: body.bcc?.map((email) => ({ email })),
          subject: body.subject,
          body: plainTextToHtml(body.body),
          attachments: attachment ? [attachment] : undefined,
        },
      });
      messageId = sent.data?.id ?? null;
    } catch (err) {
      status = "failed";
      errorMessage = err instanceof Error ? err.message : "Send failed";
    }

    const log = await EmailLog.create({
      userId: session.userId,
      jobId: body.jobId && isValidObjectId(body.jobId) ? body.jobId : null,
      grantId: conn.grantId,
      provider: conn.provider,
      to: body.to,
      cc: body.cc ?? [],
      bcc: body.bcc ?? [],
      subject: body.subject,
      bodyPreview: body.body.slice(0, 280),
      status,
      errorMessage,
      messageId,
      mode,
    });

    const result: EmailSendResultDto = {
      status,
      messageId,
      errorMessage,
      logId: String(log._id),
    };
    if (status === "failed") return fail(errorMessage ?? "Send failed", 502);
    return ok(result, 201);
  } catch (err) {
    if (err instanceof Error && /not configured/i.test(err.message)) return fail(err.message, 503);
    return handleError(err);
  }
}
