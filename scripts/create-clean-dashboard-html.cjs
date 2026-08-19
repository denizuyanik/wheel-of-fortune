const fs = require("fs");
const path = require("path");

const sandboxPath = path.join(__dirname, "../public/test-sandbox.html");
const sandboxHtml = fs.readFileSync(sandboxPath, "utf8");

// Extract CSS
const cssMatch = sandboxHtml.match(/<style>([\s\S]*?)<\/style>/);
const css = cssMatch ? cssMatch[1] : "";

// Extract I18N and JS dictionaries & functions from test-sandbox.html
const scriptMatch = sandboxHtml.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
let jsCode = scriptMatch ? scriptMatch[1] : "";

// Modify JS to ensure dashboard is the only view and auto-loads on startup
const cleanDashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wheel of Fortune — Official Management Dashboard</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Comic+Neue:wght@700&family=Inter:wght@400;600;700;900&family=Montserrat:wght@600;700;900&family=Orbitron:wght@700;900&family=Outfit:wght@500;600;700;800&family=Playfair+Display:wght@700;900&family=Poppins:wght@400;600;700;900&family=Roboto:wght@500;700;900&display=swap">
  <style>
    ${css}
    /* Clean Dashboard Production Overrides */
    body {
      background: radial-gradient(circle at 50% 10%, #1e1b4b 0%, #09090b 100%);
      padding: 0;
      margin: 0;
      min-height: 100vh;
    }
    .dash-header {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px 28px;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
    .dash-nav {
      padding: 14px 28px 0;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      overflow-x: auto;
    }
    .dash-tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 14px;
      font-weight: 700;
      padding: 10px 18px;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      border-bottom: 3px solid transparent;
    }
    .dash-tab-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.04);
    }
    .dash-tab-btn.active {
      color: #fbbf24;
      background: rgba(251, 191, 36, 0.1);
      border-bottom-color: #fbbf24;
    }
    .dashboard-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 24px 28px 60px;
    }
  </style>
