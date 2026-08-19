const fs = require("fs");
const path = require("path");

const widgetTsxPath = path.join(__dirname, "../src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx");
let code = fs.readFileSync(widgetTsxPath, "utf8");

// Add properties
code = code.replace(
  "  private confettiParticles: ConfettiParticle[] = [];",
  "  private confettiParticles: ConfettiParticle[] = [];\n  private boostCount = 0;\n  private currentVelocity = 0;\n  private isCoastingToStop = false;\n  private finalTargetAngle = 0;\n  private minSpinTime = 0;\n  private spinAnimId: number | null = null;"
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

// Add pickTargetOutcome, applyBoost, spawnBoostSparkles, animatePhysicsSpin, coastToTarget
const oldSpinMethods = `  private async triggerSpin(): Promise<void> {
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
      // 1. Draw Outcome from Backend
      const outcome = await calculatePrizeOutcome(this.prizes, this.widgetLang);
      const selPrize = this.prizes.find((p) => p.id === outcome.prizeId) || this.prizes[0];
      const targetIndex = this.prizes.findIndex((p) => p.id === outcome.prizeId);

      // 2. Compute Precision Stop Angle (Pointer at top = 270 deg)
      const totalSegments = this.prizes.length;
      const segmentAngle = 360 / totalSegments;
      const targetSliceAngle = (targetIndex + 0.5) * segmentAngle + outcome.angleOffset;
      const normalizedStopAngle = (270 - targetSliceAngle + 720) % 360;
      const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360;
      const finalTargetAngle = fullSpins + normalizedStopAngle;

      this.wonPrize = selPrize;

      // 3. Animate Smooth Physics Spin
      await this.animateSpin(finalTargetAngle, 4800);

      // 4. Reveal Prize Outcome
      this.spawnConfetti();
      this.showPrizeOutcome();
      this.saveUsage(selPrize.code, selPrize.label);

      // 5. Fire Wix Event
      this.dispatchEvent(
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

  // ─── Spin Physics Animation ─────────────────────────────────────────────────
  private animateSpin(targetAngle: number, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const startAngle = this.currentRotation % 360;
      const totalDelta = targetAngle - startAngle;
      const startTime = performance.now();
      const pointer = this.shadow.querySelector("#pointer-arrow");

      const totalSegments = this.prizes.length;
      const degPerSegment = 360 / totalSegments;
      let lastSliceIndex = -1;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 1 - Math.pow(1 - progress, 3.5); // Custom cubic ease-out
        this.currentRotation = startAngle + totalDelta * ease;

        // Pointer Ticking Effect
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

const newSpinMethods = `  private pickTargetOutcome(): PrizeSegment {
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

  private applyBoost(): void {
    if (!this.isSpinning || this.isCoastingToStop) return;

    this.boostCount = (this.boostCount || 0) + 1;
    this.currentVelocity = Math.min(52, (this.currentVelocity || 22) + 18);
    this.minSpinTime = performance.now() + 2400; // Extend duration on boost

    // Recalculate target outcome dynamically so every boost changes the final prize!
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

    this.dispatchEvent(
      new CustomEvent("onSpinBoost", {
        bubbles: true,
        composed: true,
        detail: { boostCount: this.boostCount, velocity: this.currentVelocity },
      })
    );
  }

  private spawnBoostSparkles(): void {
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

  private async triggerSpin(): Promise<void> {
    if (this.isSpinning) {
      // ⚡ RE-ACCELERATION / TURBO BOOST!
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
      if (this.wonPrize) this.saveUsage(this.wonPrize.code, this.wonPrize.label);

      this.dispatchEvent(
        new CustomEvent("onSpinComplete", {
          bubbles: true,
          composed: true,
          detail: {
            prizeId: this.wonPrize?.id,
            label: this.wonPrize?.label,
            code: this.wonPrize?.code,
            isWinner: this.wonPrize?.isWinner,
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

  private animatePhysicsSpin(): Promise<void> {
    return new Promise((resolve) => {
      const pointer = this.shadow.querySelector("#pointer-arrow");
      const totalSegments = this.prizes.length >= 2 ? this.prizes.length : 6;
      const degPerSegment = 360 / totalSegments;
      let lastSliceIndex = -1;

      let lastTime = performance.now();
      this.currentVelocity = 28 + Math.random() * 6;
      this.isCoastingToStop = false;
      this.minSpinTime = performance.now() + 3200;

      const tick = (now: number) => {
        const dt = Math.min((now - lastTime) / 16.66, 2.5);
        lastTime = now;

        if (now > this.minSpinTime) {
          this.currentVelocity *= Math.pow(0.984, dt);
        }

        this.currentRotation = (this.currentRotation + this.currentVelocity * dt) % 360;

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

  private coastToTarget(targetAngle: number): Promise<void> {
    return new Promise((resolve) => {
      const startAngle = this.currentRotation;
      let delta = (targetAngle - (startAngle % 360) + 720) % 360;
      if (delta < 120) delta += 360;

      const duration = 1600;
      const startTime = performance.now();
      const pointer = this.shadow.querySelector("#pointer-arrow");
      const totalSegments = this.prizes.length >= 2 ? this.prizes.length : 6;
      const degPerSegment = 360 / totalSegments;
      let lastSliceIndex = -1;

      const step = (now: number) => {
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

code = code.replace(oldSpinMethods, newSpinMethods);

// Update setControlsDisabled
const oldControls = `  private setControlsDisabled(disabled: boolean): void {
    const centerBtn = this.shadow.querySelector<HTMLButtonElement>("#center-spin-btn");
    const bottomBtn = this.shadow.querySelector<HTMLButtonElement>("#bottom-spin-btn");
    if (centerBtn) centerBtn.disabled = disabled;
    if (bottomBtn) bottomBtn.disabled = disabled;
  }`;

const newControls = `  private setControlsDisabled(disabled: boolean): void {
    const centerBtn = this.shadow.querySelector<HTMLButtonElement>("#center-spin-btn");
    const bottomBtn = this.shadow.querySelector<HTMLButtonElement>("#bottom-spin-btn");
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

fs.writeFileSync(widgetTsxPath, code);
console.log("SUCCESS: Applied Turbo Boost Re-Acceleration to wheel-of-fortune-widget.tsx!");
