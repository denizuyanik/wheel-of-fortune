# 🎡 WHEEL OF FORTUNE (SPIN & WIN)
## Complete Wix App Market Submission Dossier & Master Configuration Guide for Gemini Pro

---

> **Note for Gemini Pro / AI Assistant:**
> This document is the **single source of truth** for the **Wheel of Fortune** Wix Application. It contains all architectural details, OAuth permission scopes, marketing copy, pricing tiers, multilingual settings, extension IDs, data collection schemas, and field-by-field instructions to configure and publish the application on the **Wix App Market / Wix Developers Center**.

---

## 1. 📋 Application Overview & Master Metadata

| Field | Production Value |
| :--- | :--- |
| **App Name** | **Wheel of Fortune — Spin & Win Discount Wheel** |
| **Alternative App Name** | **Lucky Wheel: Interactive Gamified Lead & Coupon Pop-up** |
| **App Tagline** | *Boost sales & capture leads with an interactive, gamified lucky spin wheel!* |
| **App Version** | `1.0.0` (Production Ready) |
| **Primary Category** | **Marketing & Promotion** |
| **Secondary Category** | **Lead Generation / Sales Boost / Gamification** |
| **Target Audience** | E-commerce stores, service websites, blogs, agencies, and retail sites looking to increase conversion rates and grow their email marketing list. |
| **Supported Editor Types** | **Wix Studio, Wix Blocks, Wix Standard Editor, Velo by Wix** |
| **Supported Languages** | **16 Languages** (English as default, Türkçe, Deutsch, Français, Español, עברית, 中文, 日本語, 한국어, हिन्दी, Português, Русский, Українська, Ελληνικά, Italiano, العربية) |

---

## 2. 📝 Marketing Copy & Descriptions (Wix App Market Listing)

### A. Short Description (Max 100 Characters)
> *Boost sales & capture high-converting leads with an interactive, gamified discount spin wheel!*

### B. Medium Description (App Card Summary)
> *Turn visitors into paying customers with Wheel of Fortune! Offer exciting discount coupons, capture verified email and phone leads, prevent multiple spins with anti-cheat protection, and let winners download official digital HD vouchers.*

### C. Full App Market Description (Markdown / HTML)
```markdown
### 🎡 Turn Bouncing Visitors into Loyal Paying Customers!

**Wheel of Fortune** is an interactive, gamified conversion machine designed to dramatically increase your store's sales, email subscriber list, and customer engagement.

Give your site visitors a thrilling, casino-grade experience! Visitors enter their details, spin the lucky wheel, unlock exclusive discount coupons, and instantly download their official gift voucher.

---

### ✨ Key Features site owners love:

* 🎡 **Unlimited Slices & Custom Prizes:** Add as many prize slices as you want (2, 6, 8, 12, 20+ slices). Fully customize background colors, text colors, prize labels, coupon codes, and win probabilities.
* ⚡ **Interactive Turbo Boost Re-Acceleration:** Visitors can tap to speed up the wheel while it's spinning with supersonic wind gust effects and real-time randomized outcomes for maximum excitement!
* 🔤 **9+ Google Fonts Typography Engine:** Match your site's exact branding with modern fonts like *Poppins, Inter, Outfit, Montserrat, Roboto, Playfair Display, Cinzel, Orbitron, and Comic Neue*.
* 🎨 **4 Luxury Pre-Built Color Themes:** Royal Gold Luxury, Dark Nebula Glow, Cyberpunk Emerald Neon, and Clean Light Modern.
* 🌍 **16-Language Localization with 100% Text Overrides:** Full native translation for 16 major languages with the power to customize all 36 text labels independently.
* 🎟️ **Instant 1200x700 HD Digital Voucher Generator:** Winners can download a high-definition, official branded voucher card with their coupon code in 1-click.
* 👥 **Integrated CRM & Lead Management:** View captured leads (Name, Email, Phone, Won Prize, Date) in real time with custom follow-up notes and 1-click CSV export.
* 🛡️ **Smart Anti-Cheat Daily Limits:** Restrict spins per visitor (1 spin per calendar day) to prevent abuse and protect your coupon profit margins.
* 📱 **100% Responsive & Ultra-Fast:** Flawlessly optimized for mobile phones, tablets, and desktop screens with zero impact on site load speeds.
```

---

## 3. 🧩 Technical Architecture & Extensions

The application is built on the modern **Wix CLI / Wix Astro SSR Full-Stack Architecture** utilizing native Web Components (Shadow DOM) and Wix Data collections.

### Extension Matrix:

