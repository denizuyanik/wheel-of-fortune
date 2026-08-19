const fs = require("fs");
const path = require("path");

const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
let code = fs.readFileSync(widgetJsPath, "utf8");

// Add setupMessageListener to connectedCallback if not present
if (!code.includes("this.setupMessageListener()")) {
  code = code.replace(
    "this.setupEventListeners();",
    "this.setupEventListeners();\n    this.setupMessageListener();"
  );
}

// Add setupMessageListener implementation before setupEventListeners()
const messageListenerMethod = `
  setupMessageListener() {
    if (this._hasMsgListener) return;
    this._hasMsgListener = true;
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "wof-update-settings" && event.data.settings) {
        const s = event.data.settings;
        if (s.colorTheme) {
          this.theme = s.colorTheme;
          this.setAttribute("color-theme", s.colorTheme);
        }
        if (s.lang) {
          this.widgetLang = s.lang;
          this.setAttribute("lang", s.lang);
        }
        if (s.fontFamily) {
          this.fontFamily = s.fontFamily;
          this.setAttribute("font-family", s.fontFamily);
        }
        if (s.dailyLimit) {
          this.dailyLimit = Number(s.dailyLimit) || 1;
          this.setAttribute("daily-limit", s.dailyLimit);
        }
        this.render();
        this.initCanvas();
        this.updateTexts();
        this.drawWheel();
        this.setupEventListeners();
      } else if (event.data && event.data.type === "wof-reset-limit") {
        this.checkDailyLimit();
      }
    });
  }
`;

if (!code.includes("setupMessageListener() {")) {
  code = code.replace("setupEventListeners() {", messageListenerMethod + "\n  setupEventListeners() {");
}

// Enhance readProps to check localStorage
const localStorageCheck = `    try {
      const savedSettings = localStorage.getItem("wof_settings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.lang) this.widgetLang = parsedSettings.lang;
        if (parsedSettings.colorTheme) this.theme = parsedSettings.colorTheme;
        if (parsedSettings.fontFamily) this.fontFamily = parsedSettings.fontFamily;
        if (parsedSettings.dailyLimit) this.dailyLimit = Number(parsedSettings.dailyLimit);
      }
    } catch {}`;

if (!code.includes("savedSettings = localStorage.getItem(\"wof_settings\")")) {
  code = code.replace(
    'this.fontFamily = this.getAttribute("font-family") || "Poppins";',
    'this.fontFamily = this.getAttribute("font-family") || "Outfit";\n' + localStorageCheck
  );
}

fs.writeFileSync(widgetJsPath, code);
console.log("Updated public/wheel-widget.js with postMessage and localStorage real-time sync!");

// Sync to all target locations
const targets = [
  path.join(__dirname, "../public/widget-standalone.html"),
  path.join(__dirname, "../public/test-sandbox.html"),
  path.join(__dirname, "../wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/custom-elements/wix-default-custom-element.js"),
  path.join(__dirname, "../src/public/wheel-widget.js"),
];

targets.forEach((target) => {
  if (target.endsWith(".html")) {
    let html = fs.readFileSync(target, "utf8");
    // Replace script block
    html = html.replace(/\/\/ ─── 16-Language Dictionary ─[\s\S]*?<\/script>/, code.substring(code.indexOf("// ─── 16-Language Dictionary ─")) + "\n  </script>");
    fs.writeFileSync(target, html);
    console.log("Synced HTML:", target);
  } else {
    fs.writeFileSync(target, code);
    console.log("Synced JS:", target);
  }
});
