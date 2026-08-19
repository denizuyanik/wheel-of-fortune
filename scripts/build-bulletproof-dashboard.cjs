const fs = require("fs");
const path = require("path");

// Load dictionaries from wheel-widget.js
const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
const widgetCode = fs.readFileSync(widgetJsPath, "utf8");

// Extract DASHBOARD_I18N
const dashI18nMatch = widgetCode.match(/(const DASHBOARD_I18N = \{[\s\S]*?\n    \};)/);
const dashI18nCode = dashI18nMatch ? dashI18nMatch[1] : "";

// Extract I18N_DICTIONARY
const i18nDictMatch = widgetCode.match(/(const I18N_DICTIONARY = \{[\s\S]*?\n    \};)/);
const i18nDictCode = i18nDictMatch ? i18nDictMatch[1] : "";

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wheel of Fortune — Official Management Dashboard</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Comic+Neue:wght@700&family=Inter:wght@400;600;700;900&family=Montserrat:wght@600;700;900&family=Orbitron:wght@700;900&family=Outfit:wght@500;600;700;800&family=Playfair+Display:wght@700;900&family=Poppins:wght@400;600;700;900&family=Roboto:wght@500;700;900&display=swap">
  <style>
    :root {
      --bg-gradient: radial-gradient(circle at 50% 10%, #1e1b4b 0%, #09090b 100%);
      --accent: #f59e0b;
      --card-bg: rgba(15, 23, 42, 0.85);
      --card-border: rgba(255, 255, 255, 0.1);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg-gradient);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Top Executive Header */
    .dash-header {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--card-border);
      padding: 14px 28px;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-brand h1 {
      margin: 0;
      font-size: 19px;
      font-weight: 800;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header-brand p {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Language Selector & Controls */
    .lang-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.06);
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .lang-bar label {
      font-size: 12px;
      font-weight: 700;
      color: #fbbf24;
    }
    .lang-select {
      background: #0f172a;
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
      outline: none;
    }

    .btn-save-main {
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      font-weight: 800;
      font-size: 13px;
      color: #fff;
      padding: 9px 18px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(16,185,129,0.35);
      transition: all 0.2s;
    }
    .btn-save-main:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16,185,129,0.5);
    }

    /* Navigation Tabs */
    .dash-nav {
      padding: 12px 28px 0;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      gap: 6px;
      border-bottom: 1px solid var(--card-border);
      overflow-x: auto;
    }
    .dash-tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 700;
      padding: 10px 16px;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      border-bottom: 3px solid transparent;
      white-space: nowrap;
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

    /* Dashboard Container */
    .dash-container {
      max-width: 1300px;
      width: 100%;
      margin: 0 auto;
      padding: 24px 28px 60px;
    }
    .dash-pane {
      display: none;
    }
    .dash-pane.active {
      display: block !important;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 800;
      color: #fbbf24;
    }
    .card-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px 20px;
      text-align: center;
    }
    .stat-card h4 {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .stat-card .val {
      font-size: 28px;
      font-weight: 900;
    }

    /* Tables */
    .table-responsive {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    th {
      background: rgba(0,0,0,0.3);
      color: var(--text-muted);
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      vertical-align: middle;
    }
    tr:hover td {
      background: rgba(255,255,255,0.02);
    }

    input[type="text"], input[type="number"], select {
      background: #0f172a;
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 7px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-family: inherit;
      outline: none;
    }
    input:focus, select:focus {
      border-color: #f59e0b;
    }

    .btn-action {
      background: #3b82f6;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-action:hover {
      opacity: 0.9;
    }
    .btn-delete {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
    }
    .btn-delete:hover {
      background: #ef4444;
      color: #fff;
    }

    .badge-win {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #34d399;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Toast Banner */
    .save-banner {
      display: none;
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #fff;
      font-weight: 800;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      z-index: 1000;
      animation: slideUp 0.3s forwards;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>

  <!-- Top Executive Header -->
  <header class="dash-header">
    <div class="header-brand">
      <span style="font-size:26px;">🎡</span>
      <div>
        <h1 id="dash-title-txt">Wheel of Fortune Dashboard</h1>
        <p id="dash-sub-txt">Manage prizes, probabilities, CRM leads, theme, typography, and 16 languages</p>
      </div>
    </div>

    <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
      <div class="lang-bar">
        <label id="dash-lang-label">🌐 Language:</label>
        <select class="lang-select" id="dash-header-lang-sel" onchange="onLanguageChange(this.value)">
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

      <button type="button" class="btn-save-main" id="btn-save-dash" onclick="saveAllSettings()">
        💾 Save All Changes
      </button>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <nav class="dash-nav" id="dash-nav-tabs">
    <button type="button" class="dash-tab-btn active" id="tab-btn-overview" onclick="switchDashboardTab('dash-overview')">📊 Overview</button>
    <button type="button" class="dash-tab-btn" id="tab-btn-prizes" onclick="switchDashboardTab('dash-prizes')">🎁 Prize Slices</button>
    <button type="button" class="dash-tab-btn" id="tab-btn-leads" onclick="switchDashboardTab('dash-leads')">👥 CRM Leads & Notes</button>
    <button type="button" class="dash-tab-btn" id="tab-btn-theme" onclick="switchDashboardTab('dash-theme')">🎨 Design & Theme</button>
    <button type="button" class="dash-tab-btn" id="tab-btn-i18n" onclick="switchDashboardTab('dash-i18n')">🌍 16 Languages & Texts</button>
  </nav>

  <!-- Main Content Container -->
  <main class="dash-container">
    
    <!-- ─── 1. OVERVIEW TAB ─── -->
    <div class="dash-pane active" id="dash-overview">
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

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
        <div class="card">
          <div class="card-title">⚡ Quick Configuration</div>
          <div style="margin-top:14px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font-size:13px; font-weight:600;">Wheel Active on Live Site</label>
              <input type="checkbox" id="chk-is-active" checked style="width:18px; height:18px; cursor:pointer;" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font-size:13px; font-weight:600;">Daily Spin Limit Per Visitor</label>
              <input type="number" id="inp-daily-limit" value="1" min="1" max="100" style="width:70px;" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label style="font-size:13px; font-weight:600;">Primary Typography Font</label>
              <select id="sel-dash-font" style="width:170px;">
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
        </div>

        <div class="card">
          <div class="card-title" style="color:#34d399;">💎 Pro Gamification Highlights</div>
          <ul style="color:var(--text-muted); font-size:13px; line-height:1.8; margin-top:10px; padding-left:18px;">
            <li>⚡ <strong>Turbo Boost:</strong> Dynamic re-acceleration with supersonic wind gust effects.</li>
            <li>🎁 <strong>Unlimited Slices:</strong> Add 2, 6, 8, 12, 20+ slices with custom odds.</li>
            <li>🎟️ <strong>HD 1200x700 Branded Vouchers:</strong> 1-click instant PNG voucher download.</li>
            <li>🛡️ <strong>Smart Anti-Cheat:</strong> 1 spin per calendar day per visitor protection.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ─── 2. PRIZE SLICES TAB ─── -->
    <div class="dash-pane" id="dash-prizes">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title" id="lbl-prize-table-title">Wheel Prize Slices (Unlimited)</div>
            <div class="card-desc" id="lbl-prize-table-desc">Add or remove as many slices as you want. Customize slice colors, text colors, labels, coupon codes, and win odds.</div>
          </div>
          <button type="button" class="btn-action" id="btn-add-slice" onclick="addNewSlice()" style="background:#3b82f6;">➕ Add New Slice</button>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>BG Color</th>
                <th>Text Color</th>
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

    <!-- ─── 3. CRM LEADS TAB ─── -->
    <div class="dash-pane" id="dash-leads">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title" id="lbl-crm-title">Captured CRM Leads & Winner Contacts</div>
            <div class="card-desc" id="lbl-crm-desc">Real-time visitor lead database with prize history, follow-up status, and custom notes.</div>
          </div>
          <button type="button" class="btn-action" id="btn-export-csv" onclick="exportLeadsCSV()" style="background:#10b981;">📥 Export to CSV</button>
        </div>

        <div class="table-responsive">
          <table>
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

    <!-- ─── 4. THEME TAB ─── -->
    <div class="dash-pane" id="dash-theme">
      <div class="card">
        <div class="card-title" id="lbl-theme-title">Color Themes & Visual Branding</div>
        <div class="card-desc" style="margin-bottom:18px;">Choose a luxury theme that matches your website style.</div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:20px;">
          <div class="theme-option active" data-theme="gold" onclick="selectTheme('gold')" style="background:linear-gradient(135deg, #1e1b4b, #0f172a); border:2px solid #fbbf24; border-radius:10px; padding:16px; cursor:pointer; text-align:center;">
            <div style="font-size:24px;">👑</div>
            <h4 style="margin:6px 0; color:#fbbf24;">Royal Gold</h4>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Rich dark blue & gold luxury accents</p>
          </div>
          <div class="theme-option" data-theme="dark" onclick="selectTheme('dark')" style="background:#09090b; border:2px solid #27272a; border-radius:10px; padding:16px; cursor:pointer; text-align:center;">
            <div style="font-size:24px;">🌌</div>
            <h4 style="margin:6px 0; color:#a855f7;">Dark Nebula</h4>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Deep space dark mode with purple glow</p>
          </div>
          <div class="theme-option" data-theme="neon" onclick="selectTheme('neon')" style="background:#022c22; border:2px solid #064e3b; border-radius:10px; padding:16px; cursor:pointer; text-align:center;">
            <div style="font-size:24px;">⚡</div>
            <h4 style="margin:6px 0; color:#10b981;">Emerald Cyber</h4>
            <p style="margin:0; font-size:11px; color:#94a3b8;">Vibrant neon green & cyber grid</p>
          </div>
          <div class="theme-option" data-theme="light" onclick="selectTheme('light')" style="background:#f8fafc; border:2px solid #e2e8f0; border-radius:10px; padding:16px; cursor:pointer; text-align:center;">
            <div style="font-size:24px;">☀️</div>
            <h4 style="margin:6px 0; color:#0f172a;">Clean Light</h4>
            <p style="margin:0; font-size:11px; color:#64748b;">Crisp light mode with high contrast</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── 5. 16 LANGUAGES TAB ─── -->
    <div class="dash-pane" id="dash-i18n">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title" id="lbl-i18n-title">16 Languages & 36 Custom Text Fields</div>
            <div class="card-desc" id="lbl-i18n-desc">Select any language and fully customize all 36 text labels across the wheel, form, and voucher.</div>
          </div>
          <button type="button" class="btn-action" id="btn-reset-lang-texts" onclick="resetLanguageTexts()" style="background:#ef4444;">🔄 Reset Language to Defaults</button>
        </div>

        <div id="i18n-fields-container" style="display:flex; flex-direction:column; gap:16px;">
          <!-- Dynamically populated -->
        </div>
      </div>
    </div>

  </main>

  <div class="save-banner" id="save-banner">
    ✅ All Settings Successfully Saved & Applied!
  </div>

  <script>
    ${dashI18nCode}
    ${i18nDictCode}

    let currentPrizes = [
      { id: "p1", label: "10% OFF", code: "SPIN10", color: "#6366F1", textColor: "#ffffff", probability: 25, isWinner: true },
      { id: "p2", label: "FREE SHIPPING", code: "FREESHIP", color: "#EC4899", textColor: "#ffffff", probability: 20, isWinner: true },
      { id: "p3", label: "TRY AGAIN", code: "", color: "#64748B", textColor: "#ffffff", probability: 15, isWinner: false },
      { id: "p4", label: "20% OFF", code: "LUCKY20", color: "#F59E0B", textColor: "#ffffff", probability: 15, isWinner: true },
      { id: "p5", label: "MYSTERY GIFT", code: "GIFT50", color: "#10B981", textColor: "#ffffff", probability: 10, isWinner: true },
      { id: "p6", label: "5% OFF", code: "WELCOME5", color: "#8B5CF6", textColor: "#ffffff", probability: 15, isWinner: true },
    ];

    let selectedTheme = "gold";
    let customTextsState = {};

    // ─── 100% Reliable Tab Switching ───
    window.switchDashboardTab = function(paneId) {
      document.querySelectorAll(".dash-pane").forEach(p => {
        p.style.display = "none";
        p.classList.remove("active");
      });
      document.querySelectorAll(".dash-tab-btn").forEach(b => {
        b.classList.remove("active");
      });

      const targetPane = document.getElementById(paneId);
      if (targetPane) {
        targetPane.style.display = "block";
        targetPane.classList.add("active");
      }

      const btnId = "tab-btn-" + paneId.replace("dash-", "");
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.add("active");
    };

    // Theme Selection
    window.selectTheme = function(theme) {
      selectedTheme = theme;
      document.querySelectorAll(".theme-option").forEach(opt => {
        if (opt.getAttribute("data-theme") === theme) {
          opt.style.borderColor = "#fbbf24";
          opt.classList.add("active");
        } else {
          opt.style.borderColor = "var(--card-border)";
          opt.classList.remove("active");
        }
      });
    };

    // Prize Table Rendering
    window.renderPrizeTable = function() {
      const tbody = document.getElementById("tbody-prizes");
      if (!tbody) return;
      tbody.innerHTML = currentPrizes.map((p, idx) => \`
        <tr>
          <td><input type="color" value="\${p.color}" onchange="updatePrize(\${idx}, 'color', this.value)" style="width:36px; height:32px; border:none; background:transparent; cursor:pointer;" /></td>
          <td><input type="color" value="\${p.textColor || '#FFFFFF'}" onchange="updatePrize(\${idx}, 'textColor', this.value)" style="width:36px; height:32px; border:none; background:transparent; cursor:pointer;" /></td>
          <td><input type="text" value="\${p.label}" onchange="updatePrize(\${idx}, 'label', this.value)" style="width:140px;" /></td>
          <td><input type="text" value="\${p.code}" onchange="updatePrize(\${idx}, 'code', this.value)" placeholder="e.g. SAVE20" style="width:120px;" /></td>
          <td><input type="number" value="\${p.probability}" min="0" max="100" onchange="updatePrize(\${idx}, 'probability', Number(this.value))" style="width:70px;" /></td>
          <td><input type="checkbox" \${p.isWinner ? 'checked' : ''} onchange="updatePrize(\${idx}, 'isWinner', this.checked)" style="width:18px; height:18px; cursor:pointer;" /></td>
          <td><button type="button" class="btn-delete" onclick="deletePrize(\${idx})">🗑️ Delete</button></td>
        </tr>
      \`).join("");
    };

    window.updatePrize = function(idx, field, value) {
      if (currentPrizes[idx]) {
        currentPrizes[idx][field] = value;
      }
    };

    window.deletePrize = function(idx) {
      if (currentPrizes.length <= 2) {
        alert("⚠️ You must have at least 2 prize slices on the wheel!");
        return;
      }
      currentPrizes.splice(idx, 1);
      renderPrizeTable();
    };

    window.addNewSlice = function() {
      const colors = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6", "#3B82F6", "#EF4444"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      currentPrizes.push({
        id: "prize_" + Date.now(),
        color: randomColor,
        textColor: "#FFFFFF",
        label: "NEW PRIZE",
        code: "BONUS",
        probability: 10,
        isWinner: true
      });
      renderPrizeTable();
    };

    // CRM Leads Table
    const sampleLeads = [
      { name: "Sarah Jenkins", email: "sarah.j@gmail.com", phone: "+1 555-0192", prize: "10% OFF", code: "SPIN10", lang: "en", date: "Today 14:20", status: "Converted", notes: "Redeemed at checkout" },
      { name: "Mehmet Yılmaz", email: "mehmet.y@outlook.com", phone: "+90 532-1100", prize: "FREE SHIPPING", code: "FREESHIP", lang: "tr", date: "Today 12:45", status: "New", notes: "Follow up tomorrow" },
      { name: "Hans Müller", email: "hans.m@web.de", phone: "+49 170-4491", prize: "20% OFF", code: "LUCKY20", lang: "de", date: "Yesterday", status: "Contacted", notes: "Sent welcome email" },
      { name: "Elena Rossi", email: "elena.r@libero.it", phone: "+39 340-9811", prize: "MYSTERY GIFT", code: "GIFT50", lang: "it", date: "Yesterday", status: "Converted", notes: "Completed purchase" }
    ];

    window.renderLeadsTable = function() {
      const tbody = document.getElementById("tbody-leads");
      if (!tbody) return;
      tbody.innerHTML = sampleLeads.map(l => \`
        <tr>
          <td><strong>\${l.name}</strong></td>
          <td>\${l.email}</td>
          <td>\${l.phone}</td>
          <td>\${l.prize}</td>
          <td><span class="badge-win">\${l.code}</span></td>
          <td>\${l.lang.toUpperCase()}</td>
          <td>\${l.date}</td>
          <td>
            <select style="padding:4px 8px; font-size:11px;">
              <option \${l.status==='New'?'selected':''}>New</option>
              <option \${l.status==='Contacted'?'selected':''}>Contacted</option>
              <option \${l.status==='Converted'?'selected':''}>Converted</option>
            </select>
          </td>
          <td><input type="text" value="\${l.notes}" style="width:160px; font-size:11px;" /></td>
        </tr>
      \`).join("");
    };

    // CSV Export
    window.exportLeadsCSV = function() {
      let csv = "Name,Email,Phone,Prize,Code,Language,Date,Status,Notes\\n";
      sampleLeads.forEach(l => {
        csv += \`"\${l.name}","\${l.email}","\${l.phone}","\${l.prize}","\${l.code}","\${l.lang}","\${l.date}","\${l.status}","\${l.notes}"\\n\`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wheel_of_fortune_leads.csv";
      a.click();
    };

    // 16 Languages & Custom Texts
    function getLocalizedCategories(lang) {
      const dict = (typeof DASHBOARD_I18N !== "undefined" && DASHBOARD_I18N[lang]) || {};
      const cat1 = dict.cat1Title || "Wheel & Spin Button";
      const cat2 = dict.cat2Title || "Lead Capture Form";
      const cat3 = dict.cat3Title || "Privacy & Consent";
      const cat4 = dict.cat4Title || "Prizes & Vouchers";
      return [
        {
          category: cat1,
          icon: "🎯",
          fields: [
            { key: "title", label: \`\${cat1} - Title\` },
            { key: "subtitle", label: "Subtitle" },
            { key: "spinBtn", label: "Spin Button Label" },
            { key: "spinning", label: "Spinning Status Text" },
            { key: "rewardWon", label: "Reward Won Title" },
            { key: "noReward", label: "No Reward / Loss Title" },
          ],
        },
        {
          category: cat2,
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
            { key: "success", label: "Success Notification Text" },
          ],
        },
        {
          category: cat3,
          icon: "⚖️",
          fields: [
            { key: "privacyConsent", label: "Privacy Policy Consent Text" },
            { key: "marketingConsent", label: "Marketing Communication Consent Text" },
            { key: "errorConsent", label: "Privacy Not Accepted Alert" },
            { key: "errorRequired", label: "Required Fields Empty Alert" },
            { key: "errorEmail", label: "Invalid Email Address Alert" },
          ],
        },
        {
          category: cat4,
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

    window.renderI18nFields = function(lang) {
      const container = document.getElementById("i18n-fields-container");
      if (!container) return;
      const cats = getLocalizedCategories(lang);
      const dict = (typeof DASHBOARD_I18N !== "undefined" && DASHBOARD_I18N[lang]) || {};
      const langDict = (typeof I18N_DICTIONARY !== "undefined" && I18N_DICTIONARY[lang]) || {};

      container.innerHTML = cats.map(cat => \`
        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--card-border); border-radius:12px; padding:18px;">
          <h4 style="margin:0 0 14px 0; font-size:14px; color:#fbbf24; display:flex; align-items:center; gap:8px;">
            <span>\${cat.icon}</span> \${cat.category}
          </h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
            \${cat.fields.map(f => {
              const currentVal = (customTextsState[lang] && customTextsState[lang][f.key]) || "";
              const defaultVal = langDict[f.key] || "";
              return \`
                <div>
                  <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">\${f.label}</label>
                  <input
                    type="text"
                    data-lang="\${lang}"
                    data-key="\${f.key}"
                    class="i18n-field-input"
                    value="\${currentVal.replace(/"/g, '&quot;')}"
                    placeholder="Default: \${defaultVal.replace(/"/g, '&quot;')}"
                    style="width:100%; padding:7px 10px; border-color:\${currentVal ? '#10b981' : 'var(--card-border)'};"
                  />
                </div>
              \`;
            }).join("")}
          </div>
        </div>
      \`).join("");

      container.querySelectorAll(".i18n-field-input").forEach(inp => {
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
            e.target.style.borderColor = "var(--card-border)";
          }
        });
      });
    };

    // Language Change
    window.onLanguageChange = function(lang) {
      if (typeof DASHBOARD_I18N !== "undefined" && DASHBOARD_I18N[lang]) {
        const t = DASHBOARD_I18N[lang];
        try {
          if (document.getElementById("dash-sub-txt")) document.getElementById("dash-sub-txt").textContent = t.dashSubtitle;
          if (document.getElementById("btn-save-dash")) document.getElementById("btn-save-dash").textContent = "💾 " + t.saveAll;
          if (document.getElementById("tab-btn-overview")) document.getElementById("tab-btn-overview").textContent = t.tabOverview;
          if (document.getElementById("tab-btn-prizes")) document.getElementById("tab-btn-prizes").textContent = t.tabPrizes;
          if (document.getElementById("tab-btn-leads")) document.getElementById("tab-btn-leads").textContent = t.tabLeads;
          if (document.getElementById("tab-btn-theme")) document.getElementById("tab-btn-theme").textContent = t.tabTheme;
          if (document.getElementById("tab-btn-i18n")) document.getElementById("tab-btn-i18n").textContent = t.tabTexts;
          if (document.getElementById("lbl-stat-spins")) document.getElementById("lbl-stat-spins").textContent = t.statSpins;
          if (document.getElementById("lbl-stat-coupons")) document.getElementById("lbl-stat-coupons").textContent = t.statCoupons;
          if (document.getElementById("lbl-stat-leads")) document.getElementById("lbl-stat-leads").textContent = t.statLeads;
          if (document.getElementById("lbl-stat-rate")) document.getElementById("lbl-stat-rate").textContent = t.statRate;
        } catch (e) {}
      }
      renderI18nFields(lang);
    };

    window.resetLanguageTexts = function() {
      const lang = document.getElementById("dash-header-lang-sel").value;
      if (confirm("Reset custom texts for " + lang.toUpperCase() + " to defaults?")) {
        delete customTextsState[lang];
        localStorage.setItem("wheel_of_fortune_custom_texts", JSON.stringify(customTextsState));
        renderI18nFields(lang);
      }
    };

    // Save All Settings
    window.saveAllSettings = function() {
      const lang = document.getElementById("dash-header-lang-sel").value;
      const font = document.getElementById("sel-dash-font").value;
      const limit = parseInt(document.getElementById("inp-daily-limit").value, 10) || 1;

      const settings = {
        lang: lang,
        fontFamily: font,
        colorTheme: selectedTheme,
        dailyLimit: limit,
        prizes: currentPrizes
      };

      localStorage.setItem("wof_settings", JSON.stringify(settings));
      localStorage.setItem("wheel_of_fortune_custom_texts", JSON.stringify(customTextsState));

      // PostMessage to parent window
      window.parent.postMessage({
        type: "wof-update-settings",
        settings: settings
      }, "*");

      // Show Save Toast
      const banner = document.getElementById("save-banner");
      if (banner) {
        banner.style.display = "block";
        setTimeout(() => { banner.style.display = "none"; }, 3000);
      }
    };

    // Initial Boot
    try {
      const saved = localStorage.getItem("wof_settings");
      if (saved) {
        const config = JSON.parse(saved);
        if (config.colorTheme) selectedTheme = config.colorTheme;
        if (config.fontFamily && document.getElementById("sel-dash-font")) document.getElementById("sel-dash-font").value = config.fontFamily;
        if (config.dailyLimit && document.getElementById("inp-daily-limit")) document.getElementById("inp-daily-limit").value = config.dailyLimit;
        if (config.lang && document.getElementById("dash-header-lang-sel")) document.getElementById("dash-header-lang-sel").value = config.lang;
        if (config.prizes && Array.isArray(config.prizes)) currentPrizes = config.prizes;
      }
      const rawTexts = localStorage.getItem("wheel_of_fortune_custom_texts");
      if (rawTexts) customTextsState = JSON.parse(rawTexts);
    } catch (e) {}

    selectTheme(selectedTheme);
    renderPrizeTable();
    renderLeadsTable();
    onLanguageChange(document.getElementById("dash-header-lang-sel").value);
  </script>
</body>
</html>
`;

// Write to both public/dashboard.html and public/test-sandbox.html
fs.writeFileSync(path.join(__dirname, "../public/dashboard.html"), fullHtml);
fs.writeFileSync(path.join(__dirname, "../public/test-sandbox.html"), fullHtml);

console.log("SUCCESS: Created bulletproof, 100% clickable dashboard on both dashboard.html and test-sandbox.html!");