</head>
<body>

  <!-- Persistent Header with Title, Language Selector and Save Button -->
  <header class="dash-header">
    <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:28px;">🎡</span>
        <div>
          <h1 id="dash-title-txt" style="margin:0; font-size:20px; font-weight:800; background:linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Wheel of Fortune Dashboard</h1>
          <p id="dash-sub-txt" style="margin:2px 0 0 0; font-size:12px; color:#94a3b8;">Manage prizes, win probabilities, CRM leads, theme, typography, and 16 languages</p>
        </div>
      </div>
      
      <!-- Persistent Language Selector -->
      <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.06); padding:6px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.12);">
        <label id="dash-lang-label" style="font-size:12px; font-weight:700; color:#fbbf24;">🌐 Language:</label>
        <select id="dash-header-lang-sel" style="background:#0f172a; color:#fff; border:1px solid rgba(255,255,255,0.2); padding:6px 10px; border-radius:6px; font-size:13px; cursor:pointer; font-weight:600; outline:none;">
          <option value="en" selected>English 🇺🇸 (Default)</option>
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

    <div style="display:flex; align-items:center; gap:12px;">
      <button type="button" style="background:linear-gradient(135deg, #10b981, #059669); border:none; font-weight:800; font-size:13px; color:#fff; padding:10px 20px; border-radius:8px; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.35); transition:all 0.2s;" id="btn-save-dash">💾 Save All Changes</button>
    </div>
  </header>

  <!-- Dashboard Navigation Tabs -->
  <nav class="dash-nav" id="dash-nav-tabs">
    <button type="button" class="dash-tab-btn active" data-pane="dash-overview" id="tab-nav-overview">📊 Overview</button>
    <button type="button" class="dash-tab-btn" data-pane="dash-prizes" id="tab-nav-prizes">🎁 Prize Slices</button>
    <button type="button" class="dash-tab-btn" data-pane="dash-leads" id="tab-nav-leads">👥 CRM Leads & Notes</button>
    <button type="button" class="dash-tab-btn" data-pane="dash-theme" id="tab-nav-theme">🎨 Design & Theme</button>
    <button type="button" class="dash-tab-btn" data-pane="dash-i18n" id="tab-nav-texts">🌍 16 Languages & Texts</button>
  </nav>

  <main class="dashboard-container">
    
    <!-- Tab 1: Overview -->
    <div class="dash-content-pane active" id="dash-overview">
      <div class="stats-grid">
        <div class="stat-card">
          <h4 id="lbl-stat-spins">Total Spins</h4>
          <div class="val" style="color:#60a5fa;" id="stat-spins">42</div>
        </div>
        <div class="stat-card">
          <h4 id="lbl-stat-coupons">Coupons Won</h4>
          <div class="val" style="color:#34d399;" id="stat-winners">35</div>
        </div>
        <div class="stat-card">
          <h4 id="lbl-stat-leads">Leads Collected</h4>
          <div class="val" style="color:#a78bfa;" id="stat-leads">31</div>
        </div>
        <div class="stat-card">
          <h4 id="lbl-stat-rate">Conversion Rate</h4>
          <div class="val" style="color:#fbbf24;" id="stat-conv">74%</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px; margin-top:24px;">
        <div class="settings-card">
          <h3 style="margin-top:0; color:#fbbf24;">⚡ Quick App Controls</h3>
          <div class="form-row" style="margin-top:14px;">
            <label id="lbl-active-wheel">Wheel Active on Live Site</label>
            <input type="checkbox" id="chk-is-active" checked style="width:20px; height:20px; cursor:pointer;" />
          </div>
          <div class="form-row">
            <label id="lbl-limit-spin">Daily Limit Per Visitor</label>
            <input type="number" id="inp-daily-limit" value="1" min="1" max="100" class="ctrl-input" style="width:70px;" />
          </div>
          <div class="form-row">
            <label id="lbl-font-choice">Primary Typography Font</label>
            <select id="sel-dash-font" class="ctrl-select" style="width:160px;">
              <option value="Outfit">Outfit (Clean & Modern)</option>
              <option value="Poppins">Poppins (Geometric)</option>
              <option value="Inter">Inter (Ultra Legible)</option>
              <option value="Montserrat">Montserrat (Bold Header)</option>
              <option value="Roboto">Roboto (Standard)</option>
              <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
              <option value="Cinzel">Cinzel (Royal)</option>
              <option value="Orbitron">Orbitron (Cyberpunk)</option>
              <option value="Comic Neue">Comic Neue (Playful)</option>
            </select>
          </div>
        </div>

        <div class="settings-card">
          <h3 style="margin-top:0; color:#34d399;">💎 Pro Gamification Features</h3>
          <ul style="color:#cbd5e1; font-size:13px; line-height:1.8; margin:0; padding-left:18px;">
            <li>⚡ <strong>Turbo Boost:</strong> Dynamic re-acceleration with supersonic wind gust effects.</li>
            <li>🎁 <strong>Unlimited Slices:</strong> Add 2, 6, 8, 12, 20+ slices with custom odds.</li>
            <li>🎟️ <strong>HD 1200x700 Branded Vouchers:</strong> 1-click instant PNG voucher download.</li>
            <li>🛡️ <strong>Smart Anti-Cheat:</strong> 1 spin per calendar day per visitor protection.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Tab 2: Prizes -->
    <div class="dash-content-pane" id="dash-prizes">
      <div class="settings-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0; color:#fbbf24;" id="lbl-prize-table-title">Wheel Prize Slices (Unlimited)</h3>
            <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8;" id="lbl-prize-table-desc">Add or remove as many slices as you want. Customize background color, text color, label, coupon code, and win odds.</p>
          </div>
          <button type="button" class="ctrl-btn" id="btn-add-slice" style="background:#3b82f6; font-weight:700;">➕ Add New Slice</button>
        </div>

        <div style="overflow-x:auto;">
          <table class="leads-table" id="table-prizes">
            <thead>
              <tr>
                <th>Color</th>
                <th>Text</th>
                <th>Prize Label</th>
                <th>Coupon Code</th>
                <th>Win Probability (%)</th>
                <th>Is Winner?</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="tbody-prizes">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 3: Leads CRM -->
    <div class="dash-content-pane" id="dash-leads">
      <div class="settings-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0; color:#fbbf24;" id="lbl-crm-title">Captured CRM Leads & Winner Contacts</h3>
            <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8;" id="lbl-crm-desc">Real-time visitor lead database with prize history, follow-up status, and custom notes.</p>
          </div>
          <button type="button" class="ctrl-btn" id="btn-export-csv" style="background:#10b981; font-weight:700;">📥 Export to CSV</button>
        </div>

        <div style="overflow-x:auto;">
          <table class="leads-table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Won Prize</th>
                <th>Coupon Code</th>
                <th>Language</th>
                <th>Date</th>
                <th>Status</th>
                <th>CRM Notes</th>
              </tr>
            </thead>
            <tbody id="tbody-leads">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 4: Theme & Typography -->
    <div class="dash-content-pane" id="dash-theme">
      <div class="settings-card">
        <h3 style="margin-top:0; color:#fbbf24;" id="lbl-theme-title">Color Themes & Visual Branding</h3>
        <p style="margin:4px 0 16px 0; font-size:12px; color:#94a3b8;">Choose a luxury theme that matches your website style.</p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:24px;">
          <div class="theme-card-option active" data-theme="gold" onclick="selectDashTheme('gold')" style="background:linear-gradient(135deg, #1e1b4b, #0f172a); border:2px solid #fbbf24; border-radius:10px; padding:16px; cursor:pointer; text-align:center;">
            <div style="font-size:24px;">👑</div>
            <h4 style="margin:6px 0; color:#fbbf24;">Royal Gold</h4>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Rich dark blue & gold luxury accents</p>
          </div>
          <div class="theme-card-option" data-theme="dark" onclick="selectDashTheme('dark')" style="background:#09090b; border:2px solid #27272a; border-radius:10px; padding:16px; cursor:pointer; text-align:center;">
            <div style="font-size:24px;">🌌</div>
            <h4 style="margin:6px 0; color:#a855f7;">Dark Nebula</h4>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Deep space dark mode with purple glow</p>
          </div>
          <div class="theme-card-option" data-theme="neon" onclick="selectDashTheme('neon')" style="background:#022c22; border:2px solid #064e3b; border-radius:10px; padding:16px; cursor:pointer; text-align:center;">
            <div style="font-size:24px;">⚡</div>
            <h4 style="margin:6px 0; color:#10b981;">Emerald Cyber</h4>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Vibrant neon green & cyber grid</p>
          </div>
          <div class="theme-card-option" data-theme="light" onclick="selectDashTheme('light')" style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:10px; padding:16px; cursor:pointer; text-align:center;">
            <div style="font-size:24px;">☀️</div>
            <h4 style="margin:6px 0; color:#0f172a;">Clean Light</h4>
            <p style="margin:0; font-size:11px; color:#64748b;">Crisp light mode with high contrast</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 5: 16 Languages & Custom Texts -->
    <div class="dash-content-pane" id="dash-i18n">
      <div class="settings-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0; color:#fbbf24;" id="lbl-i18n-title">16 Languages & 36 Custom Text Fields</h3>
            <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8;" id="lbl-i18n-desc">Select any language and fully customize all 36 text labels across the wheel, form, and voucher.</p>
          </div>
          <button type="button" class="ctrl-btn" id="btn-reset-lang-texts" style="background:#ef4444; font-weight:700;">🔄 Reset Language to Defaults</button>
        </div>

        <div id="i18n-fields-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
          <!-- Dynamically populated with all 36 text inputs -->
        </div>
      </div>
    </div>

  </main>

  <script>
    ${jsCode}
  </script>
</body>
</html>
`;

const dashboardPath = path.join(__dirname, "../public/dashboard.html");
fs.writeFileSync(dashboardPath, cleanDashboardHtml);
console.log("SUCCESS: Created official public/dashboard.html for Wix Studio Dashboard!");
