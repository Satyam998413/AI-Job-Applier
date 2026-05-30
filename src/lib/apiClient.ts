/** Thin client-side fetch wrapper. Throws Error(message) on non-2xx using the API's { error }. */
export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  let res = await rawFetch(input, init);

  // On 401 from a non-auth endpoint, try refreshing the access token once.
  // /api/auth/* is skipped so the refresh call itself can't trigger another refresh.
  if (res.status === 401 && !isAuthEndpoint(input)) {
    if (await tryRefresh()) res = await rawFetch(input, init);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = (payload && payload.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return payload as T;
}

function rawFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
}

function isAuthEndpoint(input: string): boolean {
  return input.startsWith("/api/auth/");
}

// De-dupe concurrent refresh attempts so a burst of parallel 401s triggers one call.
let inFlight: Promise<boolean> | null = null;
function tryRefresh(): Promise<boolean> {
  if (!inFlight) {
    inFlight = fetch("/api/auth/refresh", { method: "POST" })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}
