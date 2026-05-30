// AI Job Applier popup. Shows auth status, detected question count, lets the user
// fire "Suggest all" on the current tab and configure the app URL.

const statusDot = document.querySelector(".status-dot");
const statusText = document.querySelector(".status-text");
const countEl = document.getElementById("count");
const fillBtn = document.getElementById("fillAll");
const openBtn = document.getElementById("openApp");
const apiInput = document.getElementById("apiUrl");
const saveBtn = document.getElementById("saveApiUrl");

const DEFAULT_API_URL = "http://localhost:3000";

function setStatus(state, message) {
  statusDot.setAttribute("data-state", state);
  statusText.textContent = message;
}

async function loadApiUrl() {
  const { apiUrl } = await chrome.storage.local.get("apiUrl");
  apiInput.value = apiUrl || DEFAULT_API_URL;
}

async function ping() {
  setStatus("idle", "Checking…");
  try {
    const resp = await chrome.runtime.sendMessage({ type: "ping" });
    if (resp?.ok) {
      setStatus("ok", `Signed in as ${resp.user.email}`);
      fillBtn.disabled = false;
    } else {
      setStatus("err", resp?.error || "Not signed in to the app");
      fillBtn.disabled = true;
    }
  } catch (err) {
    setStatus("err", err.message || "Cannot reach the app");
    fillBtn.disabled = true;
  }
}

async function refreshCount() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { type: "countDetected" }, (resp) => {
      if (chrome.runtime.lastError) {
        countEl.textContent = "0";
        return;
      }
      countEl.textContent = String(resp?.count ?? 0);
    });
  } catch {
    countEl.textContent = "0";
  }
}

fillBtn.addEventListener("click", async () => {
  fillBtn.disabled = true;
  fillBtn.textContent = "Filling…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.tabs.sendMessage(tab.id, { type: "fillAll" });
  } finally {
    fillBtn.textContent = "Suggest all answers";
    fillBtn.disabled = false;
  }
});

openBtn.addEventListener("click", async () => {
  const { apiUrl } = await chrome.storage.local.get("apiUrl");
  chrome.tabs.create({ url: (apiUrl || DEFAULT_API_URL) + "/dashboard" });
});

saveBtn.addEventListener("click", async () => {
  const value = apiInput.value.trim();
  if (!value) return;
  await chrome.storage.local.set({ apiUrl: value });
  saveBtn.textContent = "Saved";
  await ping();
  setTimeout(() => (saveBtn.textContent = "Save"), 1200);
});

loadApiUrl().then(ping).then(refreshCount);
