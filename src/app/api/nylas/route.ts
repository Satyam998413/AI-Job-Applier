import { dbConnect } from "@/server/db/connect";
import { ConnectedEmail } from "@/server/models/ConnectedEmail";
import { getSession } from "@/server/auth/session";
import { getNylas, isNylasConfigured } from "@/server/services/nylas/nylasClient";
import { ok, fail, handleError } from "@/lib/http";
import type { ConnectedEmailDto, SyncStatus } from "@/types";

export const runtime = "nodejs";

function toDto(doc: {
  emailAddress: string;
  provider: string;
  syncStatus: SyncStatus;
  connectedAt?: Date | null;
} | null): ConnectedEmailDto {
  const nylasConfigured = isNylasConfigured();
  if (!doc) {
    return {
      configured: false,
      emailAddress: null,
      provider: null,
      syncStatus: "disconnected",
      connectedAt: null,
      nylasConfigured,
    };
  }
  return {
    configured: true,
    emailAddress: doc.emailAddress,
    provider: doc.provider,
    syncStatus: doc.syncStatus,
    connectedAt: doc.connectedAt ? doc.connectedAt.toISOString() : null,
    nylasConfigured,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const doc = await ConnectedEmail.findOne({ userId: session.userId });
    return ok(toDto(doc));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const doc = await ConnectedEmail.findOneAndDelete({ userId: session.userId });

    // Best-effort revoke on Nylas side; don't block the disconnect if it fails.
    if (doc && isNylasConfigured()) {
      try {
        await getNylas().grants.destroy({ grantId: doc.grantId });
      } catch {
        /* swallow */
      }
    }
    return ok(toDto(null));
  } catch (err) {
    return handleError(err);
  }
}
