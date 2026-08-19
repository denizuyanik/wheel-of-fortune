const fs = require("fs");
const path = require("path");

// 1. Update public/settings-panel.html with deep recursive cross-frame broadcast
const settingsPanelPath = path.join(__dirname, "../public/settings-panel.html");
let panelHtml = fs.readFileSync(settingsPanelPath, "utf8");

const deepBroadcastFn = `    function applyAndBroadcast() {
      const settings = getSettingsObject();
      const ts = Date.now().toString();

      try {
        localStorage.setItem("wof_settings", JSON.stringify(settings));
        localStorage.setItem("wof_settings_timestamp", ts);
      } catch(e) {}

      const msg = { type: "wof-update-settings", settings: settings, timestamp: ts };

      // 1. BroadcastChannel
      if (bChannel) {
        try { bChannel.postMessage(msg); } catch(e) {}
      }

      // 2. Comprehensive Deep Frame Broadcast across all Wix iframes
      try { window.postMessage(msg, "*"); } catch(e) {}
      try { window.parent.postMessage(msg, "*"); } catch(e) {}
      try { window.top.postMessage(msg, "*"); } catch(e) {}
      try { if (window.opener) window.opener.postMessage(msg, "*"); } catch(e) {}

      function deepPost(w) {
        if (!w) return;
        try {
          w.postMessage(msg, "*");
        } catch(e) {}
        try {
          for (let i = 0; i < w.frames.length; i++) {
            try {
              deepPost(w.frames[i]);
            } catch(e) {}
          }
        } catch(e) {}
      }

      try { deepPost(window.top); } catch(e) {}
      try { deepPost(window.parent); } catch(e) {}
    }`;

panelHtml = panelHtml.replace(/function applyAndBroadcast\(\)\s*\{[\s\S]*?\n    \}/, deepBroadcastFn);
fs.writeFileSync(settingsPanelPath, panelHtml);
console.log("Updated public/settings-panel.html with deep recursive cross-frame broadcast!");

// 2. Update wheel-widget.js to ensure message listener binds immediately on window & top
const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
let widgetCode = fs.readFileSync(widgetJsPath, "utf8");

const enhancedMessageListener = `  setupMessageListener() {
    if (this._hasMsgListener) return;
    this._hasMsgListener = true;

    const applyNewSettings = (s) => {
      if (!s) return;
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
      if (s.rewardPool && Array.isArray(s.rewardPool) && s.rewardPool.length >= 2) {
        this.prizes = s.rewardPool;
      }

      this.render();
      this.initCanvas();
      this.updateTexts();
      this.drawWheel();
      this.setupEventListeners();
    };

    // 1. BroadcastChannel (0ms direct cross-frame)
    try {
      const channel = new BroadcastChannel("wof_settings_channel");
      channel.onmessage = (event) => {
        if (event.data && event.data.type === "wof-update-settings" && event.data.settings) {
          applyNewSettings(event.data.settings);
        } else if (event.data && event.data.type === "wof-reset-limit") {
          this.checkDailyLimit();
        }
      };
    } catch(e) {}

    // 2. Storage event
    window.addEventListener("storage", (event) => {
      if (event.key === "wof_settings" && event.newValue) {
        try {
          applyNewSettings(JSON.parse(event.newValue));
        } catch(e) {}
      } else if (event.key === "wof_reset_timestamp") {
        this.checkDailyLimit();
      }
    });

    // 3. Global postMessage listener
    const onMsg = (event) => {
      if (event.data && event.data.type === "wof-update-settings" && event.data.settings) {
        applyNewSettings(event.data.settings);
      } else if (event.data && event.data.type === "wof-reset-limit") {
        this.checkDailyLimit();
      }
    };
    window.addEventListener("message", onMsg);
    try { if (window.top && window.top !== window) window.top.addEventListener("message", onMsg); } catch(e) {}
    try { if (window.parent && window.parent !== window) window.parent.addEventListener("message", onMsg); } catch(e) {}

    // 4. Active Polling fallback
    let lastTs = "";
    try { lastTs = localStorage.getItem("wof_settings_timestamp"); } catch(e) {}
    setInterval(() => {
      try {
        const currentTs = localStorage.getItem("wof_settings_timestamp");
        if (currentTs && currentTs !== lastTs) {
          lastTs = currentTs;
          const s = JSON.parse(localStorage.getItem("wof_settings"));
          applyNewSettings(s);
        }
      } catch(e) {}
    }, 300);
  }`;

widgetCode = widgetCode.replace(/setupMessageListener\(\)\s*\{[\s\S]*?\n  \}/, enhancedMessageListener);
fs.writeFileSync(widgetJsPath, widgetCode);
console.log("Updated public/wheel-widget.js with enhanced multi-window listeners!");

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
