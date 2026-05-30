import { getSession } from "@/server/auth/session";
import { subscribe } from "@/server/services/notifications/pubsub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream. Clients (NotificationBell) connect once; the in-process
 * pubsub pushes events here as notify() fires elsewhere. Single-instance only —
 * the persisted Notification rows are the authoritative state on multi-instance hosts.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = subscribe(session.userId, (event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      });
      // Heartbeat every 25s to keep proxies / browsers from closing the connection.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 25_000);
      // Initial comment so the client knows the stream is established.
      controller.enqueue(encoder.encode(": connected\n\n"));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
