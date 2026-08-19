const fs = require("fs");
const path = require("path");

const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
let code = fs.readFileSync(widgetJsPath, "utf8");

// Add constructor state
code = code.replace(
  "this.confettiParticles = [];",
  "this.confettiParticles = [];\n    this.boostCount = 0;\n    this.currentVelocity = 0;\n    this.isCoastingToStop = false;\n    this.spinAnimId = null;"
);

// Add CSS keyframes and boost styles
const boostCss = `
        .spinning-boostable {
          cursor: pointer !important;
          animation: boostPulse 0.7s infinite alternate ease-in-out !important;
          box-shadow: 0 0 25px #fbbf24, 0 0 50px rgba(245, 158, 11, 0.6) !important;
        }
        @keyframes boostPulse {
          0% { transform: scale(1); filter: brightness(1); }
          100% { transform: scale(1.06); filter: brightness(1.3); }
        }
        .boost-flash {
          animation: textFlash 0.3s ease-out !important;
        }
        @keyframes textFlash {
          0% { transform: scale(1.3); color: #fef08a; }
          100% { transform: scale(1); color: inherit; }
        }
`;

code = code.replace(".wof-container {", boostCss + "\n        .wof-container {");

// Replace triggerSpin, animateSpin, and add applyBoost + pickTargetOutcome
const oldSpinBlock = `  async triggerSpin() {
    if (this.isSpinning) return;
    const usage = this.getUsageData();
    if (usage.count >= this.dailyLimit) {
      this.checkDailyLimit();
      return;
    }

    this.isSpinning = true;
    this.setControlsDisabled(true);

    const locale = I18N[this.widgetLang] || I18N.en;
    const spinTextEl = this.shadow.querySelector("#spin-btn-text");
    if (spinTextEl) spinTextEl.textContent = locale.spinning;

    try {
      // Local Anti-Cheat calculation
      const pool = this.prizes.length >= 2 ? this.prizes : DEFAULT_PRIZES;
      const totalWeight = pool.reduce((sum, p) => sum + Math.max(1, p.probability || 10), 0);
      let rand = Math.random() * totalWeight;
      let selectedIdx = 0;

      for (let i = 0; i < pool.length; i++) {
        const w = Math.max(1, pool[i].probability || 10);
        if (rand <= w) {
          selectedIdx = i;
          break;
        }
        rand -= w;
      }

      const selPrize = pool[selectedIdx];
      const totalSegments = pool.length;
      const segmentAngle = 360 / totalSegments;
      const jitter = (Math.random() - 0.5) * (segmentAngle * 0.7);
      const targetSliceAngle = (selectedIdx + 0.5) * segmentAngle + jitter;
      const normalizedStopAngle = (270 - targetSliceAngle + 720) % 360;
      const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360;
      const finalTargetAngle = fullSpins + normalizedStopAngle;

      this.wonPrize = selPrize;

      await this.animateSpin(finalTargetAngle, 4800);

      this.spawnConfetti();
      this.showPrizeOutcome();
      this.saveUsage(selPrize.code, selPrize.label);

      window.dispatchEvent(
        new CustomEvent("onSpinComplete", {
          bubbles: true,
          composed: true,
          detail: {
            prizeId: selPrize.id,
            label: selPrize.label,
            code: selPrize.code,
            isWinner: selPrize.isWinner,
          },
        })
      );
    } catch (err) {
      console.error("[WheelOfFortune] Spin error:", err);
      this.isSpinning = false;
      this.setControlsDisabled(false);
      if (spinTextEl) spinTextEl.textContent = this.valOr("spinBtn", locale.spinBtn);
    }
  }

  animateSpin(targetAngle, durationMs) {
    return new Promise((resolve) => {
      const startAngle = this.currentRotation % 360;
      const totalDelta = targetAngle - startAngle;
      const startTime = performance.now();
      const pointer = this.shadow.querySelector("#pointer-arrow");

      const totalSegments = this.prizes.length;
      const degPerSegment = 360 / totalSegments;
      let lastSliceIndex = -1;

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 1 - Math.pow(1 - progress, 3.5);
        this.currentRotation = startAngle + totalDelta * ease;

        const currentSliceIndex = Math.floor((this.currentRotation % 360) / degPerSegment);
        if (currentSliceIndex !== lastSliceIndex) {
          lastSliceIndex = currentSliceIndex;
          if (pointer) {
            pointer.classList.add("ticking");
            setTimeout(() => pointer.classList.remove("ticking"), 50);
          }
          this.bulbBlinkPhase = (this.bulbBlinkPhase + 1) % 2;
        }

        this.drawWheel();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          this.currentRotation = targetAngle % 360;
          this.drawWheel();
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }`;