| Extension Type | Extension ID | Name & Tag Name | Purpose / Function |
| :--- | :--- | :--- | :--- |
| **Custom Element (Widget)** | `1153cd24-3a2a-4e87-9bdb-11d126031134` | `wheel-of-fortune-widget` | The native client-facing wheel widget rendered directly on site pages. Contains Canvas physics, Confetti Cannon, Turbo Boost, Form validation, and Voucher generation. |
| **Custom Element Settings Panel** | Embedded in widget | `wheel-of-fortune-widget.panel.tsx` | Wix Studio live inspector panel for quick in-editor adjustments. |
| **Dashboard Page** | `9fbbff26-f6fa-4390-b9db-21069222d2b9` | `wheel` (Wheel of Fortune Dashboard) | Full-screen merchant control center with 5 tabs: Analytics, Slices Manager, CRM Leads, Visual Theme & Fonts, and 16-Language Custom Texts. |
| **Data Collections** | `9469cd73-482b-49c4-92c7-d51b425c5d78` | `Wheel of Fortune Data` | Database schema for storing merchant configuration and captured visitor leads. |

---

## 4. 🗄️ Database Collections Schema (Wix Data)

### Collection 1: `WheelAppSettings` (Per-Site Merchant Configuration)
* **ID Suffix:** `WheelAppSettings`
* **Display Name:** `Wheel of Fortune — Settings`
* **Primary Key Index:** `siteId` (Unique)
* **Fields:**
  * `siteId` (TEXT): Site identification key.
  * `isActive` (BOOLEAN): Master toggle to enable/pause widget on live site.
  * `colorTheme` (TEXT): Selected theme (`gold`, `dark`, `neon`, `light`).
  * `fontFamily` (TEXT): Selected Google Font (`Poppins`, `Inter`, `Outfit`, `Montserrat`, etc.).
  * `defaultLang` (TEXT): Default display language (e.g. `en`, `tr`, `de`).
  * `dailyLimit` (NUMBER): Max spins allowed per visitor per calendar day (default `1`).
  * `rewardPool` (TEXT / JSON): Unlimited prize slices array with `id`, `label`, `code`, `color`, `textColor`, `probability`, `isWinner`, `isActive`.
  * `customTextsJSON` (TEXT / JSON): Overridden translation strings for each language.
  * `updatedAt` (DATE): Timestamp of last dashboard save.

### Collection 2: `WheelWinners` (Captured CRM Leads)
* **ID Suffix:** `WheelWinners`
* **Display Name:** `Wheel of Fortune — Leads`
* **Fields:**
  * `firstName` (TEXT): Visitor first name.
  * `lastName` (TEXT): Visitor last name.
  * `email` (TEXT): Visitor email (Primary display field).
  * `phone` (TEXT): Visitor phone number.
  * `rewardCode` (TEXT): Generated / awarded coupon code.
  * `prizeLabel` (TEXT): Name of won prize.
  * `isWinner` (BOOLEAN): True if winning slice, False if "Try Again".
  * `language` (TEXT): Visitor's language code during spin.
  * `status` (TEXT): Lead workflow status (`new`, `contacted`, `converted`, `lost`).
  * `notes` (TEXT): Merchant follow-up CRM notes.
  * `spunAt` (DATE): Exact timestamp when spin occurred.
  * `marketingConsent` (BOOLEAN): Privacy & marketing consent confirmation.
  * `siteId` (TEXT): Site identification.

---

## 5. 🔐 OAuth Permissions & Scopes Required

When configuring the app in **Wix Developers Center > Permissions**, enable the following scopes:

1. **Wix Data (CMS):**
   * `Manage Data Collections` (`wix.data.read`, `wix.data.write`) — Required to store app settings and leads in Wix Data collections.
2. **Wix Contacts & CRM:**
   * `Manage Contacts` (`wix.contacts.read`, `wix.contacts.write`) — Required to sync spinning visitors to the site's Wix CRM contact list.
3. **Wix Stores / Coupons (Optional / Recommended):**
   * `Manage Coupons` (`wix.coupons.read`, `wix.coupons.write`) — Allows automatic validation and creation of discount coupons in Wix Stores.
4. **Site Properties:**
   * `Read Site Properties` (`wix.site.read`) — To identify site language, currency, and domain.

---

## 6. 💰 Pricing & Monetization Plans (Wix Billing)

### Suggested Pricing Model: Freemium with 14-Day Free Trial

