// AI Job Applier content script.
// Walks the page for likely application-form questions (textarea + nearest label)
// and injects an "AI ✨" button next to each that asks the background for a suggestion.

(() => {
  const TAGGED = "ajaTagged";

  function nearestLabel(el) {
    // 1) explicit <label for=id>
    if (el.id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl?.textContent?.trim()) return lbl.textContent.trim();
    }
    // 2) wrapped <label>
    const wrapping = el.closest("label");
    if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
    // 3) preceding sibling element with text
    let node = el.previousElementSibling;
    while (node) {
      const text = node.textContent?.trim();
      if (text && text.length < 240 && /[a-z]/i.test(text)) return text;
      node = node.previousElementSibling;
    }
    // 4) walk up to a parent block & look for heading/strong/label-ish nodes
    let parent = el.parentElement;
    for (let i = 0; parent && i < 3; i++, parent = parent.parentElement) {
      const cand = parent.querySelector("label, legend, h1, h2, h3, h4, h5, strong");
      if (cand && cand.textContent?.trim()) return cand.textContent.trim();
    }
    // 5) placeholder/aria-label fallback
    return el.getAttribute("aria-label") || el.getAttribute("placeholder") || "";
  }

  function injectButton(textarea) {
    if (textarea.dataset[TAGGED] === "1") return;
    textarea.dataset[TAGGED] = "1";

    const question = nearestLabel(textarea);
    if (!question || question.length < 5) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "aja-suggest-btn";
    btn.setAttribute("aria-label", "Suggest answer with AI Job Applier");
    btn.title = "Suggest answer with AI Job Applier";
    btn.innerHTML = `<span aria-hidden>✨</span><span class="aja-btn-text">AI suggest</span>`;

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.disabled = true;
      btn.dataset.state = "loading";
      btn.querySelector(".aja-btn-text").textContent = "Thinking…";
      try {
        const resp = await chrome.runtime.sendMessage({ type: "suggest", question });
        if (!resp?.ok) throw new Error(resp?.error || "Failed");
        const answer = resp.result?.exact?.answer || resp.result?.suggestions?.[0]?.match.answer || resp.result?.aiAnswer;
        if (!answer) throw new Error("No suggestion returned");
        insertIntoTextarea(textarea, answer);
        btn.dataset.state = "ok";
        btn.querySelector(".aja-btn-text").textContent = "Inserted";
      } catch (err) {
        btn.dataset.state = "err";
        btn.querySelector(".aja-btn-text").textContent = "Failed";
        console.warn("[AI Job Applier]", err);
      } finally {
        setTimeout(() => {
          btn.disabled = false;
          btn.dataset.state = "";
          btn.querySelector(".aja-btn-text").textContent = "AI suggest";
        }, 1600);
      }
    });

    // Position the button right after the textarea using a wrapper.
    const wrapper = document.createElement("span");
    wrapper.className = "aja-suggest-wrapper";
    wrapper.appendChild(btn);
    textarea.insertAdjacentElement("afterend", wrapper);
  }

  function insertIntoTextarea(textarea, value) {
    // Use the native setter so React-controlled inputs detect the change.
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    if (setter) setter.call(textarea, value);
    else textarea.value = value;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    textarea.focus();
  }

  function scan() {
    document.querySelectorAll("textarea:not([data-aja-tagged='1'])").forEach(injectButton);
  }

  // Initial pass + observe DOM changes for SPA-style apply forms.
  scan();
  const observer = new MutationObserver(() => {
    // Debounce light: schedule one rAF
    if (window._ajaScanQueued) return;
    window._ajaScanQueued = true;
    requestAnimationFrame(() => {
      window._ajaScanQueued = false;
      scan();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Expose a count for the popup.
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === "countDetected") {
      sendResponse({ count: document.querySelectorAll("textarea[data-aja-tagged='1']").length });
      return true;
    }
    if (msg?.type === "fillAll") {
      Promise.all(
        [...document.querySelectorAll(".aja-suggest-btn")].map((b) => {
          b.click();
          return new Promise((r) => setTimeout(r, 1200));
        }),
      ).finally(() => sendResponse({ ok: true }));
      return true;
    }
  });
})();
