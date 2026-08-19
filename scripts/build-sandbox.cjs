const fs = require("fs");
const path = require("path");

const i18nFile = fs.readFileSync(path.join(__dirname, "../src/dashboard/constants/i18nDefaults.ts"), "utf8");

const matchI18n = i18nFile.match(/export const DASHBOARD_I18N: Record<string, DashboardLocale> = ({[\s\S]*?});\n\nexport function/);
const dashboardI18nStr = matchI18n ? matchI18n[1] : "{}";

const matchDict = i18nFile.match(/export const I18N_DICTIONARY: Record<string, Record<string, string>> = ({[\s\S]*?});\n\n\/\/ ─── Complete/);
const dictStr = matchDict ? matchDict[1] : "{}";

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🎡 Wheel of Fortune — Local Test Studio & Multilingual Dashboard</title>
  <style>
    :root {
      --bg-gradient: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #09090b 100%);
      --accent: #f59e0b;
      --card-bg: rgba(15, 23, 42, 0.85);
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg-gradient);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ─── Control Bar ─── */
    .control-header {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-brand h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .badge {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid #f59e0b;
      color: #fbbf24;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      text-transform: uppercase;
    }

    /* View Switcher Tabs */
    .view-switcher {
      display: flex;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 4px;
      gap: 4px;
    }
    .view-tab {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-weight: 700;
      font-size: 13px;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .view-tab.active {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    }

    .controls-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
    .ctrl-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }
    select, input, button {
      font-family: inherit;
    }
    .ctrl-select, .ctrl-input {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #f8fafc;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
    }
    .ctrl-btn {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: #fff;
      border: none;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
    }

    /* ─── Main Sandbox Area ─── */
    .sandbox-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      box-sizing: border-box;
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
    }

    /* ─── Widget View ─── */
    .widget-view {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    /* ─── Event Monitor & Log Console ─── */
    .log-panel {
      width: 100%;
      max-width: 680px;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      margin-top: 10px;
      box-sizing: border-box;
    }
    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
      color: #fbbf24;
      margin-bottom: 8px;
    }
    .log-content {
      font-family: monospace;
      font-size: 12px;
      color: #94a3b8;
      background: #09090b;
      padding: 10px;
      border-radius: 8px;
      height: 120px;
      overflow-y: auto;
      white-space: pre-wrap;
    }

    /* ─── Dashboard View ─── */
    .dashboard-view {
      width: 100%;
      display: none;
      background: var(--card-bg);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 24px;
      box-sizing: border-box;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .dash-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 20px;
      gap: 16px;
    }
    .dash-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .dash-tab-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .dash-tab-btn.active {
      background: #f59e0b;
      color: #0f172a;
      border-color: #f59e0b;
      font-weight: 700;
    }
    .dash-content-pane {
      display: none;
    }
    .dash-content-pane.active {
      display: block;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 16px;
    }
    .stat-card h4 {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .stat-card .val {
      font-size: 28px;
      font-weight: 800;
      margin-top: 8px;
    }

    /* Tables */
    .dash-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-top: 12px;
    }
    .dash-table th {
      text-align: left;
      padding: 10px 12px;
      background: rgba(0, 0, 0, 0.4);
      color: #94a3b8;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 700;
    }
    .dash-table td {
      padding: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .dash-table tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .badge-win {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid #10b981;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <!-- Top Global Header -->
  <header class="control-header">
    <div class="header-brand">
      <span style="font-size: 24px;">🎡</span>
      <h1>Wheel of Fortune</h1>
      <span class="badge">LOCAL STUDIO</span>
    </div>

    <!-- View Switcher (Widget vs Dashboard) -->
    <div class="view-switcher">
      <button type="button" class="view-tab active" id="tab-btn-widget">🎡 Site Widget Preview</button>
      <button type="button" class="view-tab" id="tab-btn-dashboard">📊 Dashboard Management Panel</button>
    </div>

    <!-- Quick Live Widget Controls -->
    <div class="controls-group" id="widget-controls">
      <div class="ctrl-item">
        <label>🌍 Language:</label>
        <select class="ctrl-select" id="sel-lang">
          <option value="en" selected>English 🇺🇸</option>
          <option value="tr">Türkçe 🇹🇷</option>
          <option value="de">Deutsch 🇩🇪</option>
          <option value="fr">Français 🇫🇷</option>
          <option value="es">Español 🇪🇸</option>
          <option value="he">עברית 🇮🇱</option>
          <option value="zh">中文 🇨🇳</option>
          <option value="ja">日本語 🇯🇵</option>
          <option value="ko">한국어 🇰🇷</option>
          <option value="hi">हिन्दी 🇮🇳</option>
          <option value="pt">Português 🇧🇷</option>
          <option value="ru">Русский 🇷🇺</option>
          <option value="uk">Українська 🇺🇦</option>
          <option value="el">Ελληνικά 🇬🇷</option>
          <option value="it">Italiano 🇮🇹</option>
          <option value="ar">العربية 🇸🇦</option>
        </select>
      </div>

      <div class="ctrl-item">
        <label>🎨 Theme:</label>
        <select class="ctrl-select" id="sel-theme">
          <option value="gold" selected>Royal Gold</option>
          <option value="dark">Dark Nebula</option>
          <option value="neon">Cyberpunk Neon</option>
          <option value="light">Clean Light</option>
        </select>
      </div>

      <div class="ctrl-item">
        <label>⏱️ Limit:</label>
        <input type="number" class="ctrl-input" id="sel-limit" value="1" min="1" max="10" style="width: 50px;" />
      </div>

      <button type="button" class="ctrl-btn" id="btn-reset" title="Clear spin daily limit in LocalStorage">🔄 Reset Limit</button>
    </div>
  </header>

  <!-- Main Container -->
  <main class="sandbox-main">
    
    <!-- ─── 1. WIDGET PREVIEW VIEW ─── -->
    <div class="widget-view" id="view-widget">
      <div style="width: 100%; max-width: 680px;">
        <wheel-of-fortune-widget
          id="test-widget"
          color-theme="gold"
          lang="en"
          daily-limit="1"
        ></wheel-of-fortune-widget>
      </div>

      <div class="log-panel">
        <div class="log-header">
          <span>📡 Live Event & CRM Monitor</span>
          <button type="button" id="btn-clear-log" style="font-size:11px; padding:2px 8px; background:rgba(255,255,255,0.1); border:none; color:#cbd5e1; border-radius:4px; cursor:pointer;">Clear</button>
        </div>
        <div class="log-content" id="log-console">[System] Local test sandbox initialized. Spin the wheel to test live events...</div>
      </div>
    </div>

    <!-- ─── 2. DASHBOARD VIEW ─── -->
    <div class="dashboard-view" id="view-dashboard">
      
      <!-- Persistent Header with Title, Language Selector and Save Button -->
      <div class="dash-header">
        <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
          <div>
            <h2 id="dash-title-txt" style="margin:0; font-size:22px; color:#fbbf24;">🎡 Wheel of Fortune Dashboard</h2>
            <p id="dash-sub-txt" style="margin:4px 0 0 0; font-size:13px; color:#94a3b8;">Manage wheel prizes, win odds, CRM leads, theme, and 16-language texts</p>
          </div>
          
          <!-- Persistent Language Selector -->
          <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.08); padding:6px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.15);">
            <label id="dash-lang-label" style="font-size:13px; font-weight:700; color:#fbbf24;">🌐 Language:</label>
            <select id="dash-header-lang-sel" style="background:#0f172a; color:#fff; border:1px solid rgba(255,255,255,0.25); padding:6px 12px; border-radius:6px; font-size:13px; cursor:pointer; font-weight:600;">
              <option value="en" selected>English 🇺🇸</option>
              <option value="tr">Türkçe 🇹🇷</option>
              <option value="de">Deutsch 🇩🇪</option>
              <option value="fr">Français 🇫🇷</option>
              <option value="es">Español 🇪🇸</option>
              <option value="he">עברית 🇮🇱</option>
              <option value="zh">中文 🇨🇳</option>
              <option value="ja">日本語 🇯🇵</option>
              <option value="ko">한국어 🇰🇷</option>
              <option value="hi">हिन्दी 🇮🇳</option>
              <option value="pt">Português 🇧🇷</option>
              <option value="ru">Русский 🇷🇺</option>
              <option value="uk">Українська 🇺🇦</option>
              <option value="el">Ελληνικά 🇬🇷</option>
              <option value="it">Italiano 🇮🇹</option>
              <option value="ar">العربية 🇸🇦</option>
            </select>
          </div>
        </div>

        <button type="button" style="background:#10b981; border:none; font-weight:700; color:#fff; padding:10px 20px; border-radius:8px; cursor:pointer;" id="btn-save-dash">💾 Save All Changes</button>
      </div>

      <!-- Dashboard Dynamic Tabs -->
      <div class="dash-nav" id="dash-nav-tabs">
        <button type="button" class="dash-tab-btn active" data-pane="dash-overview" id="tab-nav-overview">📊 Overview</button>
        <button type="button" class="dash-tab-btn" data-pane="dash-prizes" id="tab-nav-prizes">🎁 Prize Slices</button>
        <button type="button" class="dash-tab-btn" data-pane="dash-leads" id="tab-nav-leads">👥 CRM Leads & Notes</button>
        <button type="button" class="dash-tab-btn" data-pane="dash-theme" id="tab-nav-theme">🎨 Theme & Rules</button>
        <button type="button" class="dash-tab-btn" data-pane="dash-i18n" id="tab-nav-texts">🌍 16 Languages & Texts</button>
      </div>

      <!-- Tab 1: Overview -->
      <div class="dash-content-pane active" id="dash-overview">
        <div class="stats-grid">
          <div class="stat-card">
            <h4 id="lbl-stat-spins">Total Spins</h4>
            <div class="val" style="color:#60a5fa;" id="stat-spins">24</div>
          </div>
          <div class="stat-card">
            <h4 id="lbl-stat-coupons">Coupons Won</h4>
            <div class="val" style="color:#34d399;" id="stat-winners">19</div>
          </div>
          <div class="stat-card">
            <h4 id="lbl-stat-leads">Leads Collected</h4>
            <div class="val" style="color:#a78bfa;" id="stat-leads">16</div>
          </div>
          <div class="stat-card">
            <h4 id="lbl-stat-rate">Conversion Rate</h4>
            <div class="val" style="color:#fbbf24;" id="stat-conv">67%</div>
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
          <h4 id="lbl-campaign-title" style="margin:0 0 8px 0; color:#fbbf24;">🚀 Spin & Conversion Performance</h4>
          <p id="lbl-campaign-desc" style="margin:0; font-size:13px; color:#cbd5e1;">Status: <strong style="color:#34d399;">🟢 Active & Visible to Visitors</strong>. Visitors can spin up to 1 time per day. Anti-cheat prevents multiple attempts per calendar day.</p>
        </div>
      </div>

      <!-- Tab 2: Prizes -->
      <div class="dash-content-pane" id="dash-prizes">
        <div style="margin-bottom:12px;">
          <h3 id="lbl-prizes-title" style="margin:0 0 4px 0; color:#fbbf24;">🎡 Prize Segments & Probabilities</h3>
          <p id="lbl-prizes-sub" style="font-size:13px; color:#94a3b8; margin:0;">Configure slice colors, winning discount codes, and win odds (sum must be 100%):</p>
        </div>
        <table class="dash-table">
          <thead>
            <tr>
              <th id="th-color">Color</th>
              <th id="th-label">Slice Title</th>
              <th id="th-code">Coupon Code</th>
              <th id="th-prob">Odds (%)</th>
              <th id="th-status">Status</th>
            </tr>
          </thead>
          <tbody id="prizes-tbody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>

      <!-- Tab 3: CRM Leads -->
      <div class="dash-content-pane" id="dash-leads">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 id="lbl-leads-title" style="margin:0 0 4px 0; color:#fbbf24;">👥 CRM Leads & Winner Management</h3>
            <p id="lbl-leads-sub" style="font-size:13px; color:#94a3b8; margin:0;">Real-time captured leads from wheel spins with editable follow-up notes:</p>
          </div>
          <button type="button" style="background:#6366f1; border:none; color:#fff; font-weight:700; padding:8px 16px; border-radius:8px; cursor:pointer;" id="btn-export-csv">📥 Export CSV</button>
        </div>
        <table class="dash-table">
          <thead>
            <tr>
              <th id="th-name">Full Name</th>
              <th id="th-email">Email</th>
              <th id="th-phone">Phone</th>
              <th id="th-coupon">Coupon Won</th>
              <th id="th-prize">Prize Won</th>
              <th id="th-notes">Follow-up Notes</th>
              <th id="th-lead-status">Status</th>
            </tr>
          </thead>
          <tbody id="leads-tbody">
            <tr>
              <td><strong>Ahmet Yilmaz</strong></td>
              <td>ahmet@example.com</td>
              <td>+90 532 123 4567</td>
              <td><span class="badge-win">CARK10</span></td>
              <td>10% OFF</td>
              <td><input type="text" class="lead-note-input" value="Customer used code on checkout." style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); color:#cbd5e1; padding:4px 8px; border-radius:6px; font-size:12px; width:200px;" /></td>
              <td><span style="color:#34d399;">New Lead</span></td>
            </tr>
            <tr>
              <td><strong>Sarah Jenkins</strong></td>
              <td>sarah.j@email.com</td>
              <td>+1 555 019 2834</td>
              <td><span class="badge-win">FREESHIP</span></td>
              <td>FREE SHIPPING</td>
              <td><input type="text" class="lead-note-input" value="Confirmed via email, pending order." style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); color:#cbd5e1; padding:4px 8px; border-radius:6px; font-size:12px; width:200px;" /></td>
              <td><span style="color:#60a5fa;">Contacted</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab 4: Theme -->
      <div class="dash-content-pane" id="dash-theme">
        <div style="margin-bottom:12px;">
          <h3 id="lbl-theme-title" style="margin:0 0 4px 0; color:#fbbf24;">🎨 Visual Theme & Anti-Cheat Rules</h3>
          <p id="lbl-theme-sub" style="font-size:13px; color:#94a3b8; margin:0;">Select visual color palette, LED effects, and daily spin limits:</p>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:12px;">
            <label id="lbl-theme-preset" style="font-size:13px; font-weight:700; color:#fbbf24; display:block; margin-bottom:8px;">Visual Theme Palette</label>
            <select style="width:100%; padding:8px;" id="dash-theme-sel" class="ctrl-select">
              <option value="gold">👑 Royal Gold Luxury</option>
              <option value="dark">🌌 Dark Nebula</option>
              <option value="neon">⚡ Cyberpunk Emerald Neon</option>
              <option value="light">✨ Clean Light Modern</option>
            </select>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:12px;">
            <label id="lbl-theme-limit" style="font-size:13px; font-weight:700; color:#fbbf24; display:block; margin-bottom:8px;">Daily Spin Limit per Visitor</label>
            <input type="number" value="1" min="1" max="10" style="width:100%; padding:8px;" id="dash-limit-inp" class="ctrl-input" />
            <span id="lbl-theme-desc" style="font-size:11px; color:#94a3b8; display:block; margin-top:4px;">Anti-cheat prevents multiple attempts per visitor per calendar day.</span>
          </div>
        </div>
      </div>

      <!-- Tab 5: Translations & Custom Texts -->
      <div class="dash-content-pane" id="dash-i18n">
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:14px 18px; border-radius:12px; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 id="lbl-texts-title" style="margin:0 0 4px 0; color:#fbbf24;">🌍 16 Languages & Text Customization</h3>
            <p id="lbl-texts-sub" style="font-size:13px; color:#94a3b8; margin:0;">Override any of the 36 text strings for each language independently</p>
          </div>
          <button type="button" id="btn-reset-lang-texts" style="background:#dc2626; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">🔄 Reset This Language to Default</button>
        </div>

        <div id="i18n-categories-container" style="display:flex; flex-direction:column; gap:20px;">
          <!-- Dynamically populated by JS for all 4 categories & 36 fields -->
        </div>
      </div>
    </div>
  </main>

  <!-- Scripts -->
  <script type="module">
    // Master 16-Language Dashboard UI Dictionary
    const DASHBOARD_I18N = ` + dashboardI18nStr + `;
    const I18N_DICTIONARY = ` + dictStr + `;

    const widget = document.getElementById("test-widget");
    const selLang = document.getElementById("sel-lang");
    const selTheme = document.getElementById("sel-theme");
    const selLimit = document.getElementById("sel-limit");
    const btnReset = document.getElementById("btn-reset");
    const logConsole = document.getElementById("log-console");
    const btnClearLog = document.getElementById("btn-clear-log");

    // Header Persistent Language Selector
    const dashHeaderLangSel = document.getElementById("dash-header-lang-sel");

    // Tab Switching between Widget and Dashboard
    const tabWidget = document.getElementById("tab-btn-widget");
    const tabDashboard = document.getElementById("tab-btn-dashboard");
    const viewWidget = document.getElementById("view-widget");
    const viewDashboard = document.getElementById("view-dashboard");
    const widgetControls = document.getElementById("widget-controls");

    tabWidget.onclick = () => {
      tabWidget.classList.add("active");
      tabDashboard.classList.remove("active");
      viewWidget.style.display = "flex";
      viewDashboard.style.display = "none";
      widgetControls.style.display = "flex";
    };

    tabDashboard.onclick = () => {
      tabDashboard.classList.add("active");
      tabWidget.classList.remove("active");
      viewWidget.style.display = "none";
      viewDashboard.style.display = "block";
      widgetControls.style.display = "none";
    };

    // Dashboard Internal Tabs
    document.querySelectorAll(".dash-tab-btn").forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll(".dash-tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".dash-content-pane").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const paneId = btn.getAttribute("data-pane");
        const target = document.getElementById(paneId);
        if (target) target.classList.add("active");
      };
    });

    // Populate Prizes in Dashboard
    const DEFAULT_PRIZES = [
      { id: "p1", label: "10% OFF", code: "SPIN10", color: "#6366F1", probability: 25, isWinner: true },
      { id: "p2", label: "FREE SHIPPING", code: "FREESHIP", color: "#EC4899", probability: 20, isWinner: true },
      { id: "p3", label: "TRY AGAIN", code: "", color: "#64748B", probability: 15, isWinner: false },
      { id: "p4", label: "20% OFF", code: "LUCKY20", color: "#F59E0B", probability: 15, isWinner: true },
      { id: "p5", label: "MYSTERY GIFT", code: "GIFT50", color: "#10B981", probability: 10, isWinner: true },
      { id: "p6", label: "5% OFF", code: "WELCOME5", color: "#8B5CF6", probability: 15, isWinner: true },
    ];

    const prizesTbody = document.getElementById("prizes-tbody");
    prizesTbody.innerHTML = DEFAULT_PRIZES.map((p) => \`
      <tr>
        <td><input type="color" value="\${p.color}" style="width:36px; height:32px; padding:0; border:none; border-radius:4px; cursor:pointer;" /></td>
        <td><strong>\${p.label}</strong></td>
        <td><span class="badge-win">\${p.code || "NO CODE"}</span></td>
        <td><input type="number" value="\${p.probability}" style="width:60px; padding:4px;" class="ctrl-input" /> %</td>
        <td>\${p.isWinner ? "✅ Winner" : "❌ No Prize"}</td>
      </tr>
    \`).join("");

    function log(msg) {
      const time = new Date().toLocaleTimeString();
      logConsole.textContent = \`[\${time}] \${msg}\\n\` + logConsole.textContent;
    }

    function updateWidget() {
      widget.setAttribute("lang", selLang.value);
      widget.setAttribute("color-theme", selTheme.value);
      widget.setAttribute("daily-limit", selLimit.value);
      log(\`Updated settings: Lang=\${selLang.value.toUpperCase()}, Theme=\${selTheme.value}, Limit=\${selLimit.value}\`);
    }

    selLang.addEventListener("change", (e) => {
      dashHeaderLangSel.value = e.target.value;
      updateDashboardLanguage(e.target.value);
      updateWidget();
    });
    selTheme.addEventListener("change", updateWidget);
    selLimit.addEventListener("change", updateWidget);

    btnReset.addEventListener("click", () => {
      localStorage.removeItem("wof_usage");
      log("🔄 LocalStorage 'wof_usage' cleared. Reloading page...");
      location.reload();
    });

    btnClearLog.addEventListener("click", () => {
      logConsole.textContent = "";
    });

    window.addEventListener("onSpinComplete", (e) => {
      log(\`🎡 [onSpinComplete] Result: \${JSON.stringify(e.detail)}\`);
    });

    window.addEventListener("onFormSubmit", (e) => {
      log(\`📝 [onFormSubmit] Lead: \${e.detail.firstName} \${e.detail.lastName} (\${e.detail.email}) - Coupon: \${e.detail.code}\`);
      const leadsTbody = document.getElementById("leads-tbody");
      const tr = document.createElement("tr");
      tr.innerHTML = \`
        <td><strong>\${e.detail.firstName} \${e.detail.lastName || ""}</strong></td>
        <td>\${e.detail.email}</td>
        <td>\${e.detail.phone || "—"}</td>
        <td><span class="badge-win">\${e.detail.code || "WINNER"}</span></td>
        <td>REWARD WON</td>
        <td><input type="text" class="lead-note-input" placeholder="Add note..." style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); color:#cbd5e1; padding:4px 8px; border-radius:6px; font-size:12px; width:200px;" /></td>
        <td><span style="color:#34d399; font-weight:700;">New Lead (Live)</span></td>
      \`;
      leadsTbody.prepend(tr);
    });

    // ─── 16 Languages & Custom Texts Studio ───
    let customTextsState = {};
    try {
      const raw = localStorage.getItem("wheel_of_fortune_custom_texts");
      if (raw) customTextsState = JSON.parse(raw);
    } catch {}

    const i18nContainer = document.getElementById("i18n-categories-container");
    const btnResetLang = document.getElementById("btn-reset-lang-texts");

    function getLocalizedCategories(lang) {
      const dict = DASHBOARD_I18N[lang] || DASHBOARD_I18N.en;
      return [
        {
          category: dict.cat1Title,
          icon: "🎯",
          fields: [
            { key: "title", label: \`\${dict.cat1Title} - Title\` },
            { key: "subtitle", label: "Subtitle" },
            { key: "spinBtn", label: "Spin Button Label" },
            { key: "spinning", label: "Spinning Status Text" },
            { key: "rewardWon", label: "Reward Won Title" },
            { key: "noReward", label: "No Reward / Loss Title" },
          ],
        },
        {
          category: dict.cat2Title,
          icon: "📝",
          fields: [
            { key: "formTitle", label: "Form Title" },
            { key: "formMandatoryNotice", label: "Mandatory Form Notice" },
            { key: "firstName", label: "First Name Label" },
            { key: "firstNamePH", label: "First Name Placeholder" },
            { key: "lastName", label: "Last Name Label" },
            { key: "lastNamePH", label: "Last Name Placeholder" },
            { key: "phone", label: "Phone Label" },
            { key: "phonePH", label: "Phone Placeholder" },
            { key: "email", label: "Email Label" },
            { key: "emailPH", label: "Email Placeholder" },
            { key: "cta", label: "Claim Reward Button (CTA)" },
            { key: "sending", label: "Sending Status Text" },
            { key: "success", label: "Success Notification Text", isLong: true },
          ],
        },
        {
          category: dict.cat3Title,
          icon: "⚖️",
          fields: [
            { key: "privacyConsent", label: "Privacy Policy Consent Text", isLong: true },
            { key: "marketingConsent", label: "Marketing Communication Consent Text", isLong: true },
            { key: "errorConsent", label: "Privacy Not Accepted Alert" },
            { key: "errorRequired", label: "Required Fields Empty Alert" },
            { key: "errorEmail", label: "Invalid Email Address Alert" },
          ],
        },
        {
          category: dict.cat4Title,
          icon: "🎟️",
          fields: [
            { key: "codeBadge", label: "Coupon Code Badge" },
            { key: "alreadySpun", label: "Daily Limit Reached Title" },
            { key: "comeBackTomorrow", label: "Come Back Tomorrow Notice" },
            { key: "yourCodes", label: "Your Won Coupons Heading" },
            { key: "useThisCode", label: "Use at Checkout Reminder" },
            { key: "playAgain", label: "Spin Again Button" },
            { key: "screenshotNotice", label: "Screenshot / Save Notice" },
            { key: "downloadCoupon", label: "Download Coupon Button" },
            { key: "couponSaved", label: "Coupon Saved Toast Notification" },
            { key: "couponVoucherTitle", label: "Official Voucher Card Heading" },
            { key: "couponValidNotice", label: "Valid at Checkout Notice" },
            { key: "couponTip", label: "Mobile Long-Press Image Tip" },
          ],
        },
      ];
    }

    function renderI18nFields(lang) {
      const cats = getLocalizedCategories(lang);
      const dict = DASHBOARD_I18N[lang] || DASHBOARD_I18N.en;
      const langDict = I18N_DICTIONARY[lang] || I18N_DICTIONARY.en;

      i18nContainer.innerHTML = cats.map((cat) => \`
        <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:18px;">
          <h3 style="margin:0 0 14px 0; font-size:15px; color:#fbbf24; display:flex; align-items:center; gap:8px;">
            <span>\${cat.icon}</span> \${cat.category}
          </h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
            \${cat.fields.map((f) => {
              const currentVal = (customTextsState[lang] && customTextsState[lang][f.key]) || "";
              const defaultVal = langDict[f.key] || "";
              return \`
                <div>
                  <label style="font-size:12px; font-weight:600; color:#cbd5e1; display:block; margin-bottom:4px;">\${f.label}</label>
                  <input
                    type="text"
                    data-lang="\${lang}"
                    data-key="\${f.key}"
                    class="i18n-field-input"
                    value="\${currentVal.replace(/"/g, '&quot;')}"
                    placeholder="\${dict.defaultPH}\${defaultVal.replace(/"/g, '&quot;')}"
                    style="width:100%; box-sizing:border-box; padding:8px 10px; background:#0f172a; border:1px solid \${currentVal ? '#10b981' : 'rgba(255,255,255,0.15)'}; border-radius:6px; color:#f8fafc; font-size:12px;"
                  />
                </div>
              \`;
            }).join("")}
          </div>
        </div>
      \`).join("");

      // Bind input changes
      i18nContainer.querySelectorAll(".i18n-field-input").forEach((inp) => {
        inp.addEventListener("input", (e) => {
          const l = e.target.getAttribute("data-lang");
          const k = e.target.getAttribute("data-key");
          const v = e.target.value;
          if (!customTextsState[l]) customTextsState[l] = {};
          if (v.trim()) {
            customTextsState[l][k] = v;
            e.target.style.borderColor = "#10b981";
          } else {
            delete customTextsState[l][k];
            e.target.style.borderColor = "rgba(255,255,255,0.15)";
          }
        });
      });
    }

    // Dynamic Dashboard UI Translation Engine
    function updateDashboardLanguage(lang) {
      const t = DASHBOARD_I18N[lang] || DASHBOARD_I18N.en;

      // Header
      document.getElementById("dash-title-txt").textContent = "🎡 " + t.dashTitle;
      document.getElementById("dash-sub-txt").textContent = t.dashSubtitle;
      document.getElementById("btn-save-dash").textContent = "💾 " + t.saveAll;

      // Tabs
      document.getElementById("tab-nav-overview").textContent = t.tabOverview;
      document.getElementById("tab-nav-prizes").textContent = t.tabPrizes;
      document.getElementById("tab-nav-leads").textContent = t.tabLeads;
      document.getElementById("tab-nav-theme").textContent = t.tabTheme;
      document.getElementById("tab-nav-texts").textContent = t.tabTexts;

      // Tab 1: Stats
      document.getElementById("lbl-stat-spins").textContent = t.statSpins;
      document.getElementById("lbl-stat-coupons").textContent = t.statCoupons;
      document.getElementById("lbl-stat-leads").textContent = t.statLeads;
      document.getElementById("lbl-stat-rate").textContent = t.statRate;
      document.getElementById("lbl-campaign-title").textContent = "🚀 " + t.chartTitle;

      // Tab 2: Prizes
      document.getElementById("lbl-prizes-title").textContent = "🎡 " + t.prizesTitle;
      document.getElementById("lbl-prizes-sub").textContent = t.prizesSubtitle;
      document.getElementById("th-color").textContent = t.colColor;
      document.getElementById("th-label").textContent = t.colLabel;
      document.getElementById("th-code").textContent = t.colCode;
      document.getElementById("th-prob").textContent = t.colProb;
      document.getElementById("th-status").textContent = t.colStatus;

      // Tab 3: CRM Leads
      document.getElementById("lbl-leads-title").textContent = "👥 " + t.leadsTitle;
      document.getElementById("lbl-leads-sub").textContent = t.leadsSubtitle;
      document.getElementById("btn-export-csv").textContent = t.exportCSV;
      document.getElementById("th-name").textContent = t.colName;
      document.getElementById("th-email").textContent = t.colEmail;
      document.getElementById("th-phone").textContent = t.colPhone;
      document.getElementById("th-coupon").textContent = t.colCouponWon;
      document.getElementById("th-prize").textContent = t.colPrizeWon;
      document.getElementById("th-notes").textContent = t.colNotes;
      document.getElementById("th-lead-status").textContent = t.colStatus;

      // Tab 4: Theme
      document.getElementById("lbl-theme-title").textContent = "🎨 " + t.themeTitle;
      document.getElementById("lbl-theme-sub").textContent = t.themeSubtitle;
      document.getElementById("lbl-theme-preset").textContent = t.themeLabel;
      document.getElementById("lbl-theme-limit").textContent = t.limitLabel;
      document.getElementById("lbl-theme-desc").textContent = t.limitDesc;

      // Tab 5: Texts
      document.getElementById("lbl-texts-title").textContent = "🌍 " + t.textsTitle;
      document.getElementById("lbl-texts-sub").textContent = t.textsSubtitle;
      document.getElementById("btn-reset-lang-texts").textContent = t.resetLangBtn;

      // Re-render Tab 5 Custom text categories
      renderI18nFields(lang);
    }

    dashHeaderLangSel.addEventListener("change", (e) => {
      const selected = e.target.value;
      selLang.value = selected;
      updateDashboardLanguage(selected);
      updateWidget();
    });

    btnResetLang.addEventListener("click", () => {
      const lang = dashHeaderLangSel.value;
      const t = DASHBOARD_I18N[lang] || DASHBOARD_I18N.en;
      if (confirm(t.resetLangBtn + "?")) {
        delete customTextsState[lang];
        localStorage.setItem("wheel_of_fortune_custom_texts", JSON.stringify(customTextsState));
        renderI18nFields(lang);
        widget.setAttribute("custom-texts", JSON.stringify(customTextsState));
        log(\`🔄 Reset \${lang.toUpperCase()} custom texts to defaults.\`);
      }
    });

    // Save All Dashboard Changes Button
    const btnSaveDash = document.getElementById("btn-save-dash");
    if (btnSaveDash) {
      btnSaveDash.addEventListener("click", () => {
        const lang = dashHeaderLangSel.value;
        const t = DASHBOARD_I18N[lang] || DASHBOARD_I18N.en;
        localStorage.setItem("wheel_of_fortune_custom_texts", JSON.stringify(customTextsState));
        widget.setAttribute("custom-texts", JSON.stringify(customTextsState));
        widget.setAttribute("lang", lang);
        widget.setAttribute("color-theme", document.getElementById("dash-theme-sel").value);
        widget.setAttribute("daily-limit", document.getElementById("dash-limit-inp").value);
        log("💾 " + t.saveSuccess);
        alert("✅ " + t.saveSuccess);
      });
    }

    // Initialize in English (Default)
    updateDashboardLanguage("en");
    updateWidget();
    if (Object.keys(customTextsState).length > 0) {
      widget.setAttribute("custom-texts", JSON.stringify(customTextsState));
    }
  </script>

  <!-- Standalone Custom Element bundle -->
  <script type="module" src="/wheel-widget.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, "../public/test-sandbox.html"), htmlContent);
console.log("Successfully wrote enhanced multilingual public/test-sandbox.html via script!");
