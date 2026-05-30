import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { JsearchKey, currentMonthKey } from "@/server/models/JsearchKey";
import { getSession } from "@/server/auth/session";
import { encrypt, lastFour } from "@/server/crypto/secretBox";
import { ok, fail, handleError } from "@/lib/http";
import type { JsearchStatusDto } from "@/types";

export const runtime = "nodejs";

const bodySchema = z.object({ apiKey: z.string().trim().min(8, "JSearch key looks too short") });

function toStatus(doc: {
  lastFour: string;
  isActive: boolean;
  totalLimit: number;
  usedThisMonth: number;
  monthKey: string;
  lastCallAt?: Date | null;
} | null): JsearchStatusDto {
  if (!doc) {
    return {
      configured: false,
      lastFour: null,
      isActive: false,
      totalLimit: 100,
      usedThisMonth: 0,
      remaining: 100,
      monthKey: currentMonthKey(),
      lastCallAt: null,
    };
  }
  return {
    configured: true,
    lastFour: doc.lastFour,
    isActive: doc.isActive,
    totalLimit: doc.totalLimit,
    usedThisMonth: doc.usedThisMonth,
    remaining: Math.max(0, doc.totalLimit - doc.usedThisMonth),
    monthKey: doc.monthKey,
    lastCallAt: doc.lastCallAt ? doc.lastCallAt.toISOString() : null,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const doc = await JsearchKey.findOne({ userId: session.userId });
    return ok(toStatus(doc));
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { apiKey } = bodySchema.parse(await req.json());
    await dbConnect();
    const doc = await JsearchKey.findOneAndUpdate(
      { userId: session.userId },
      { $set: { encrypted: encrypt(apiKey), lastFour: lastFour(apiKey), isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return ok(toStatus(doc), 201);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    await JsearchKey.findOneAndDelete({ userId: session.userId });
    return ok(toStatus(null));
  } catch (err) {
    return handleError(err);
  }
}
