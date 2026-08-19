const fs = require("fs");
const path = require("path");

function getCompleteCss() {
  return `
        :host {
          display: block;
          width: 100%;
          box-sizing: border-box;
          --wof-font: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-family: var(--wof-font);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        .wof-container {
          position: relative;
          max-width: 680px;
          margin: 0 auto;
          background: var(--wof-bg);
          border-radius: 24px;
          padding: 32px 24px;
          color: var(--wof-text-primary);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15);
          overflow: hidden;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.2s ease-out;
        }

        .wof-container.wind-gust-active {
          animation: windShockwave 0.35s ease-out;
        }
        @keyframes windShockwave {
          0% { transform: scale(1); filter: brightness(1); }
          40% { transform: scale(1.02); filter: brightness(1.2) drop-shadow(0 0 30px rgba(251, 191, 36, 0.7)); }
          100% { transform: scale(1); filter: brightness(1); }
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        h2.title {
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #ffffff 40%, var(--wof-accent2) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p.subtitle {
          font-size: 15px;
          color: var(--wof-text-secondary);
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .wheel-stage-container {
          position: relative;
          max-width: 520px;
          margin: 0 auto 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wheel-stage {
          position: relative;
          width: 360px;
          height: 360px;
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        canvas.wheel-canvas {
          width: 360px;
          height: 360px;
          display: block;
          filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.65));
        }

        .pointer-arrow {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 44px;
          z-index: 10;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
          transform-origin: 50% 15%;
          transition: transform 0.08s ease-out;
          pointer-events: none;
        }
        .pointer-arrow.ticking {
          transform: translateX(-50%) rotate(-12deg);
        }
        .pointer-arrow svg {
          width: 36px;
          height: 44px;
          display: block;
          fill: var(--wof-pointer-color);
        }

        .center-hub-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 12;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          user-select: none;
          outline: none;
        }
        .center-hub-btn:hover:not(:disabled) {
          transform: translate(-50%, -50%) scale(1.05);
        }
        .center-hub-btn:active:not(:disabled) {
          transform: translate(-50%, -50%) scale(0.95);
        }
        .center-hub-btn:disabled {
          cursor: not-allowed;
        }

        /* Dedicated Side Turbo Pod */
        .turbo-side-pod {
          position: absolute;
          right: -14px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 15;
        }
        @media (max-width: 580px) {
          .turbo-side-pod {
            position: static;
            transform: none;
            margin: 14px auto 0 auto;
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

        .spin-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          max-width: 320px;
          padding: 16px 28px;
          background: linear-gradient(135deg, var(--wof-accent1) 0%, var(--wof-accent2) 100%);
          color: #0f172a;
          border: none;
          border-radius: 14px;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.5);
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          user-select: none;
          margin-bottom: 8px;
        }
        .spin-action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(245, 158, 11, 0.7);
        }
        .spin-action-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .spin-action-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .lead-box {
          display: none;
          margin-top: 24px;
          background: var(--wof-card-bg);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 18px;
          padding: 24px 20px;
          text-align: left;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .prize-banner {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .prize-icon { font-size: 28px; }
        .prize-text-wrap h4 { margin: 0; font-size: 16px; color: #fbbf24; font-weight: 800; }
        .prize-text-wrap p { margin: 2px 0 0 0; font-size: 13px; color: var(--wof-text-secondary); }

        .mandatory-warning {
          background: rgba(239, 68, 68, 0.12);
          border-left: 4px solid #ef4444;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #fca5a5;
          margin-bottom: 16px;
          line-height: 1.4;
          font-weight: 600;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        @media (max-width: 480px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--wof-text-secondary);
        }
        .form-group input {
          width: 100%;
          padding: 10px 12px;
          background: var(--wof-input-bg);
          border: 1px solid var(--wof-input-border);
          border-radius: 8px;
          color: var(--wof-text-primary);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          border-color: var(--wof-accent1);
        }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 12px;
          color: var(--wof-text-secondary);
          cursor: pointer;
          line-height: 1.4;
          text-align: left;
        }
        .checkbox-group input {
          margin-top: 2px;
          accent-color: var(--wof-accent1);
        }

        .claim-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
          transition: transform 0.15s;
          margin-top: 6px;
        }
        .claim-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .claim-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .success-box {
          display: none;
          margin-top: 24px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 18px;
          padding: 24px 20px;
          text-align: center;
          animation: slideUp 0.35s ease-out;
        }
        .success-icon { font-size: 40px; margin-bottom: 8px; }
        .success-title { font-size: 20px; font-weight: 900; color: #a7f3d0; margin: 0 0 8px 0; }
        .success-desc { font-size: 14px; color: #d1fae5; margin: 0 0 16px 0; line-height: 1.5; white-space: pre-line; }

        .voucher-preview-box {
          margin: 16px auto;
          max-width: 520px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(251, 191, 36, 0.6);
          background: #000;
        }
        .voucher-preview-img { width: 100%; height: auto; display: block; }

        .download-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          color: #0f172a;
          font-weight: 800;
          font-size: 15px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
          transition: transform 0.15s;
          margin-top: 10px;
        }
        .download-action-btn:hover { transform: translateY(-2px); }

        .limit-box {
          display: none;
          margin-top: 20px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }
  `;
}

// 1. Fix public/wheel-widget.js
const widgetJsPath = path.join(__dirname, "../public/wheel-widget.js");
let widgetJs = fs.readFileSync(widgetJsPath, "utf8");
widgetJs = widgetJs.replace(/<style>[\s\S]*?<\/style>/, `<style>${getCompleteCss()}</style>`);
fs.writeFileSync(widgetJsPath, widgetJs);

// 2. Fix public/widget-standalone.html
const standalonePath = path.join(__dirname, "../public/widget-standalone.html");
let standaloneHtml = fs.readFileSync(standalonePath, "utf8");
standaloneHtml = standaloneHtml.replace(/<script>[\s\S]*?<\/script>/, `<script>\n${widgetJs}\n</script>`);
fs.writeFileSync(standalonePath, standaloneHtml);

// 3. Fix src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx
const widgetTsxPath = path.join(__dirname, "../src/extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx");
let widgetTsx = fs.readFileSync(widgetTsxPath, "utf8");
widgetTsx = widgetTsx.replace(/<style>[\s\S]*?<\/style>/, `<style>${getCompleteCss()}</style>`);
fs.writeFileSync(widgetTsxPath, widgetTsx);

console.log("SUCCESS: Restored complete, perfectly proportioned, responsive CSS with wind effects and locked center hub!");
