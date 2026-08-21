# 📘 WIX APPS & WIX BLOCKS / CLI MASTER PLAYBOOK
## Master Development Guide, Architecture Rules, and Solved Gotchas for AI & Developers

---

## 1. 🏛️ Core Architecture: Wix CLI vs. Legacy Wix Blocks

### ❌ The Legacy Wix Blocks Pitfall (What NOT to Do)
* **What went wrong with Wix Blocks (`blocks.wix.com`):**
  * Wix Blocks is an older, web-based visual container meant for simple drag-and-drop widgets.
  * Placing complex TypeScript projects, Astro SSR bundles, Vite configs, or advanced Node workflows inside Blocks leads to broken Git sync, unlinked authentication errors (*"wix-ide bir hesaba bağlı değilsin"*), and build failures.
* **The Rule:** NEVER build advanced, gamified, or full-stack web applications inside legacy Wix Blocks web containers.

### ✅ The Winning Formula: Wix CLI App Architecture (`dev.wix.com`)
* Build modern Wix Apps using **Wix CLI (`@wix/cli`)** registered directly in the **Wix Developers Center (`dev.wix.com/apps/<app-id>`)**.
* Use **Self-Managed / CDN-Hosted Custom Elements** for the site widget, a dedicated **Settings Panel** for in-editor adjustments, and a **Dashboard Page** for the store management center.
* Keep source code clean in Git, compile with Vite/TypeScript, and host production static assets on **GitHub Pages** (or Cloudflare/Vercel).

---

## 2. 🌐 CDN & Hosting Rules (The Content-Type Trap)

### ⚠️ The jsDelivr `.html` Trap
* **The Problem:** `cdn.jsdelivr.net` serves all `.html` files with `content-type: text/plain` for security. When loaded in an iframe on Wix (Dashboard or Settings), the browser displays **RAW HTML CODE** instead of rendering the web page!
* **The Solution:**
  1. **For `.js` files (Custom Element Script URL):** Both `cdn.jsdelivr.net` and `username.github.io` work perfectly (serves `application/javascript` with CORS).
  2. **For `.html` files (Dashboard Page & Settings Panel):** **ALWAYS use GitHub Pages (`https://<user>.github.io/<repo>/...`)** or Cloudflare Pages (serves proper `text/html; charset=utf-8`).
  3. **Repository Visibility:** The GitHub repository **MUST BE PUBLIC** (`Settings > Change visibility > Make Public`) for GitHub Pages and CDN proxies to fetch files without 404 errors.

---

## 3. ⚡ Cross-Frame Live Preview Engine (Wix Editor Real-Time Sync)

### ⚠️ The Problem with Wix Editor Frames
* In Wix Editor, the **Settings Panel popover** and the **Canvas Custom Element** run inside different sandboxed iframes on different subdomains/origins.
* Standard `localStorage` is isolated per origin, and standard `window.parent.postMessage` does not automatically forward to sibling canvas frames.

### ✅ The 4-Layer Bulletproof Real-Time Sync Solution
Implement this 4-layer communication engine in every Wix widget and settings panel:

```javascript
// LAYER 1: Deep Recursive Frame Broadcast (In settings-panel.html)
function applyAndBroadcast(settings) {
  const ts = Date.now().toString();
  localStorage.setItem("app_settings", JSON.stringify(settings));
  localStorage.setItem("app_settings_timestamp", ts);
  const msg = { type: "app-update-settings", settings: settings, timestamp: ts };

  // 1. BroadcastChannel (Same-origin 0ms sync)
  try { new BroadcastChannel("app_settings_channel").postMessage(msg); } catch(e) {}

  // 2. Recursive cross-frame postMessage
  try { window.postMessage(msg, "*"); } catch(e) {}
  try { window.parent.postMessage(msg, "*"); } catch(e) {}
  try { window.top.postMessage(msg, "*"); } catch(e) {}
  try { if (window.opener) window.opener.postMessage(msg, "*"); } catch(e) {}

  function deepPost(w) {
    if (!w) return;
    try { w.postMessage(msg, "*"); } catch(e) {}
    try {
      for (let i = 0; i < w.frames.length; i++) {
        try { deepPost(w.frames[i]); } catch(e) {}
      }
    } catch(e) {}
  }
  try { deepPost(window.top); } catch(e) {}
  try { deepPost(window.parent); } catch(e) {}
}

// LAYER 2, 3, 4: Multi-Listener & Polling Fallback (In widget.js)
setupMessageListener() {
  const applySettings = (s) => {
    // Update theme, font, language, re-render and redraw canvas
  };

  // 1. BroadcastChannel
  try {
    new BroadcastChannel("app_settings_channel").onmessage = (e) => {
      if (e.data?.type === "app-update-settings") applySettings(e.data.settings);
    };
  } catch(e) {}

  // 2. Storage Event
  window.addEventListener("storage", (e) => {
    if (e.key === "app_settings" && e.newValue) applySettings(JSON.parse(e.newValue));
  });

  // 3. Multi-Window PostMessage
  const onMsg = (e) => {
    if (e.data?.type === "app-update-settings") applySettings(e.data.settings);
  };
  window.addEventListener("message", onMsg);
  try { if (window.top && window.top !== window) window.top.addEventListener("message", onMsg); } catch(e) {}
  try { if (window.parent && window.parent !== window) window.parent.addEventListener("message", onMsg); } catch(e) {}

  // 4. Polling Fallback (Every 300ms)
  let lastTs = localStorage.getItem("app_settings_timestamp");
  setInterval(() => {
    const currentTs = localStorage.getItem("app_settings_timestamp");
    if (currentTs && currentTs !== lastTs) {
      lastTs = currentTs;
      applySettings(JSON.parse(localStorage.getItem("app_settings")));
    }
  }, 300);
}
```

