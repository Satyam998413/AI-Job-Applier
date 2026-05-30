# AI Job Applier — Browser Extension (scaffold)

A Chrome / Edge / Brave extension (Manifest v3) that runs **inside your own browser session**
and helps you fill application questions on any job board.

This is the **ToS-safe** path for what the spec calls "auto-apply": the extension never
logs into LinkedIn/Indeed/Naukri for you. It only reads form fields in your own logged-in
session, asks your AI Job Applier app for a suggested answer (via cookie-auth), and lets
you insert it with one click. **You always click submit.**

## What it does (today)

- Scans any page for `textarea` elements (the most reliable signal for application questions).
- Finds the nearest label / heading text and treats it as the question.
- Injects a small **AI ✨** button beside each textarea.
- On click, calls `POST /api/qna/suggest` against your app (cookie-authenticated).
- Inserts the best match from your saved library or the AI-drafted answer right into the textarea.
- Popup shows: connection status, # of questions detected, configurable app URL, "suggest all" action.

## Install (developer mode)

1. Make sure the app is running locally (`npm run dev` in `AI-Job-Applier/`) — or note your deployed URL.
2. Log in to the app in the same browser profile.
3. Open `chrome://extensions` → toggle **Developer mode** on.
4. Click **Load unpacked** → select this `browser-extension/` folder.
5. Pin the extension. Open its popup and confirm "Signed in as you@email" appears in green.
6. Navigate to any job application page. You should see an **AI ✨ AI suggest** button next to each text area.

## Configuration

- The popup has an **App URL** field. Default `http://localhost:3000`. Change to your deployed URL
  (e.g. `https://your-domain.com`) and click Save.
- The extension uses cookie auth (`credentials: "include"`). You must be logged in to the app at
  the same URL in the same browser profile. No tokens to manage.

## Permissions used

- `host_permissions`: `http://localhost:3000/*` and `https://*/*` so the content script can run
  on any job site and the background can call your app.
- `activeTab`, `scripting`, `storage`: standard MV3 affordances.

## What it deliberately does NOT do

- **No autonomous form submission.** You review every answer and click submit yourself.
- **No credential storage for job sites.** The extension never logs you in to LinkedIn / Indeed / etc.
- **No data exfiltration.** The only outbound request goes to your configured AI Job Applier app URL.

## Files

```
manifest.json     # MV3 manifest
background.js     # service worker — proxies API calls to your app with cookie auth
content.js        # injects "AI ✨" buttons next to detected textareas
content.css       # styles for the injected button
popup/
  popup.html      # extension popup UI
  popup.css       # popup styles
  popup.js        # popup logic (status, count, fill-all, app URL save)
  options.html    # alternative entry point for the options page
```

## Next steps (when you're ready)

- Support `<input type="text">` for short questions (currently textarea-only to avoid noise).
- Persist a per-question confidence score; auto-fill above 95% without click (the Task 13 threshold).
- Per-site DOM adapters for LinkedIn Easy Apply / Indeed / Greenhouse so labels resolve better.
- Add a "save answer back to my library" action after editing.

## Known limitations of this scaffold

- Some forms use heavily-styled custom inputs (contentEditable divs, custom WYSIWYG). Those need
  per-site adapters — out of scope for the initial scaffold.
- Cookie auth works cross-origin only because the host is in `host_permissions`. If you ever switch
  to a different auth scheme (e.g. an extension-specific API key), update `background.js` accordingly.
