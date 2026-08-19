const fs = require("fs");
const path = require("path");

const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
const widgetTsxPath = path.join(__dirname, "../src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx");

const widgetJsCode = fs.readFileSync(widgetJsPath, "utf8");

// Convert pure JS custom element to TypeScript extension widget while preserving the exact working engine
const tsxHeader = `/**
 * Wheel of Fortune (Çarkıfelek) Custom Element — Production Wix App Extension v1.0.0
 * ===================================================================================
 * Native Web Component (Custom Element with Shadow DOM).
 * HTML5 Canvas Physics Engine, Confetti Particle Cannon, Supersonic Wind Vortex,
 * 16-Language i18n, 1200x700 HD Digital Voucher Generator, 100% Synchronous Download,
 * Anti-Cheat Local & Server Integration, and Two-Way Wix Data CMS Sync.
 */

import { items } from "@wix/data";
import { calculatePrizeOutcome, submitLeadDetails } from "../../../../backend/rewardLogic.web";

export interface PrizeSegment {
  id: string;
  label: string;
  code: string;
  color: string;
  textColor?: string;
  probability: number;
  isWinner: boolean;
  isActive: boolean;
}

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  opacity: number;
}
`;

// Extract class body from widgetJsCode
const classMatch = widgetJsCode.match(/(const I18N = [\s\S]*?)if \(!customElements\.get\("wheel-of-fortune-widget"\)\) {/);

if (!classMatch) {
  console.error("Could not extract class definition from widgetJsCode!");
  process.exit(1);
}

let classBody = classMatch[1];

// Add TypeScript class exports and custom element definition
const fullTsxCode = tsxHeader + "\n" + classBody + `
if (!customElements.get("wheel-of-fortune-widget")) {
  customElements.define("wheel-of-fortune-widget", WheelOfFortuneElement);
}

export default WheelOfFortuneElement;
`;

fs.writeFileSync(widgetTsxPath, fullTsxCode);
console.log("SUCCESS: 100% Synchronized wheel-of-fortune-widget.tsx with latest wheel-widget.js engine!");