* **Live Preview Rule:** Broadcast on EVERY user interaction (`onchange`, `onclick` on color/theme cards, dropdowns) — do NOT wait for the Save button to give the user an instant live preview on the canvas!

---

## 4. 🔤 Google Fonts & HTML5 Canvas Rendering

### ⚠️ The Canvas Font Loading Gotcha
* HTML5 Canvas `ctx.font` falls back to Arial/system font if the `@font-face` is not loaded in `document.head` of the main window. Shadow DOM `<link>` tags do NOT expose fonts to the canvas context in Chrome.
* **The Solution:**
  1. Inject Google Fonts `<link>` into `document.head` globally (`loadGoogleFontGlobally`).
  2. Use `document.fonts.load("bold 16px 'FontName'").then(() => redrawCanvas())` to redraw once the font is loaded in memory.
  3. In Shadow DOM CSS, enforce font inheritance:
     ```css
     :host { --app-font: 'Outfit', sans-serif; font-family: var(--app-font) !important; }
     *, h1, h2, p, button, input, label, select, span { font-family: var(--app-font) !important; }
     ```

---

## 5. 🛠️ Wix Dev Center Configuration & URL Registration

| Extension | Setting | Correct Format / Protocol |
| :--- | :--- | :--- |
| **Site Widget (Custom Element)** | `Tag Name` | Unique kebab-case (e.g. `wheel-of-fortune-widget`) |
| **Site Widget (Custom Element)** | `Script URL*` | `https://<user>.github.io/<repo>/public/widget.js?v=1` |
| **Site Widget (Custom Element)** | `Panel URL*` (Action Bar > Settings) | `https://<user>.github.io/<repo>/public/settings-panel.html?v=1` |
| **Dashboard Page** | `iFrame URL` | `https://<user>.github.io/<repo>/public/dashboard.html?v=1` |
| **Dashboard Page** | `Relative route` | `wheel` (or your app slug) |

### 💡 The Wix "Save" Button Trigger
* In Wix Dev Center input fields, pasting text may leave the "Save" button gray/disabled.
* **Fix:** Click outside the input box (trigger `blur`) or add a cache-busting query parameter like `?v=2` so the form state triggers "dirty" and the Save button becomes clickable.

---

## 6. 🚀 Wix CLI Deployment & Release Routine

* **Production Build:** `npm run build`
* **Release Command:** `npx wix release --version-type minor -c "vX.X.X description"`
  *(Note: Wix CLI accepts `--version-type minor` or `major`, not `patch`).*
* **Direct Test Links:** Wix CLI outputs direct installer links for Site, Editor, and Dashboard to test new versions on live Wix test sites with 1 click.
* **Git Versioning Rule:** Keep Git commits synchronized after every release (`git add . && git commit -m "..." && git push origin main`) and track commit numbers.

---

## 7. 📁 Clean Project Template Layout for Future Wix Apps

```text
my-wix-app/
├── public/
│   ├── widget.js                # Single source of truth for Custom Element engine
│   ├── settings-panel.html      # Lightweight, compact Wix Editor settings popover
│   ├── dashboard.html           # Full-screen Executive Dashboard (5 tabs, CRM, CSV export)
│   └── test-sandbox.html        # Local dual-view testing environment
├── src/
│   ├── extensions/site/widgets/ # Wix Custom Element TypeScript definitions
│   └── dashboard/pages/         # Native Wix Dashboard Page components
├── scripts/
│   ├── sync-all.cjs             # Automatic synchronization across .js, .tsx, and .html files
│   └── build-release.cjs        # Production build validation script
├── wix.config.json              # Wix App ID and CLI configuration
├── WIX_APP_MARKET_DOSSIER.md    # Master marketing, pricing, and OAuth review guide
└── WIX_APPS_MASTER_PLAYBOOK.md  # THIS MASTER GUIDE
```
