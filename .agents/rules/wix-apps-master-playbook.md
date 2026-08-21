# 🧠 Antigravity Rule: Wix App & Wix Blocks Development Master Guidelines

This rule defines the mandatory architectural decisions, solved gotchas, and workflows for all Wix App development tasks in this workspace.

## 1. Architecture: Always use Wix CLI (`dev.wix.com`), Never Legacy Wix Blocks
- Never attempt to put complex Vite, Astro, or TypeScript full-stack code into the legacy web-based Wix Blocks container (`blocks.wix.com`).
- Always use Wix CLI with the app registered in the Wix Developers Center (`dev.wix.com/apps/<app-id>`).

## 2. Hosting & Content-Type Rules
- For JavaScript (`.js` Custom Element scripts): Use GitHub Pages or jsDelivr (`application/javascript`).
- For HTML (`.html` Settings Panels & Dashboard Pages): **ALWAYS** use GitHub Pages (`https://<user>.github.io/<repo>/...`) because jsDelivr forces `content-type: text/plain` on `.html` files, causing Wix iframes to render raw code.
- Repository visibility MUST be **Public**.

## 3. Real-Time Editor Preview (4-Layer Sync)
When building Wix in-editor settings panels:
1. `settings-panel.html` must broadcast on every user interaction (`onchange`, `onclick`) using recursive deep frame `postMessage` (`deepPost(window.top)`), `BroadcastChannel`, and `localStorage` with a timestamp.
2. `widget.js` must listen on `BroadcastChannel`, `storage` events, `message` events, and a 300ms `localStorage` timestamp polling fallback to guarantee instant (0ms) canvas visual updates.

## 4. Typography & Canvas Google Fonts
- Pre-load Google Fonts into `document.head` globally (`loadGoogleFontGlobally`).
- Call `document.fonts.load("bold 16px 'FontFamily'").then(() => drawCanvas())` so HTML5 Canvas redraws with the loaded glyphs instead of falling back to system Arial.
- Enforce `font-family: var(--app-font) !important;` on all Shadow DOM text elements.

## 5. Releases & GitHub Sync
- Release command: `npx wix release --version-type minor -c "vX.X.X description"`
- Keep GitHub `main` synchronized with numbered commits after each update.
