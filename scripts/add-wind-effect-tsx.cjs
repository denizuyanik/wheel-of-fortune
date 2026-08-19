const fs = require("fs");
const path = require("path");

const widgetTsxPath = path.join(__dirname, "../src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx");
let code = fs.readFileSync(widgetTsxPath, "utf8");

// 1. Add windParticles to interface / class
code = code.replace(
  "  private confettiParticles: ConfettiParticle[] = [];",
  "  private confettiParticles: ConfettiParticle[] = [];\n  private windParticles: any[] = [];"
);

// 2. Add Wind Shockwave CSS
const windCss = `
        .wof-container.wind-gust-active {
          animation: windShockwave 0.35s ease-out;
        }
        @keyframes windShockwave {
          0% { transform: scale(1); filter: brightness(1); }
          40% { transform: scale(1.02); filter: brightness(1.2) drop-shadow(0 0 30px rgba(251, 191, 36, 0.7)); }
          100% { transform: scale(1); filter: brightness(1); }
        }

        .center-hub-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) !important;
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          user-select: none;
          outline: none;
        }
        .center-hub-btn:hover:not(:disabled) {
          transform: translate(-50%, -50%) scale(1.06) !important;
        }
        .center-hub-btn:active:not(:disabled) {
          transform: translate(-50%, -50%) scale(0.96) !important;
        }
`;

code = code.replace(".wof-container {", windCss + "\n        .wof-container {");
code = code.replace(/\.center-hub-btn\s*\{[\s\S]*?\.center-hub-btn:disabled\s*\{[\s\S]*?\}/, "");

// 3. Update drawWheel
const oldCenterDraw = `    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fill();
    ctx.restore();

    this.drawConfetti();`;

const newCenterDraw = `    ctx.restore();

    // 3. Draw 3D Metallic Gold Center Hub Directly on Canvas (Permanently Locked at Exact Center)
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 44, 0, Math.PI * 2);
    const centerGrad = ctx.createRadialGradient(center - 12, center - 12, 4, center, center, 44);
    centerGrad.addColorStop(0, "#fffbeb");
    centerGrad.addColorStop(0.3, "#fbbf24");
    centerGrad.addColorStop(0.8, "#d97706");
    centerGrad.addColorStop(1, "#78350f");
    ctx.fillStyle = centerGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Inner bevel ring
    ctx.beginPath();
    ctx.arc(center, center, 38, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center "SPIN" text
    ctx.fillStyle = "#1e1b4b";
    const fontFam = this.fontFamily || "Poppins";
    ctx.font = "900 15px '" + fontFam + "', -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.shadowBlur = 2;
    ctx.fillText("SPIN", center, center);
    ctx.restore();

    // Draw Dynamic Wind & Confetti
    this.drawWind();
    this.drawConfetti();`;

code = code.replace(oldCenterDraw, newCenterDraw);

// 4. Add spawnWindGust() and drawWind()
const windMethods = `  private spawnWindGust(): void {
    this.windParticles = this.windParticles || [];
    const container = this.shadow.querySelector("#widget-container");
    if (container) {
      container.classList.add("wind-gust-active");
      setTimeout(() => container.classList.remove("wind-gust-active"), 350);
    }

    // 1. Expanding Sonic Wind Rings
    this.windParticles.push({
      type: "ring",
      radius: 50,
      radialSpeed: 9 + Math.random() * 4,
      life: 0,
    });
    this.windParticles.push({
      type: "ring",
      radius: 70,
      radialSpeed: 12 + Math.random() * 5,
      life: 0.1,
    });

    // 2. High-speed Curved Wind Vortex Streaks around perimeter
    const colors = ["#ffffff", "#fef08a", "#38bdf8", "#fbbf24", "#bae6fd"];
    for (let i = 0; i < 28; i++) {
      this.windParticles.push({
        type: "arc",
        radius: 120 + Math.random() * 210,
        angle: Math.random() * Math.PI * 2,
        speed: 15 + Math.random() * 25,
        length: 0.3 + Math.random() * 0.8,
        width: 1.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 0.2,
      });
    }

    // 3. Dynamic Horizontal Gust Streaks
    for (let j = 0; j < 18; j++) {
      this.windParticles.push({
        type: "streak",
        x: Math.random() * 720,
        y: Math.random() * 720,
        vx: 18 + Math.random() * 22,
        vy: (Math.random() - 0.5) * 6,
        width: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 0.25,
      });
    }
  }

  private drawWind(): void {
    if (!this.windParticles || this.windParticles.length === 0) return;
    const ctx = this.ctx;
    if (!ctx) return;
    const size = this.canvas.width;
    const center = size / 2;

    ctx.save();
    for (let i = this.windParticles.length - 1; i >= 0; i--) {
      const wp = this.windParticles[i];
      wp.life += 0.04;
      const alpha = Math.max(0, 1 - wp.life);

      if (wp.type === "ring") {
        wp.radius += wp.radialSpeed;
        ctx.beginPath();
        ctx.arc(center, center, wp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(254, 240, 138, " + (alpha * 0.85) + ")";
        ctx.lineWidth = Math.max(1, 6 * (1 - wp.life));
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 10;
        ctx.stroke();
      } else if (wp.type === "arc") {
        wp.angle += wp.speed * 0.04;
        ctx.beginPath();
        ctx.arc(center, center, wp.radius, wp.angle, wp.angle + wp.length);
        ctx.strokeStyle = wp.color || ("rgba(255, 255, 255, " + (alpha * 0.9) + ")");
        ctx.lineWidth = wp.width * (1 - wp.life * 0.3);
        ctx.lineCap = "round";
        ctx.shadowColor = wp.color;
        ctx.shadowBlur = 6;
        ctx.stroke();
      } else if (wp.type === "streak") {
        wp.x += wp.vx;
        wp.y += wp.vy;
        ctx.beginPath();
        ctx.moveTo(wp.x, wp.y);
        ctx.lineTo(wp.x - wp.vx * 2.5, wp.y - wp.vy * 2.5);
        ctx.strokeStyle = wp.color || ("rgba(255, 255, 255, " + (alpha * 0.8) + ")");
        ctx.lineWidth = wp.width;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      if (wp.life >= 1) {
        this.windParticles.splice(i, 1);
      }
    }
    ctx.restore();
  }
`;

code = code.replace("  private applyBoost(): void {", windMethods + "\n  private applyBoost(): void {");

// 5. In applyBoost, call this.spawnWindGust()
code = code.replace(
  "this.spawnBoostSparkles();",
  "this.spawnBoostSparkles();\n    this.spawnWindGust();"
);

fs.writeFileSync(widgetTsxPath, code);
console.log("SUCCESS: Added Wind Gust Turbo Effect & Locked Canvas Center Hub in wheel-of-fortune-widget.tsx!");