| Plan Name | Price | Features Included | Target User |
| :--- | :--- | :--- | :--- |
| **Free / Starter** | **$0 / month** | 1 Active Wheel, Up to 6 Prize Slices, 50 Leads/month, Standard Gold Theme, English & Turkish languages, 1 Spin/day limit. | New websites & small stores testing gamification. |
| **Pro / Growth (Recommended)** | **$6.99 / month** (or $59/year) | **Unlimited Prize Slices**, Full 16-Language Support with 100% custom text overrides, All 4 Luxury Themes, All 9+ Typography Fonts, Turbo Boost Re-Acceleration, **Unlimited Leads**, CSV Export, 1200x700 HD Voucher Download. | E-commerce stores, growing brands, agencies. |
| **Business VIP** | **$14.99 / month** (or $129/year) | Everything in Pro + Priority 24/7 VIP Support, Multi-Wheel Campaigns, Custom Webhook Integrations (Klaviyo/Mailchimp sync), Advanced Probability Weighting, Zero Wix Branding. | High-volume stores and enterprise merchants. |

---

## 7. 📸 Media Assets & Screenshot Guidelines (Wix App Market)

1. **App Icon (1024x1024 px PNG):**
   * High-contrast golden lucky wheel with 3D star center and sparkling neon rim on a dark navy/purple background.
2. **App Market Cover Banner (1920x1080 px):**
   * Headline: *"Turn Traffic into Sales with Wheel of Fortune"*
   * Subhead: *"Gamified Lead Capture & High-Converting Coupon Popups"*
3. **Screenshots (Minimum 4, 1920x1080 px):**
   * **Screenshot 1:** *Live Spinning Wheel with Turbo Boost & Confetti Cannon* (Highlighting gameplay and visual wow-factor).
   * **Screenshot 2:** *Merchant Dashboard: Slices Manager & Probability Distribution* (Highlighting unlimited slices & color pickers).
   * **Screenshot 3:** *16-Language Localization & Google Fonts Selector* (Highlighting global reach & custom typography).
   * **Screenshot 4:** *CRM Leads Table & Instant CSV Export* (Highlighting collected customer data & follow-up notes).
   * **Screenshot 5:** *Official HD 1200x700 Digital Voucher Download* (Highlighting branded reward delivery).

---

## 8. 📜 Privacy Policy, Terms of Service & Security Justifications

* **Privacy Policy URL:** `https://your-domain.com/privacy-policy` (or embedded in app documentation)
* **Terms of Service URL:** `https://your-domain.com/terms`
* **GDPR / CCPA Compliance:**
  * The widget enforces mandatory explicit consent checkboxes for Privacy Policy and Marketing Communications before any form submission.
  * Lead data is strictly stored within the merchant's dedicated Wix Data collections (`WheelWinners`) and is never sold or shared with 3rd parties.
  * Right to erasure (RTBF) and data export are fully supported via the CRM dashboard and Wix Data API.

---

## 9. 🚀 Wix Developers Center Step-by-Step Submission Checklist for Gemini Pro

When Gemini Pro assists you in the **Wix Developers Center** (https://dev.wix.com/), use the following step-by-step instructions:

1. **Step 1 — Basic Info:**
   * Enter App Name: `Wheel of Fortune — Spin & Win Discount Wheel`
   * Enter Category: `Marketing & Promotion > Gamification & Coupons`
   * Upload the 1024x1024 App Icon.
2. **Step 2 — Extensions Verification:**
   * Verify that the Custom Element extension `wheel-of-fortune-widget` (`1153cd24-3a2a-4e87-9bdb-11d126031134`) is registered.
   * Verify that the Dashboard Page extension `wheel` (`9fbbff26-f6fa-4390-b9db-21069222d2b9`) is registered.
   * Verify that Data Collections `WheelAppSettings` and `WheelWinners` are present.
3. **Step 3 — OAuth & Permissions:**
   * Enable `wix.data.read`, `wix.data.write`, `wix.contacts.read`, `wix.contacts.write`.
4. **Step 4 — App Market Listing Copy:**
   * Copy & paste the Short, Medium, and Full Markdown descriptions provided in Section 2 above.
   * Add search keywords: `wheel of fortune`, `spin to win`, `lucky wheel`, `coupon popup`, `gamification`, `lead capture`, `discount wheel`, `email capture`, `interactive wheel`.
5. **Step 5 — Pricing & Plans:**
   * Create the **Free Plan** and **Pro Plan ($6.99/mo with 14-day free trial)** as described in Section 6.
6. **Step 6 — Review & Submit:**
   * Run `npm run build` and `wix release` in terminal.
   * Click **"Submit for Review"** in the Wix Dev Center.
