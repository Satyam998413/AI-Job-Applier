// AI Job Applier — background service worker.
// Routes API calls from the content script + popup to the user's running app.
// Auth is cookie-based: requests inherit the session cookie via host_permissions
// (you must be logged in to the app in the same browser).

const DEFAULT_API_URL = "http://localhost:3000";

async function getApiUrl() {
  const { apiUrl } = await chrome.storage.local.get("apiUrl");
  return apiUrl || DEFAULT_API_URL;
}

async function apiFetch(path, init = {}) {
  const base = await getApiUrl();
  const url = `${base.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (json && json.error) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === "ping") {
        const me = await apiFetch("/api/auth/me");
        sendResponse({ ok: true, user: me });
        return;
      }
      if (message.type === "suggest") {
        const result = await apiFetch("/api/qna/suggest", {
          method: "POST",
          body: JSON.stringify({ question: message.question, includeAi: true }),
        });
        sendResponse({ ok: true, result });
        return;
      }
      if (message.type === "saveAnswer") {
        const saved = await apiFetch("/api/qna", {
          method: "POST",
          body: JSON.stringify({
            question: message.question,
            answer: message.answer,
            source: "ai",
          }),
        });
        sendResponse({ ok: true, saved });
        return;
      }
      sendResponse({ ok: false, error: `Unknown message type: ${message.type}` });
    } catch (err) {
      sendResponse({ ok: false, error: err.message || "Background error" });
    }
  })();
  return true; // keep the channel open for async sendResponse
});