const newSpinBlock = `  pickTargetOutcome() {
    const pool = this.prizes.length >= 2 ? this.prizes : DEFAULT_PRIZES;
    const totalWeight = pool.reduce((sum, p) => sum + Math.max(1, p.probability || 10), 0);
    let rand = Math.random() * totalWeight;
    let selectedIdx = 0;

    for (let i = 0; i < pool.length; i++) {
      const w = Math.max(1, pool[i].probability || 10);
      if (rand <= w) {
        selectedIdx = i;
        break;
      }
      rand -= w;
    }

    const selPrize = pool[selectedIdx];
    const totalSegments = pool.length;
    const segmentAngle = 360 / totalSegments;
    const jitter = (Math.random() - 0.5) * (segmentAngle * 0.65);
    const targetSliceAngle = (selectedIdx + 0.5) * segmentAngle + jitter;
    const normalizedStopAngle = (270 - targetSliceAngle + 720) % 360;

    this.wonPrize = selPrize;
    this.finalTargetAngle = normalizedStopAngle;
    return selPrize;
  }

  applyBoost() {
    if (!this.isSpinning || this.isCoastingToStop) return;

    this.boostCount = (this.boostCount || 0) + 1;
    this.currentVelocity = Math.min(52, (this.currentVelocity || 22) + 18);
    this.minSpinTime = performance.now() + 2400; // extend spin time on boost

    // Recalculate target outcome dynamically so every boost changes the final winning slice!
    this.pickTargetOutcome();

    const spinTextEl = this.shadow.querySelector("#spin-btn-text");
    const centerBtn = this.shadow.querySelector("#center-spin-btn");
    const boostLabels = ["⚡ BOOST!", "🚀 TURBO SPEED!", "💥 MEGA BOOST!", "🔥 MAXIMUM VELOCITY!"];
    const boostText = boostLabels[Math.min(this.boostCount - 1, boostLabels.length - 1)];

    if (spinTextEl) {
      spinTextEl.textContent = boostText + " (x" + this.boostCount + ")";
      spinTextEl.classList.add("boost-flash");
      setTimeout(() => spinTextEl.classList.remove("boost-flash"), 350);
    }
    if (centerBtn) {
      centerBtn.textContent = "⚡ x" + this.boostCount;
    }

    this.spawnBoostSparkles();

    window.dispatchEvent(
      new CustomEvent("onSpinBoost", {
        bubbles: true,
        composed: true,
        detail: { boostCount: this.boostCount, velocity: this.currentVelocity },
      })
    );
  }

  spawnBoostSparkles() {
    const colors = ["#fef08a", "#fbbf24", "#60a5fa", "#34d399", "#f43f5e"];
    for (let i = 0; i < 20; i++) {
      this.confettiParticles.push({
        x: 360 + (Math.random() - 0.5) * 80,
        y: 360 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 0.9,
      });
    }
  }

  async triggerSpin() {
    if (this.isSpinning) {
      // ⚡ TURBO RE-ACCELERATE / BOOST!
      this.applyBoost();
      return;
    }

    const usage = this.getUsageData();
    if (usage.count >= this.dailyLimit) {
      this.checkDailyLimit();
      return;
    }

    this.isSpinning = true;
    this.boostCount = 0;
    this.setControlsDisabled(true);

    const spinTextEl = this.shadow.querySelector("#spin-btn-text");
    const centerBtn = this.shadow.querySelector("#center-spin-btn");
    if (spinTextEl) spinTextEl.textContent = "⚡ TAP TO BOOST!";
    if (centerBtn) centerBtn.textContent = "⚡ BOOST";

    try {
      this.pickTargetOutcome();
      await this.animatePhysicsSpin();

      this.spawnConfetti();
      this.showPrizeOutcome();
      this.saveUsage(this.wonPrize.code, this.wonPrize.label);

      window.dispatchEvent(
        new CustomEvent("onSpinComplete", {
          bubbles: true,
          composed: true,
          detail: {
            prizeId: this.wonPrize.id,
            label: this.wonPrize.label,
            code: this.wonPrize.code,
            isWinner: this.wonPrize.isWinner,
            boostCount: this.boostCount,
          },
        })
      );
    } catch (err) {
      console.error("[WheelOfFortune] Spin error:", err);
      this.isSpinning = false;
      this.setControlsDisabled(false);
      const locale = I18N[this.widgetLang] || I18N.en;
      if (spinTextEl) spinTextEl.textContent = this.valOr("spinBtn", locale.spinBtn);
    }
  }

  animatePhysicsSpin() {
    return new Promise((resolve) => {
      const pointer = this.shadow.querySelector("#pointer-arrow");
      const totalSegments = this.prizes.length >= 2 ? this.prizes.length : 6;
      const degPerSegment = 360 / totalSegments;
      let lastSliceIndex = -1;

      let lastTime = performance.now();
      this.currentVelocity = 28 + Math.random() * 6; // Initial velocity deg/frame
      this.isCoastingToStop = false;
      this.minSpinTime = performance.now() + 3200; // Spin at least 3.2s before deceleration

      const tick = (now) => {
        const dt = Math.min((now - lastTime) / 16.66, 2.5);
        lastTime = now;

        // Apply smooth air resistance friction if past minSpinTime
        if (now > this.minSpinTime) {
          this.currentVelocity *= Math.pow(0.984, dt);
        }

        // Advance rotation
        this.currentRotation = (this.currentRotation + this.currentVelocity * dt) % 360;

        // LED blinking & pointer ticking
        const currentSliceIndex = Math.floor(this.currentRotation / degPerSegment);
        if (currentSliceIndex !== lastSliceIndex) {
          lastSliceIndex = currentSliceIndex;
          if (pointer) {
            pointer.classList.add("ticking");
            setTimeout(() => pointer.classList.remove("ticking"), 40);
          }
          this.bulbBlinkPhase = (this.bulbBlinkPhase + 1) % 2;
        }

        this.drawWheel();

        // When speed drops below threshold, smoothly coast and lock to target angle
        if (now > this.minSpinTime && this.currentVelocity < 1.4) {
          this.isCoastingToStop = true;
          this.coastToTarget(this.finalTargetAngle).then(resolve);
        } else {
          this.spinAnimId = requestAnimationFrame(tick);
        }
      };

      this.spinAnimId = requestAnimationFrame(tick);
    });
  }

  coastToTarget(targetAngle) {
    return new Promise((resolve) => {
      const startAngle = this.currentRotation;
      let delta = (targetAngle - (startAngle % 360) + 720) % 360;
      if (delta < 120) delta += 360;
      const finalAngle = startAngle + delta;

      const duration = 1600;
      const startTime = performance.now();
      const pointer = this.shadow.querySelector("#pointer-arrow");
      const totalSegments = this.prizes.length >= 2 ? this.prizes.length : 6;
      const degPerSegment = 360 / totalSegments;
      let lastSliceIndex = -1;

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3.4);
        this.currentRotation = startAngle + delta * ease;

        const currentSliceIndex = Math.floor((this.currentRotation % 360) / degPerSegment);
        if (currentSliceIndex !== lastSliceIndex) {
          lastSliceIndex = currentSliceIndex;
          if (pointer) {
            pointer.classList.add("ticking");
            setTimeout(() => pointer.classList.remove("ticking"), 50);
          }
          this.bulbBlinkPhase = (this.bulbBlinkPhase + 1) % 2;
        }

        this.drawWheel();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          this.currentRotation = targetAngle % 360;
          this.drawWheel();
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }`;

