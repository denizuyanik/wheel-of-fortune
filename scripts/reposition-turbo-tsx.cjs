const fs = require("fs");
const path = require("path");

const widgetTsxPath = path.join(__dirname, "../src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx");
let code = fs.readFileSync(widgetTsxPath, "utf8");

// Remove center hub spinning-boostable animation styles
code = code.replace(/<button type="button" class="center-hub-btn" id="center-spin-btn">[\s\S]*?<\/button>/, `<button type="button" class="center-hub-btn" id="center-spin-btn">SPIN</button>`);

// Update stage HTML with stage container and side turbo button
const oldStageHtml = `<div class="wheel-stage">
          <div class="pointer-arrow" id="pointer-arrow">
            <svg viewBox="0 0 24 30">
              <path d="M12 30 L2 6 A 10 10 0 0 1 22 6 Z" />
              <circle cx="12" cy="8" r="3.5" fill="#ffffff" />
            </svg>
          </div>
          <canvas class="wheel-canvas" id="wheel-canvas" width="720" height="720"></canvas>
          <button type="button" class="center-hub-btn" id="center-spin-btn">SPIN</button>
        </div>`;

const newStageHtml = `<div class="wheel-stage-container">
          <div class="wheel-stage">
            <div class="pointer-arrow" id="pointer-arrow">
              <svg viewBox="0 0 24 30">
                <path d="M12 30 L2 6 A 10 10 0 0 1 22 6 Z" />
                <circle cx="12" cy="8" r="3.5" fill="#ffffff" />
              </svg>
            </div>
            <canvas class="wheel-canvas" id="wheel-canvas" width="720" height="720"></canvas>
            <button type="button" class="center-hub-btn" id="center-spin-btn">SPIN</button>
          </div>

          <!-- Side Dedicated Turbo Boost Button (Does not cover the wheel) -->
          <div class="turbo-side-pod" id="turbo-side-pod">
            <button type="button" class="turbo-boost-btn" id="turbo-boost-btn" title="Click while spinning to speed up!">
              <span style="font-size:18px;">⚡</span>
              <span>TURBO</span>
              <span class="turbo-badge" id="turbo-counter">x0</span>
            </button>
          </div>
        </div>`;

code = code.replace(oldStageHtml, newStageHtml);

// Add CSS for .wheel-stage-container, .turbo-side-pod, .turbo-boost-btn, .turbo-badge
const sideTurboCss = `
        .wheel-stage-container {
          position: relative;
          max-width: 540px;
          margin: 0 auto 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .turbo-side-pod {
          position: absolute;
          right: -10px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 15;
        }
        @media (max-width: 580px) {
          .turbo-side-pod {
            position: static;
            transform: none;
            margin: 12px auto 0 auto;
          }
          .wheel-stage-container {
            flex-direction: column;
          }
        }

        .turbo-boost-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
          border: 2px solid #fef08a;
          border-radius: 999px;
          padding: 10px 18px;
          color: #0f172a;
          font-weight: 900;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8);
          transition: transform 0.12s ease-out, box-shadow 0.15s;
          user-select: none;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .turbo-boost-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 28px rgba(245, 158, 11, 0.6), inset 0 2px 4px #fff;
        }
        .turbo-boost-btn:active {
          transform: scale(0.94);
        }
        .turbo-boost-btn.spinning-active {
          animation: turboPulse 0.6s infinite alternate ease-in-out;
          box-shadow: 0 0 25px #fbbf24, 0 0 45px rgba(245, 158, 11, 0.8), inset 0 1px 3px #fff !important;
        }
        @keyframes turboPulse {
          0% { transform: scale(1); filter: brightness(1); }
          100% { transform: scale(1.12); filter: brightness(1.4); }
        }

        .turbo-badge {
          background: #0f172a;
          color: #fbbf24;
          font-size: 11px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid #fbbf24;
        }
`;

code = code.replace(".wof-container {", sideTurboCss + "\n        .wof-container {");

// Update applyBoost and triggerSpin in tsx
code = code.replace(
  `const centerBtn = this.shadow.querySelector<HTMLButtonElement>("#center-spin-btn");\n    const boostLabels`,
  `const turboBtn = this.shadow.querySelector<HTMLButtonElement>("#turbo-boost-btn");\n    const turboCounter = this.shadow.querySelector("#turbo-counter");\n    const boostLabels`
);

code = code.replace(
  `if (centerBtn) {\n      centerBtn.textContent = "⚡ x" + this.boostCount;\n    }`,
  `if (turboCounter) {\n      turboCounter.textContent = "x" + this.boostCount;\n    }\n    if (turboBtn) {\n      turboBtn.classList.add("spinning-active");\n    }`
);

// Update event listeners in setupEventListeners
code = code.replace(
  `if (bottomBtn) bottomBtn.onclick = () => this.triggerSpin();`,
  `if (bottomBtn) bottomBtn.onclick = () => this.triggerSpin();\n    const turboBtn = this.shadow.querySelector<HTMLButtonElement>("#turbo-boost-btn");\n    if (turboBtn) turboBtn.onclick = () => this.applyBoost();`
);

// Reset turbo state on spin start & stop
code = code.replace(
  `if (spinTextEl) spinTextEl.textContent = "⚡ TAP TO BOOST!";\n    if (centerBtn) centerBtn.textContent = "⚡ BOOST";`,
  `if (spinTextEl) spinTextEl.textContent = "⚡ SPINNING...";\n    const turboBtn = this.shadow.querySelector<HTMLButtonElement>("#turbo-boost-btn");\n    const turboCounter = this.shadow.querySelector("#turbo-counter");\n    if (turboBtn) turboBtn.classList.add("spinning-active");\n    if (turboCounter) turboCounter.textContent = "x0";`
);

code = code.replace(
  `if (this.wonPrize) this.saveUsage(this.wonPrize.code, this.wonPrize.label);`,
  `if (this.wonPrize) this.saveUsage(this.wonPrize.code, this.wonPrize.label);\n      const turboBtn = this.shadow.querySelector<HTMLButtonElement>("#turbo-boost-btn");\n      if (turboBtn) turboBtn.classList.remove("spinning-active");`
);

fs.writeFileSync(widgetTsxPath, code);
console.log("SUCCESS: Repositioned Turbo Boost button in wheel-of-fortune-widget.tsx!");
