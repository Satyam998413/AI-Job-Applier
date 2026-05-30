/**
 * In-process SSE pub/sub. Connections subscribe on `/api/notifications/stream`;
 * `notify()` calls `emitToUser` to push live updates.
 *
 * Limit: single-process only. On multi-instance deployments the SSE delivery becomes
 * best-effort per-instance; the persisted Notification row is still authoritative.
 */
type EventPayload = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
};

type Subscriber = (event: EventPayload) => void;

const subscribers = new Map<string, Set<Subscriber>>();

export function subscribe(userId: string, fn: Subscriber): () => void {
  let set = subscribers.get(userId);
  if (!set) {
    set = new Set();
    subscribers.set(userId, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) subscribers.delete(userId);
  };
}

export function emitToUser(userId: string, event: EventPayload): void {
  const set = subscribers.get(userId);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(event);
    } catch {
      // A misbehaving subscriber must not break the others.
    }
  }
}