code = code.replace(oldSpinBlock, newSpinBlock);

// Update setControlsDisabled so buttons remain clickable for BOOST
const oldControls = `  setControlsDisabled(disabled) {
    const centerBtn = this.shadow.querySelector("#center-spin-btn");
    const bottomBtn = this.shadow.querySelector("#bottom-spin-btn");
    if (centerBtn) centerBtn.disabled = disabled;
    if (bottomBtn) bottomBtn.disabled = disabled;
  }`;

const newControls = `  setControlsDisabled(disabled) {
    const centerBtn = this.shadow.querySelector("#center-spin-btn");
    const bottomBtn = this.shadow.querySelector("#bottom-spin-btn");
    if (disabled) {
      if (centerBtn) {
        centerBtn.classList.add("spinning-boostable");
        centerBtn.disabled = false;
      }
      if (bottomBtn) {
        bottomBtn.classList.add("spinning-boostable");
        bottomBtn.disabled = false;
      }
    } else {
      if (centerBtn) {
        centerBtn.classList.remove("spinning-boostable");
        centerBtn.disabled = false;
      }
      if (bottomBtn) {
        bottomBtn.classList.remove("spinning-boostable");
        bottomBtn.disabled = false;
      }
    }
  }`;

code = code.replace(oldControls, newControls);

fs.writeFileSync(widgetJsPath, code);

// Also sync to widget-standalone.html
const standalonePath = path.join(__dirname, "../public/widget-standalone.html");
let standaloneHtml = fs.readFileSync(standalonePath, "utf8");
standaloneHtml = standaloneHtml.replace(/<script>[\s\S]*?<\/script>/, `<script>\n${code}\n</script>`);
fs.writeFileSync(standalonePath, standaloneHtml);

console.log("SUCCESS: Applied Turbo Boost Re-Acceleration to wheel-widget.js & widget-standalone.html!");
