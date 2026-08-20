const fs = require("fs");
const path = require("path");

const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
let widgetCode = fs.readFileSync(widgetJsPath, "utf8");

// 1. Add global font injector function at top of widget code
const fontInjectorFn = `
// ─── Global Google Font Loader Engine ──────────────────────────────────────
const LOADED_FONTS = new Set();
function loadGoogleFontGlobally(fontFamily) {
  if (!fontFamily || LOADED_FONTS.has(fontFamily)) return;
  LOADED_FONTS.add(fontFamily);
  try {
    const linkId = "wof-font-" + fontFamily.replace(/\\s+/g, "-").toLowerCase();
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(fontFamily) + ":wght@400;600;700;800;900&display=swap";
      document.head.appendChild(link);
    }
  } catch (e) {}
}

// Pre-load all available fonts globally
["Outfit", "Poppins", "Inter", "Montserrat", "Roboto", "Playfair Display", "Cinzel", "Orbitron", "Comic Neue"].forEach(loadGoogleFontGlobally);
`;

if (!widgetCode.includes("loadGoogleFontGlobally(fontFamily)")) {
  widgetCode = fontInjectorFn + "\n" + widgetCode;
}

// 2. Enhance CSS font inheritance inside render()
const oldStyleRule = `          --wof-font: '\${this.fontFamily || "Poppins"}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-family: var(--wof-font);`;

const newStyleRule = `          --wof-font: '\${this.fontFamily || "Outfit"}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-family: var(--wof-font) !important;
        }

        .wof-container, .wof-container *, h2, p, button, input, label, span, div {
          font-family: var(--wof-font) !important;`;

widgetCode = widgetCode.replace(oldStyleRule, newStyleRule);

// 3. Enhance applyNewSettings and drawWheel font loading
const fontAsyncDraw = `      if (s.fontFamily) {
        this.fontFamily = s.fontFamily;
        this.setAttribute("font-family", s.fontFamily);
        loadGoogleFontGlobally(s.fontFamily);
        if (document.fonts && document.fonts.load) {
          document.fonts.load("bold 16px '" + s.fontFamily + "'").then(() => {
            this.drawWheel();
          }).catch(() => {});
        }
      }`;

widgetCode = widgetCode.replace(/if \(s\.fontFamily\) \{[\s\S]*?\n      \}/, fontAsyncDraw);

fs.writeFileSync(widgetJsPath, widgetCode);
console.log("Updated public/wheel-widget.js with global font injector and async canvas redraw!");

// Sync to all target locations
const targets = [
  path.join(__dirname, "../public/widget-standalone.html"),
  path.join(__dirname, "../wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/custom-elements/wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/wheel-widget.js"),
];

targets.forEach((target) => {
  if (target.endsWith(".html")) {
    let html = fs.readFileSync(target, "utf8");
    html = html.replace(/\/\/ ─── 16-Language Dictionary ─[\s\S]*?<\/script>/, widgetCode.substring(widgetCode.indexOf("// ─── 16-Language Dictionary ─")) + "\n  </script>");
    fs.writeFileSync(target, html);
    console.log("Synced HTML:", target);
  } else {
    fs.writeFileSync(target, widgetCode);
    console.log("Synced JS:", target);
  }
});
